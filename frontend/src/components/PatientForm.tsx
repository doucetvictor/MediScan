import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { patientSchema, type PatientFormData } from '../schema';

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => Promise<void>;
  uploading: boolean;
}

export function PatientForm({ onSubmit, uploading }: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      consultationCode: '',
    },
  });

  return (
    <Card className='upload-card'>
      <CardHeader>
        <CardTitle>View Test Results</CardTitle>
        <CardDescription>
          Enter your consultation code to access your blood test results and
          medical reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='consultationCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consultation Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your consultation code'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={uploading}>
              {uploading ? 'Loading...' : 'View Results'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
