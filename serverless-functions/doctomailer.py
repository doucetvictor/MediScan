import os
import functions_framework
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import jsonify, request

from dotenv import load_dotenv
load_dotenv()


def validate(body):
    mandatory_fields = ["target_email", "subject", "body"]
    for mf in mandatory_fields:
        if mf not in body:
            return False, f"Missing mandatory field: {mf}"
    return True, ""

def send_email(to_email, subject, body_text):
    SMTP_SERVER = os.environ["SMTP_SERVER"]
    SMTP_PORT = int(os.environ["SMTP_PORT"])
    SMTP_USERNAME = os.environ["SMTP_USERNAME"]
    SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body_text, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@functions_framework.http
def hello_http(request):
    """HTTP Cloud Function to send an email."""
    request_json = request.get_json(silent=True)

    if not request_json:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400

    valid, error_msg = validate(request_json)
    if not valid:
        return jsonify({"success": False, "error": error_msg}), 400

    target_email = request_json["target_email"]
    subject = request_json["subject"]
    body_text = request_json["body"]

    success = send_email(target_email, subject, body_text)

    return jsonify({"success": success})
