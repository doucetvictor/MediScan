interface StatusMessageProps {
  status: string | null;
  error: string | null;
}

export function StatusMessage({ status, error }: StatusMessageProps) {
  if (!status && !error) return null;

  return (
    <div className='status-message'>
      {status && (
        <div className='status success'>
          <span className='status-icon'>✓</span>
          <div className='status-text whitespace-pre-line'>{status}</div>
        </div>
      )}
      {error && (
        <div className='status error'>
          <span className='status-icon'>✗</span>
          <span className='status-text'>{error}</span>
        </div>
      )}
    </div>
  );
}
