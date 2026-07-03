'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Dropzone({ onFileSelect, disabled = false }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are supported');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be under 10 MB');
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [disabled, validateAndSelect]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-all duration-300',
        'flex flex-col items-center justify-center gap-4 text-center',
        'min-h-[260px]',
        disabled && 'pointer-events-none opacity-50',
        isDragOver
          ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.1)]'
          : selectedFile
            ? 'border-success/30 bg-success/5'
            : 'border-surface-lighter/60 bg-surface-light/30 hover:border-primary/30 hover:bg-surface-light/50',
        error && 'border-danger/40 bg-danger/5'
      )}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleInputChange}
        className="hidden"
      />

      {selectedFile ? (
        <>
          {/* File selected state */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
              <FileIcon className="w-8 h-8 text-success" />
            </div>
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface-lighter border border-glass-border flex items-center justify-center hover:bg-danger/20 hover:border-danger/30 transition-all"
            >
              <X className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </div>
          <div>
            <p className="text-text-primary font-medium text-sm truncate max-w-[300px]">
              {selectedFile.name}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              {formatFileSize(selectedFile.size)} · PDF Document
            </p>
          </div>
          <p className="text-success text-xs font-medium">Ready to analyze</p>
        </>
      ) : (
        <>
          {/* Default / drag state */}
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
              isDragOver
                ? 'bg-primary/15 border border-primary/30 scale-110'
                : 'bg-surface-lighter/50 border border-glass-border'
            )}
          >
            <UploadCloud
              className={cn(
                'w-8 h-8 transition-all duration-300',
                isDragOver ? 'text-primary-light' : 'text-text-secondary'
              )}
            />
          </div>
          <div>
            <p className="text-text-primary font-medium text-sm">
              {isDragOver ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              or <span className="text-primary-light hover:underline">browse files</span>
            </p>
          </div>
          <p className="text-text-secondary/60 text-xs">
            Supports PDF files up to 10 MB
          </p>
        </>
      )}

      {error && (
        <p className="text-danger text-xs font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
