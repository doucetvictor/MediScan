import * as z from 'zod';

// Schema for patients - consultation code with user info
export const patientSchema = z.object({
  consultationCode: z.string().min(1, 'Consultation code is required'),
});

// Schema for laboratories - according to Doctobuck API
export const laboratorySchema = z.object({
  // Origin (Laboratory)
  origin: z.object({
    id: z.string().min(1, 'Origin ID is required'),
    company_name: z.string().min(1, 'Company name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone number is required'),
  }),
  // Doctor
  doctor: z.object({
    firstname: z.string().min(1, 'Doctor first name is required'),
    lastname: z.string().min(1, 'Doctor last name is required'),
    email: z.string().email('Please enter a valid doctor email address'),
    phone: z.string().min(1, 'Doctor phone number is required'),
  }),
  // Patient
  patient: z.object({
    firstname: z.string().min(1, 'Patient first name is required'),
    lastname: z.string().min(1, 'Patient last name is required'),
    email: z.string().email('Please enter a valid patient email address'),
    phone: z.string().min(1, 'Patient phone number is required'),
  }),
  // File
  file: z
    .instanceof(File, { message: 'Please select a PDF file' })
    .refine(
      (file) => file.type === 'application/pdf',
      'Only PDF files are allowed'
    ),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type LaboratoryFormData = z.infer<typeof laboratorySchema>;
