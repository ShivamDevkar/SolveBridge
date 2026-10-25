import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl?: string;
  name: string;
  size: number;
}

export interface DropzoneProps {
  label?: string;
  helperText?: string;
  accept?: string[]; // e.g. ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  maxSizeBytes?: number; // default 10MB
  maxFiles?: number;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  className?: string;
}

export function Dropzone({
  label = 'Upload Supporting Photos or Documents',
  helperText = 'Attach clear photos of the issue. Supports JPG, PNG, WEBP, or PDF up to 10MB.',
  accept = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  files,
  onFilesChange,
  className,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    setErrorMessage(null);

    const validNewFiles: UploadedFile[] = [];

    if (files.length + newFiles.length > maxFiles) {
      setErrorMessage(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      // Validate Type
      const isAccepted = accept.some((type) => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(`${baseType}/`);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        setErrorMessage(`File "${file.name}" has an unsupported format. Please upload JPG, PNG, WEBP, or PDF.`);
        return;
      }

      // Validate Size
      if (file.size > maxSizeBytes) {
        const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
        setErrorMessage(`File "${file.name}" exceeds the maximum limit of ${sizeMb}MB.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      validNewFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      });
    }

    onFilesChange([...files, ...validNewFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = files.filter((f) => {
      if (f.id === idToRemove && f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
      return f.id !== idToRemove;
    });
    onFilesChange(updated);
    setErrorMessage(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 tracking-wide select-none">
          {label}
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {files.length} / {maxFiles} files
        </span>
      </div>

      {/* Drop Target Area */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Click or drag files here to upload"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          isDragOver
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-slate-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept.join(',')}
          className="hidden"
          onChange={(e) => validateAndAddFiles(e.target.files)}
        />
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2">
          <UploadCloud className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-800">
          <span className="text-blue-600 underline decoration-blue-400 underline-offset-2">
            Click to upload
          </span>{' '}
          or drag and drop
        </p>
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      </div>

      {/* Accessible Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="text-xs text-red-700 flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File List / Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-lg overflow-hidden group shadow-xs"
            >
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="w-10 h-10 rounded object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                  {file.name.endsWith('.pdf') ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(file.id, e)}
                aria-label={`Remove file ${file.name}`}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
