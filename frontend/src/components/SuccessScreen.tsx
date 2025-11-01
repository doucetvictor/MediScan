import { CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface UploadResponse {
  case_id?: string;
  file_url?: string;
  ai_comments?: string;
  inform_doctor?: { success: boolean; target?: string };
  inform_patient?: { success: boolean; target?: string };
}

interface SuccessScreenProps {
  uploadResponse: UploadResponse | null;
  onReset: () => void;
}

export function SuccessScreen({ uploadResponse, onReset }: SuccessScreenProps) {
  return (
    <Card className='upload-card'>
      <CardHeader className='text-center pb-4'>
        <div className='flex justify-center mb-4'>
          <div className='relative'>
            <CheckCircle2
              size={80}
              className='text-primary animate-in fade-in zoom-in duration-500'
            />
            <Sparkles
              size={30}
              className='absolute -top-2 -right-2 text-primary animate-pulse'
            />
          </div>
        </div>
        <CardTitle className='text-2xl mb-2'>Upload Successful!</CardTitle>
        <CardDescription>
          Your medical document has been processed and sent successfully
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          {/* Doctor Notification */}
          {uploadResponse?.inform_doctor?.success &&
            uploadResponse.inform_doctor.target && (
              <div className='flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20'>
                <Mail size={24} className='text-primary' />
                <div className='flex-1'>
                  <div className='font-semibold text-base'>Doctor Notified</div>
                  <div className='text-sm text-muted-foreground'>
                    {uploadResponse.inform_doctor.target}
                  </div>
                </div>
                <CheckCircle2 size={20} className='text-primary' />
              </div>
            )}

          {/* Patient Notification */}
          {uploadResponse?.inform_patient?.success &&
            uploadResponse.inform_patient.target && (
              <div className='flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20'>
                <Mail size={24} className='text-primary' />
                <div className='flex-1'>
                  <div className='font-semibold text-base'>
                    Patient Notified
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {uploadResponse.inform_patient.target}
                  </div>
                </div>
                <CheckCircle2 size={20} className='text-primary' />
              </div>
            )}
        </div>

        <div className='pt-4 border-t'>
          <Button onClick={onReset} className='w-full' variant='outline'>
            Upload Another Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
