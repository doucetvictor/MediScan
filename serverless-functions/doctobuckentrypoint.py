import os
import functions_framework
from flask import make_response, jsonify, request
from google.cloud import storage
import uuid
import json
import psycopg2
import requests
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import io

from dotenv import load_dotenv
load_dotenv()

BUCKET_NAME = os.environ["BUCKET_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_NAME = os.environ["DB_NAME"]
DB_HOST = os.environ["DB_HOST"]
APP_BASE_URL = os.environ["APP_BASE_URL"]
PROJECT_ID = os.environ["PROJECT_ID"]
LOCATION = os.environ["LOCATION"]
MODEL_NAME = os.environ["MODEL_NAME"]

vertexai.init(project=PROJECT_ID, location=LOCATION)
model = GenerativeModel(MODEL_NAME)

def _db():
    return psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST
    )

def parse_request(req):
    file = None
    if req.content_type and req.content_type.startswith('multipart/form-data'):
        file = req.files.get('file')
    request_json = None
    if req.is_json:
        request_json = req.get_json(silent=True)
    else:
        if 'data' in req.form:
            try:
                request_json = json.loads(req.form['data'])
            except json.JSONDecodeError:
                return None, file, {"error": "Invalid JSON in 'data' field"}
    return request_json, file, None

def validate_request(request_json, file):
    if not request_json:
        return {"error": "Missing JSON body"}
    mandatory_fields = ['case_no', 'origin', 'doctor', 'patient']
    missing_fields = [f for f in mandatory_fields if f not in request_json]
    if missing_fields:
        return {"error": "Missing mandatory fields", "fields": missing_fields}
    if not file:
        return {"error": "Missing file"}
    if not file.filename.lower().endswith('.pdf'):
        return {"error": "File must be a PDF"}
    return None

def upload_file_to_gcs(file):
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    original_filename = (file.filename or "").strip()
    ext = ""
    if "." in original_filename:
        ext = "." + original_filename.rsplit(".", 1)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    destination_blob_name = f"uploads/{unique_filename}"
    blob = bucket.blob(destination_blob_name)
    
    file.seek(0)
    blob.upload_from_file(file, content_type=file.content_type)
    
    return f"gs://{BUCKET_NAME}/{destination_blob_name}", destination_blob_name

def analyze_pdf_with_gemini(gcs_uri, max_chars=8192):
    """
    Analyse un PDF via Vertex AI Gemini et retourne un commentaire limité à max_chars caractères.
    """
    try:
        pdf_file = Part.from_uri(
            uri=gcs_uri,
            mime_type="application/pdf"
        )
        
        prompt_text = f"""
Tu es un médecin clinicien et biologiste médical. Tu analyses un **rapport d’analyses médicales (PDF)**.
Rédige ton commentaire en **français**, clair pour le patient mais rigoureux pour un soignant.

Objectif
- Expliquer **ce qui va bien** et **ce qui ne va pas**, de façon structurée et actionnable.
- Mettre fortement en évidence les **valeurs hors-norme** et leur **priorité**.
- Ne JAMAIS inventer d’information absente du document. Si une donnée n’est pas indiquée, écris-le explicitement.

Règles d’interprétation (TRÈS IMPORTANT)
1) Utilise en priorité les **plages de référence** (RI) affichées dans le rapport.  
   - Si une RI manque : écris « plage de référence non indiquée » (n’invente pas).
   - Garde systématiquement les **unités** exactes du document.
2) Marque les anomalies avec des flèches et un niveau :  
   - « ↑ » = au-dessus de la borne haute ; « ↓ » = en dessous de la borne basse.  
   - **Priorité haute** si l’écart est > 20% de la largeur de la RI ou si le rapport signale un seuil critique.  
   - Sinon **priorité modérée**.
3) Classe les anomalies par **ordre de priorité**, de la plus préoccupante à la moins importante.
4) Reste prudent : **pas de diagnostic définitif**. Propose des **pistes possibles** et des **recommandations générales** de suivi/contrôle.
5) Si incohérences (unités différentes pour le même test, doublons, valeurs manquantes), signale-les en fin de note.

Structure attendue (respecte exactement ces sections)
1. **Vue d’ensemble (4 phrases max)** : résumé très bref du profil global des résultats.
2. **Ce qui va bien ** : liste courte des panels/tests notables dans la norme (ex.: hémogramme globalement normal, fonction rénale dans la norme…).
3. **Ce qui mérite attention  (priorisé)** :
   - Pour chaque test anormal, une ligne au format :
     - **Nom du test** - valeur unite (RI: a–b) **↑/↓** - **Priorité : haute/modérée** - courte explication clinique (10–20 mots).
4. **Détails des résultats** (synthèse par panels) :
   - Hématologie : … (reprends valeurs clés avec unités et RI du rapport)
   - Biochimie : …
   - Hormones / Sérologies / Autres : …
5. **Interprétation clinique prudente** : 2–4 puces reliant les anomalies principales à des **hypothèses fréquentes** vs **hypothèses plus sérieuses** (sans conclure).
6. **Recommandations** :
   - Actions générales (ex.: recontrôle ciblé, vérification prélèvement/jeûne, discussion avec le médecin traitant).
   - Quand agir rapidement : si le rapport indique des seuils critiques ou si symptômes d’alerte, conseiller **contact médical rapide**.
7. **Limites & qualité du document** : mentionne données manquantes, RI absentes, unités incohérentes, etc.
8. **Disclaimer** (obligatoire, en 2 lignes) :
   - Analyse automatisée à visée éducative, ne remplace pas un professionnel de santé.

Contraintes de style
- Langage simple, **ton empathique et professionnel**.
- Cite toujours **valeur + unité + RI** quand elles sont présentes.
- Utilise la mise en évidence en **gras** avec parcimonie pour les points clés.
- Pas de tableaux lourds : listes claires et compactes.
- Longueur maximale : **8000 caractères**. Si besoin, résume ; conserve priorités, anomalies et recommandations.

Produis maintenant l’analyse selon ces règles et cette structure, en t’appuyant exclusivement sur les données du PDF fourni.
"""


        response = model.generate_content([pdf_file, prompt_text])
        ai_comment = response.text.strip()
        
        if len(ai_comment) > max_chars:
            ai_comment = ai_comment[:max_chars-3] + "..."
        
        return ai_comment
        
    except Exception as e:
        print(f"Erreur lors de l'analyse IA : {e}")
        return f"Erreur lors de l'analyse automatique : {str(e)}"

