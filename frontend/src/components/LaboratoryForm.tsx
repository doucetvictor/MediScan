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
import {
  FileText,
  FolderOpen,
  Check,
  Building2,
  Stethoscope,
  User,
} from 'lucide-react';
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
      origin: {
        id: '',
        company_name: '',
        email: '',
        phone: '',
      },
      doctor: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
      },
      patient: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
      },
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
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {/* Laboratory Section */}
              <div className='space-y-5'>
                <div className='flex items-center gap-2 mb-4 pb-2 border-b'>
                  <Building2 size={18} className='text-primary' />
                  <h4 className='text-lg font-semibold'>Laboratory</h4>
                </div>
                <FormField
                  control={form.control}
                  name='origin.company_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratory Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Laboratory name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='origin.id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin ID</FormLabel>
                      <FormControl>
                        <Input placeholder='Laboratory ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='origin.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder='+33...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='origin.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='laboratory@email.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Doctor Section */}
              <div className='space-y-5'>
                <div className='flex items-center gap-2 mb-4 pb-2 border-b'>
                  <Stethoscope size={18} className='text-primary' />
                  <h4 className='text-lg font-semibold'>Doctor</h4>
                </div>
                <FormField
                  control={form.control}
                  name='doctor.firstname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='First name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='doctor.lastname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='doctor.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='doctor@email.com'
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
                  name='doctor.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder='+33...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Patient Section */}
              <div className='space-y-5'>
                <div className='flex items-center gap-2 mb-4 pb-2 border-b'>
                  <User size={18} className='text-primary' />
                  <h4 className='text-lg font-semibold'>Patient</h4>
                </div>
                <FormField
                  control={form.control}
                  name='patient.firstname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='First name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='patient.lastname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='patient.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                  name='patient.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder='+33...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
