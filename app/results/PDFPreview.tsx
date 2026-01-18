'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface PDFPreviewProps {
  s3Key: string;
  filename: string;
  onClick: () => void;
}

export default function PDFPreview({ s3Key, filename, onClick }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPDFUrl = async () => {
      try {
        setLoading(true);
        setError(false);

        // Get presigned URL
        const response = await fetch(`/api/pdf-url?key=${encodeURIComponent(s3Key)}`);
        const data = await response.json();

        if (!response.ok || !data.url) {
          throw new Error('Failed to get PDF URL');
        }

        if (isMounted) {
          setPdfUrl(data.url);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF preview:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadPDFUrl();

    return () => {
      isMounted = false;
    };
  }, [s3Key]);

  return (
    <div className={styles.pdfPreview} onClick={onClick}>
      {loading && (
        <div className={styles.pdfPreviewLoading}>
          <div className={styles.pdfPreviewSpinner}></div>
        </div>
      )}
      {error && (
        <div className={styles.pdfPreviewError}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
      )}
      {pdfUrl && !loading && !error && (
        <iframe
          src={`${pdfUrl}#page=1&zoom=fit`}
          className={styles.pdfPreviewIframe}
          title={`Preview of ${filename}`}
        />
      )}
    </div>
  );
}

