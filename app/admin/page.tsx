'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface File {
  id: string;
  filename: string;
  created_at: string;
}

export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isUnlocked) {
      fetchFiles();
    }
  }, [isUnlocked]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setVerifying(true);

    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsUnlocked(true);
        setPassword('');
      } else {
        setPasswordError(data.error || 'Incorrect password');
        setPassword('');
      }
    } catch (error) {
      setPasswordError('Failed to verify password');
      setPassword('');
    } finally {
      setVerifying(false);
    }
  };

  const uploadFile = async (file: globalThis.File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Refresh file list
      await fetchFiles();
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Refresh file list
      await fetchFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  if (!isUnlocked) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Admin Access</h1>
            <Link href="/" className={styles.homeButton}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
          </div>
          <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={styles.passwordInput}
              disabled={verifying}
              autoFocus
            />
            <button
              type="submit"
              className={styles.passwordButton}
              disabled={verifying || !password.trim()}
            >
              {verifying ? 'Verifying...' : 'Unlock'}
            </button>
            {passwordError && <div className={styles.error}>{passwordError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Panel</h1>
          <Link href="/" className={styles.homeButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
        </div>

        <div className={styles.uploadSection}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragOver : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              disabled={uploading}
              className={styles.fileInput}
            />
            <div className={styles.dropZoneContent}>
              <svg
                className={styles.dropZoneIcon}
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className={styles.dropZoneText}>
                {uploading
                  ? 'Uploading...'
                  : isDragging
                  ? 'Drop PDF here'
                  : 'Drag & drop a PDF or click to browse'}
              </p>
            </div>
          </div>
          {uploadError && <div className={styles.error}>{uploadError}</div>}
        </div>

        {files.length > 0 && (
          <div className={styles.fileList}>
            <h2 className={styles.fileListTitle}>Uploaded Files</h2>
            <ul className={styles.fileListItems}>
              {files.map((file) => (
                <li key={file.id} className={styles.fileItem}>
                  <span className={styles.fileName}>{file.filename}</span>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
