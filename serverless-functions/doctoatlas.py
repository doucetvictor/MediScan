import os
import functions_framework
from flask import make_response, jsonify, request
import psycopg2
from google.cloud import storage
from urllib.parse import urlparse
import datetime

from dotenv import load_dotenv
load_dotenv()

DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_NAME = os.environ["DB_NAME"]
DB_HOST = os.environ["DB_HOST"]

def _db():
    return psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST
    )

def _parse_gs_url(gs_url: str):
    """
    Parse gs://bucket/object into (bucket_name, blob_name). Returns (None, None) if invalid.
    """
    if not gs_url or not gs_url.startswith("gs://"):
        return None, None
    parsed = urlparse(gs_url.replace("gs://", "gs:///", 1))
    path = parsed.path.lstrip("/")
    if "/" not in path:
        return None, None
    return path.split("/", 1)

def _download_gs_file(gs_url: str):
    """
    Download a GCS object and return (bytes, filename, content_type).
    Requires the function's service account to have storage.objectViewer on the bucket.
    """
    bucket_name, blob_name = _parse_gs_url(gs_url)
    if not bucket_name:
        raise ValueError("Invalid gs:// URL")

    client = storage.Client()
    blob = client.bucket(bucket_name).blob(blob_name)

    data = blob.download_as_bytes()
    content_type = blob.content_type or "application/octet-stream"
    filename = blob.name.rsplit("/", 1)[-1] or "file"

    return data, filename, content_type

def _verify(cur, case_id: str, user_id: str, user_type: str, provided_secret: str):
    cur.execute("""
        SELECT a.case_id, a.patient_id, a.doctor_id, a.ai_comments, f.file_url
        FROM analyses a
        LEFT JOIN files f ON f.file_id = a.related_file_id
        WHERE a.case_id = %s
    """, (case_id,))
    row = cur.fetchone()
    if not row:
        return None, {"code": "NOT_FOUND", "error": "Analysis not found"}
    _, a_patient_id, a_doctor_id, ai_comments, file_url = row

    if user_type == "patient":
        if str(user_id) != str(a_patient_id):
            return None, {"code": "FORBIDDEN", "error": "User not linked to this analysis"}
        cur.execute("SELECT secret_key FROM patients WHERE patient_id = %s", (user_id,))
    elif user_type == "doctor":
        if str(user_id) != str(a_doctor_id):
            return None, {"code": "FORBIDDEN", "error": "User not linked to this analysis"}
        cur.execute("SELECT secret_key FROM doctors WHERE doctor_id = %s", (user_id,))
    else:
        return None, {"code": "BAD_REQUEST", "error": "Invalid user_type (use 'patient' or 'doctor')"}

    sec = cur.fetchone()
    if not sec or not sec[0] or str(sec[0]) != str(provided_secret):
        return None, {"code": "FORBIDDEN", "error": "Invalid credentials"}

    return {"ai_comments": ai_comments or "", "file_url": file_url}, None

@functions_framework.http
def atlas_entrypoint(req):
    case_id     = req.args.get("viewer")
    user_id     = req.args.get("user_id")
    user_type   = req.args.get("user_type")
    secret_key  = req.args.get("secret_key")
    request_type = (req.args.get("request") or "").strip().lower()

    if not all([case_id, user_id, user_type, secret_key, request_type]):
        return make_response(jsonify({
            "code": "BAD_REQUEST",
            "error": "Missing query params: viewer, user_id, user_type, secret_key, request"
        }), 400)

    if request_type not in ("ai_comments", "file"):
        return make_response(jsonify({
            "code": "BAD_REQUEST",
            "error": "Invalid 'request' value. Use 'ai_comments' or 'file'."
        }), 400)

    conn = cur = None
    try:
        conn = _db()
        cur = conn.cursor()

        data, err = _verify(cur, case_id, user_id, user_type, secret_key)
        if err:
            status = 404 if err["code"] == "NOT_FOUND" else (400 if err["code"] == "BAD_REQUEST" else 403)
            return make_response(jsonify(err), status)

        if request_type == "ai_comments":
            return make_response(jsonify({
                "case_id": case_id,
                "user_id": user_id,
                "user_type": user_type,
                "ai_comments": data["ai_comments"]
            }), 200)

        if not data.get("file_url"):
            return make_response(jsonify({
                "code": "NOT_FOUND",
                "error": "No file available for this analysis"
            }), 404)

        try:
            file_bytes, filename, content_type = _download_gs_file(data["file_url"])
        except Exception as e:
            return make_response(jsonify({
                "code": "SERVER_ERROR",
                "error": f"Failed to download file: {str(e)}"
            }), 500)

        resp = make_response(file_bytes, 200)
        resp.headers["Content-Type"] = content_type
        resp.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        resp.headers["Cache-Control"] = "no-store"
        return resp

    except Exception as e:
        return make_response(jsonify({"code": "SERVER_ERROR", "error": str(e)}), 500)
    finally:
        try:
            if cur: cur.close()
            if conn: conn.close()
        except Exception:
            pass
