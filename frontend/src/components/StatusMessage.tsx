import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StatusMessageProps {
  status: string | null;
  error: string | null;
  onClose?: () => void;
}

export function StatusMessage({ status, error, onClose }: StatusMessageProps) {
  const isOpen = !!(status || error);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose ? () => onClose() : undefined}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {status && (
              <>
                <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                Success
              </>
            )}
            {error && (
              <>
                <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                Error
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='whitespace-pre-line'>
          {status || error}
        </DialogDescription>
        {onClose && (
          <div className='flex justify-end mt-4'>
            <Button onClick={onClose} variant='outline' size='sm'>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
