import * as z from 'zod';

export const patientSchema = z.object({
  case_id: z.string().min(1, 'Case ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
  user_type: z.string().min(1, 'User type is required'),
});

// Schema for laboratories - according to Doctobuck API
export const laboratorySchema = z.object({
  // Origin (Laboratory)
  origin: z.object({
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

export type LaboratoryFormData = z.infer<typeof laboratorySchema>;
export type PatientFormData = z.infer<typeof patientSchema>;