def insert_into_db(request_json, file_url, ai_comments):
    conn = _db()
    cur = conn.cursor()

    # patient
    p = request_json['patient']
    cur.execute("""
        INSERT INTO patients (firstname, lastname, email, phone)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (email) DO UPDATE
        SET firstname = EXCLUDED.firstname,
            lastname = EXCLUDED.lastname,
            phone = EXCLUDED.phone
        RETURNING patient_id
    """, (p.get('firstname'), p.get('lastname'), p.get('email'), p.get('phone')))
    patient_id = cur.fetchone()[0]

    # doctor
    d = request_json['doctor']
    cur.execute("""
        INSERT INTO doctors (firstname, lastname, email, phone)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (email) DO UPDATE
        SET firstname = EXCLUDED.firstname,
            lastname = EXCLUDED.lastname,
            phone = EXCLUDED.phone
        RETURNING doctor_id
    """, (d.get('firstname'), d.get('lastname'), d.get('email'), d.get('phone')))
    doctor_id = cur.fetchone()[0]

    origin = json.dumps(request_json['origin'])
    cur.execute("""
        INSERT INTO files (origin, file_url)
        VALUES (%s, %s)
        RETURNING file_id
    """, (origin, file_url))
    file_id = cur.fetchone()[0]

    cur.execute("""
        INSERT INTO analyses (case_no, related_file_id, doctor_id, patient_id, ai_comments)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING case_id
    """, (request_json['case_no'], file_id, doctor_id, patient_id, ai_comments))
    case_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return {
        "case_id": str(case_id),
        "file_id": str(file_id),
        "patient_id": str(patient_id),
        "doctor_id": str(doctor_id),
        "file_url": file_url,
        "ai_comments": ai_comments
    }

