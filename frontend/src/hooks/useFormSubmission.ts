import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import type { PatientFormData, LaboratoryFormData } from '../schema';

// Configure axios with timeout
const axiosInstance = axios.create({
  // 8 minutes timeout
  timeout: 8 * 60 * 1000,
});

interface UploadResponse {
  case_id?: string;
  file_url?: string;
  ai_comments?: string;
  inform_doctor?: { success: boolean; target?: string };
  inform_patient?: { success: boolean; target?: string };
  doctor_id?: string;
  patient_id?: string;
  file_id?: string;
}

interface PatientResponse {
  ai_comments?: string;
  file_url?: string;
  case_id?: string;
  [key: string]: string | number | boolean | undefined;
}

export function useFormSubmission() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(
    null
  );
  const [patientResponse, setPatientResponse] =
    useState<PatientResponse | null>(null);

  const onSubmitPatient = async (data: PatientFormData) => {
    setError(null);
    setStatus(null);
    setPatientResponse(null);

    try {
      setUploading(true);
      const res = await axiosInstance.get(
        'https://doctoatlas-1062594341429.europe-west9.run.app/',
        {
          params: {
            viewer: data.case_id,
            user_id: data.user_id,
            secret_key: data.password,
            request: 'ai_comments',
            user_type: data.user_type,
          },
        }
      );

      // Store the full response with form data for file download
      const responseData = {
        ...res.data,
        viewer: data.case_id,
        user_id: data.user_id,
        secret_key: data.password,
        user_type: data.user_type,
      };
      setPatientResponse(responseData);

      setStatus(res.data.ai_comments || 'Consultation successful');
    } catch (err: unknown) {
      let errorMessage = 'An error occurred while fetching your results.';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. The server is taking too long to respond. Please try again.';
        } else if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const data = err.response.data;

          if (status === 400) {
            errorMessage = 'Invalid request. Please check your credentials and try again.';
          } else if (status === 401) {
            errorMessage = 'Unauthorized. Please verify your user ID, password, and user type.';
          } else if (status === 403) {
            errorMessage = 'Access forbidden. You do not have permission to view these results.';
          } else if (status === 404) {
            errorMessage = 'Results not found. Please verify your case ID.';
          } else if (status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage =
              typeof data === 'string'
                ? data
                : data?.message || `Request failed with status ${status}`;
          }
        } else if (err.request) {
          // Request was made but no response received
          errorMessage =
            'Network error. Please check your internet connection and try again.';
        } else {
          // Error setting up request
          errorMessage = err.message || 'An error occurred while making the request.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const onSubmitLaboratory = async (data: LaboratoryFormData) => {
    setError(null);
    setStatus(null);

    // Check if file exists
    if (!data.file) {
      setError('Please select a PDF file to upload');
      alert('Please select a PDF file to upload');
      return;
    }

    const caseData = {
      case_no: uuidv4(),
      origin: {
        id: uuidv4(),
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

    console.log('Case data:', caseData);

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('data', JSON.stringify(caseData));

    // Log FormData contents
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      setUploading(true);
      console.log('Sending request to Doctobuck API...');
      const res = await axiosInstance.post(
        'https://doctobuckentrypoint-1062594341429.europe-west9.run.app',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const json = res.data;

      // Store the full response
      setUploadResponse(json);

      // Format the response nicely
      let successMessage = 'Upload successful!\n\n';
      successMessage += `Case ID: ${json.case_id}\n`;

      if (json.inform_doctor?.success && json.inform_doctor?.target) {
        successMessage += `Doctor notified: ${json.inform_doctor.target}\n`;
      }
      if (json.inform_patient?.success && json.inform_patient?.target) {
        successMessage += `Patient notified: ${json.inform_patient.target}\n`;
      }

      if (json.ai_comments) {
        const preview = json.ai_comments.substring(0, 200);
        successMessage += `\nAI Analysis Preview:\n${preview}...`;
      }
      setStatus(successMessage);

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err: unknown) {
      let errorMessage = 'An error occurred while uploading the document.';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage =
            'Upload timeout. The file may be too large or the server is taking too long. Please try again with a smaller file.';
        } else if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const data = err.response.data;

          if (status === 400) {
            errorMessage =
              'Invalid request. Please check all form fields and ensure the file is a valid PDF.';
          } else if (status === 413) {
            errorMessage =
              'File too large. Please upload a smaller PDF file (max size recommended: 10MB).';
          } else if (status === 415) {
            errorMessage =
              'Unsupported file type. Please upload a PDF file only.';
          } else if (status === 500) {
            errorMessage =
              'Server error while processing your upload. Please try again later.';
          } else if (status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage =
              typeof data === 'string'
                ? data
                : data?.message || data?.error || `Upload failed (${status})`;
          }
        } else if (err.request) {
          // Request was made but no response received
          errorMessage =
            'Network error. Please check your internet connection and try again.';
        } else {
          // Error setting up request
          errorMessage = err.message || 'An error occurred while making the request.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetStatus = () => {
    setStatus(null);
    setError(null);
    setUploadResponse(null);
    setPatientResponse(null);
  };

  return {
    status,
    error,
    uploading,
    uploadResponse,
    patientResponse,
    onSubmitPatient,
    onSubmitLaboratory,
    resetStatus,
  };
}
