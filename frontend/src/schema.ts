import * as z from 'zod';

// Schema for patients - just a consultation code
export const patientSchema = z.object({
  consultationCode: z.string().min(1, 'Consultation code is required'),
});

// Schema for laboratories - patient email + doctor email + file
export const laboratorySchema = z.object({
  patientEmail: z.email('Please enter a valid patient email address'),
  doctorEmail: z.email('Please enter a valid doctor email address'),
  file: z
    .instanceof(File, { message: 'Please select a PDF file' })
    .refine(
      (file) => file.type === 'application/pdf',
      'Only PDF files are allowed'
    ),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type LaboratoryFormData = z.infer<typeof laboratorySchema>;
