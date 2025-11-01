import { CheckCircle2, Sparkles, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import React from 'react';

interface PatientResponse {
  ai_comments?: string;
  file_url?: string;
  case_id?: string;
  viewer?: string;
  user_id?: string;
  secret_key?: string;
  user_type?: string;
  [key: string]: string | number | boolean | undefined;
}

interface PatientSuccessScreenProps {
  response: PatientResponse | null;
  onReset: () => void;
}

export function PatientSuccessScreen({
  response,
  onReset,
}: PatientSuccessScreenProps) {
  const [downloading, setDownloading] = useState(false);

  // Clean markdown formatting (remove all *)
  const cleanMarkdown = (text: string): string => {
    return text.replace(/\*/g, '').trim();
  };

  // Parse and render medical results in a readable format
  const renderMedicalResults = (
    comments: string | undefined
  ): React.ReactNode => {
    if (!comments) return null;

    // Clean markdown formatting first
    const cleanedComments = cleanMarkdown(comments);

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(cleanedComments);

      // Handle object with medical data
      if (typeof parsed === 'object' && parsed !== null) {
        const entries = Object.entries(parsed);

        return (
          <div className='space-y-1'>
            {entries.map(([key, value]) => {
              // Format key: handle French-English format "Key (English):"
              const formattedKey = cleanMarkdown(
                key
                  .replace(/_/g, ' ')
                  .replace(/([A-Z])/g, ' $1')
                  .trim()
                  .split(' ')
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(' ')
              );

              // Format value
              const displayValue = cleanMarkdown(
                typeof value === 'object' && value !== null
                  ? JSON.stringify(value, null, 2)
                  : String(value)
              );

              return (
                <div
                  key={key}
                  className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 py-2 border-b border-border/30 last:border-0'
                >
                  <div className='font-semibold text-foreground text-sm sm:text-base'>
                    {formattedKey}
                  </div>
                  <div className='text-sm sm:text-base text-muted-foreground sm:text-right font-mono'>
                    {displayValue}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // If it's a string, check if it's structured text
      if (typeof parsed === 'string') {
        return (
          <div className='whitespace-pre-wrap'>{cleanMarkdown(parsed)}</div>
        );
      }
    } catch {
      // If it's not JSON, try to parse as structured text
      const lines = cleanedComments.split('\n').filter((line) => line.trim());

      // Check if it's in a "Key: Value" or "Key (English): Value" format
      const structuredLines = lines.map((line) => {
        // Try to match "Key: Value" or "Key (English): Value" format
        const match = line.match(/^(.+?):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          return {
            key: cleanMarkdown(key.trim()),
            value: cleanMarkdown(value.trim()),
          };
        }
        return null;
      });

      if (structuredLines.some((line) => line !== null)) {
        return (
          <div className='space-y-1'>
            {structuredLines.map((line, index) => {
              if (!line) return null;
              return (
                <div
                  key={index}
                  className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 py-2 border-b border-border/30 last:border-0'
                >
                  <div className='font-semibold text-foreground text-sm sm:text-base'>
                    {line.key}
                  </div>
                  <div className='text-sm sm:text-base text-muted-foreground sm:text-right font-mono'>
                    {line.value}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Fallback: display as simple text with line breaks
      return (
        <div className='space-y-2'>
          {lines.map((line, index) => (
            <p key={index} className='text-sm'>
              {cleanMarkdown(line)}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  // Function to handle PDF download
  const handleDownload = () => {
    if (
      !response?.viewer ||
      !response?.user_id ||
      !response?.secret_key ||
      !response?.user_type
    ) {
      return;
    }

    try {
      setDownloading(true);

      const baseUrl = 'https://doctoatlas-1062594341429.europe-west9.run.app/';
      const params = new URLSearchParams({
        viewer: response.viewer,
        user_id: response.user_id,
        secret_key: response.secret_key,
        request: 'file',
        user_type: response.user_type,
      });

      const fileUrl = `${baseUrl}?${params.toString()}`;

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `medical-results-${response.case_id || 'document'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

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
        <CardTitle className='text-2xl mb-2'>Results Available!</CardTitle>
        <CardDescription>
          Your medical document analysis is ready
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* AI Analysis Summary */}
        {response?.ai_comments && (
          <div className='space-y-3'>
            <div className='font-semibold text-lg flex items-center gap-2'>
              <Sparkles size={20} className='text-primary' />
              AI Analysis Summary
            </div>
            <div className='text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border overflow-auto max-h-96'>
              {renderMedicalResults(response.ai_comments) || (
                <div className='whitespace-pre-wrap'>
                  {response.ai_comments}
                </div>
              )}
            </div>
          </div>
        )}

        <div className='pt-4 border-t space-y-3'>
          <Button
            onClick={handleDownload}
            className='w-full'
            variant='default'
            disabled={downloading || !response?.viewer}
          >
            {downloading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Downloading...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Download Document
              </>
            )}
          </Button>
          <Button onClick={onReset} className='w-full' variant='outline'>
            New Consultation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