def get_patient_secret_key(patient_id):
    conn = _db()
    cur = conn.cursor()
    cur.execute("SELECT secret_key FROM patients WHERE patient_id = %s", (patient_id,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return str(row[0]) if row and row[0] else None

def get_doctor_secret_key(doctor_id):
    conn = _db()
    cur = conn.cursor()
    cur.execute("SELECT secret_key FROM doctors WHERE doctor_id = %s", (doctor_id,))
    row = cur.fetchone()
    cur.close(); conn.close()
    return str(row[0]) if row and row[0] else None

def send_introduction_email(result, email):
    mailer_svc_url = "https://doctomailer-1062594341429.europe-west9.run.app"
    body = """
    Hello,

    I'm Doctor Duck, your personal assistant, I can help you deal with your analysis.

    I'll keep you posted, when my comments come out.

    Cheers,
    Kindly,
    Dr. Duck

    *** DISCLAIMER ***
    This project is intended for educational purposes only.
    Any advice, suggestions, or comments provided here should not be taken as professional guidance.
    Please consult a qualified expert or professional for any real-world decisions or actions
    """
    payload = {"target_email": email, "subject": "Analysis Report", "body": body}
    try:
        r = requests.post(mailer_svc_url, json=payload, timeout=10)
        success = r.ok
    except Exception:
        success = False
    result["send_introduction_email"] = {"target": email, "success": success}
    return result

def inform_x(result, user_type, case_id, email, user_id):
    mailer_svc_url = "https://doctomailer-1062594341429.europe-west9.run.app"
    if user_type == "patient":
        secret_key = get_patient_secret_key(user_id)
    else:
        secret_key = get_doctor_secret_key(user_id)
    secret_key = secret_key or ""
    body = f"""
    Hello,

    I'm Doctor Duck, the analysis just came out.
    Here is the link for accessing, just press on it.

    File is avaiblable just here : {APP_BASE_URL}/?viewer={case_id}&user_id={user_id}&user_type={user_type}&secret_key={secret_key}&request=file
    And my feedbacks are written below : {APP_BASE_URL}/?viewer={case_id}&user_id={user_id}&user_type={user_type}&secret_key={secret_key}&request=ai_comments

    Cheers,
    Kindly,
    Dr. Duck

    *** DISCLAIMER ***
    This project is intended for educational purposes only.
    Any advice, suggestions, or comments provided here should not be taken as professional guidance.
    Please consult a qualified expert or professional for any real-world decisions or actions
    """
    payload = {"target_email": email, "subject": "Analysis Report", "body": body}
    try:
        r = requests.post(mailer_svc_url, json=payload, timeout=10)
        success = r.ok
    except Exception:
        success = False
    result[f"inform_{user_type}"] = {"target": email, "success": success}
    return result

@functions_framework.http
def entrypoint(req):
    """
    Point d'entrée HTTPS unique qui :
    1. Reçoit le PDF
    2. L'upload sur GCS
    3. L'analyse avec Gemini AI
    4. Stocke tout en BDD
    5. Envoie les emails
    """
    request_json, file, parse_error = parse_request(req)
    if parse_error:
        return make_response(jsonify(parse_error), 400)

    validation_error = validate_request(request_json, file)
    if validation_error:
        return make_response(jsonify(validation_error), 400)

    try:
        file_url, blob_name = upload_file_to_gcs(file)
        print(f"Fichier uploadé : {file_url}")
    except Exception as e:
        return make_response(jsonify({"error": f"File upload failed: {str(e)}"}), 500)

    try:
        print(f"Début de l'analyse IA pour : {file_url}")
        ai_comments = analyze_pdf_with_gemini(file_url, max_chars=8192)
        print(f"Analyse IA terminée. Longueur : {len(ai_comments)} caractères")
    except Exception as e:
        print(f"Erreur lors de l'analyse IA : {e}")
        ai_comments = f"Erreur lors de l'analyse automatique : {str(e)}"

    try:
        result = insert_into_db(request_json, file_url, ai_comments)
        print(f"Données insérées en BDD : case_id={result['case_id']}")
    except Exception as e:
        return make_response(jsonify({"error": f"Database insert failed: {str(e)}"}), 500)

    try:
        patient_data = request_json['patient']
        result = send_introduction_email(result, patient_data.get('email'))
    except Exception as e:
        print(f"Erreur envoi email introduction : {e}")

    try:
        patient_data = request_json['patient']
        result = inform_x(
            result=result, user_type="patient",
            case_id=result.get('case_id'),
            email=patient_data.get('email'),
            user_id=result.get('patient_id')
        )
    except Exception as e:
        print(f"Erreur envoi email patient : {e}")

    try:
        doctor_data = request_json['doctor']
        result = inform_x(
            result=result, user_type="doctor",
            case_id=result.get('case_id'),
            email=doctor_data.get('email'),
            user_id=result.get('doctor_id')
        )
    except Exception as e:
        print(f"Erreur envoi email doctor : {e}")

    return make_response(jsonify(result), 200)