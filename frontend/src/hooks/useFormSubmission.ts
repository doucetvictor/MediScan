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

    const formData = new FormData();
    formData.append('type', 'laboratory');
    formData.append('patientEmail', data.patientEmail);
    formData.append('doctorEmail', data.doctorEmail);
    formData.append('file', data.file);

    try {
      setUploading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed (${res.status})`);
      }
      const json = await res
        .json()
        .catch(() => ({ message: 'Upload successful' }));
      setStatus(json.message || 'Upload successful');
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
