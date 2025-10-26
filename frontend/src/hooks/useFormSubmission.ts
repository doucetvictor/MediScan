import { useState } from 'react';
import type { PatientFormData, LaboratoryFormData } from '../schema';

export function useFormSubmission() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const onSubmitPatient = async (data: PatientFormData) => {
    setError(null);
    setStatus(null);

    try {
      setUploading(true);
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'patient',
          consultationCode: data.consultationCode,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Consultation failed (${res.status})`);
      }
      const json = await res
        .json()
        .catch(() => ({ message: 'Consultation successful' }));
      setStatus(json.message || 'Consultation successful');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const onSubmitLaboratory = async (data: LaboratoryFormData) => {
    setError(null);
    setStatus(null);

    // Prepare data according to Doctobuck API
    const caseData = {
      case_no: `CASE-${Date.now()}`,
      origin: {
        id: data.origin.id,
        company_name: data.origin.company_name,
        email: data.origin.email,
        phone: data.origin.phone,
      },
      doctor: {
        firstname: data.doctor.firstname,
        lastname: data.doctor.lastname,
        email: data.doctor.email,
        phone: data.doctor.phone,
      },
      patient: {
        firstname: data.patient.firstname,
        lastname: data.patient.lastname,
        email: data.patient.email,
        phone: data.patient.phone,
      },
    };

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('data', JSON.stringify(caseData));

    try {
      setUploading(true);
      const res = await fetch(
        'https://doctobuckentrypoint-1062594341429.europe-west9.run.app',
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed (${res.status})`);
      }
      const json = await res.json();

      // Format the response nicely
      let successMessage = '✅ Upload successful!\n\n';
      successMessage += `📋 Case ID: ${json.case_id}\n`;

      if (json.inform_doctor?.success && json.inform_doctor?.target) {
        successMessage += `✉️ Doctor notified: ${json.inform_doctor.target}\n`;
      }
      if (json.inform_patient?.success && json.inform_patient?.target) {
        successMessage += `✉️ Patient notified: ${json.inform_patient.target}\n`;
      }

      if (json.ai_comments) {
        const preview = json.ai_comments.substring(0, 200);
        successMessage += `\n📝 AI Analysis Preview:\n${preview}...`;
      }

      setStatus(successMessage);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    status,
    error,
    uploading,
    onSubmitPatient,
    onSubmitLaboratory,
  };
}
