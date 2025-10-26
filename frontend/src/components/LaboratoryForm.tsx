import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FileText, FolderOpen, Check } from 'lucide-react';
import { laboratorySchema, type LaboratoryFormData } from '../schema';

interface LaboratoryFormProps {
  onSubmit: (data: LaboratoryFormData) => Promise<void>;
  uploading: boolean;
}

export function LaboratoryForm({ onSubmit, uploading }: LaboratoryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<LaboratoryFormData>({
    resolver: zodResolver(laboratorySchema),
    defaultValues: {
      patientEmail: '',
      doctorEmail: '',
      file: undefined,
    },
  });

  return (
    <Card className='upload-card'>
      <CardHeader>
        <CardTitle>Upload Medical Documents</CardTitle>
        <CardDescription>
          Upload blood test results for a patient. The consultation code will be
          sent to the patient and doctor emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='patientEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='patient@email.com'
                      autoComplete='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='doctorEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='doctor@clinic.com'
                      autoComplete='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='file'
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel>Medical Document PDF</FormLabel>
                  <FormControl>
                    <div className='file-upload'>
                      <Input
                        ref={fileInputRef}
                        type='file'
                        accept='application/pdf'
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        className='file-input'
                      />
                      <div className='file-display'>
                        <div className='file-icon'>
                          {value ? (
                            <FileText size={24} />
                          ) : (
                            <FolderOpen size={24} />
                          )}
                        </div>
                        <div className='file-info'>
                          <span className='file-name'>
                            {value ? value.name : 'No file selected'}
                          </span>
                          <span className='file-details'>
                            {value ? (
                              <>
                                <span className='file-size'>
                                  {(value.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <span className='file-type'>PDF Document</span>
                              </>
                            ) : (
                              'Click to select PDF file'
                            )}
                          </span>
                        </div>
                        {value && (
                          <div className='file-status'>
                            <span className='status-badge'>
                              <Check size={16} />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
