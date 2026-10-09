'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { formatBytes, type UploadedMedia } from '@/lib/media-client';
import { MEDIA_RULES, type MediaKind } from '@/lib/media-rules';
import { cn } from '@/utils/cn';

interface MediaUploaderProps {
  kind: MediaKind;
  label: string;
  /** Accept several files at once; they are uploaded one after another. */
  multiple?: boolean;
  /** Upper bound on files taken from one selection (for capped galleries). */
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  onUploaded: (media: UploadedMedia) => void;
  onBusyChange?: (busy: boolean) => void;
}

/**
 * Click-or-drop upload area for one media kind. Files go straight to
 * Cloudinary; the parent receives each uploaded file via `onUploaded`.
 */
export function MediaUploader({
  kind,
  label,
  multiple = false,
  maxFiles,
  disabled = false,
  className,
  onUploaded,
  onBusyChange,
}: MediaUploaderProps) {
  const rule = MEDIA_RULES[kind];
  const { upload, cancel, progress, error, clearError } = useMediaUpload(kind);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [batch, setBatch] = useState({ index: 0, total: 0 });

  // Report busy → idle via the cleanup, so it also fires when this uploader
  // unmounts mid-batch (e.g. the parent swaps it for a preview after upload).
  useEffect(() => {
    if (!busy) return;
    onBusyChange?.(true);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || busy || disabled) return;

    const limit = multiple ? (maxFiles ?? fileList.length) : 1;
    const files = Array.from(fileList).slice(0, Math.max(0, limit));
    if (files.length === 0) return;

    cancelledRef.current = false;
    clearError();
    setBusy(true);

    for (let i = 0; i < files.length && !cancelledRef.current; i++) {
      setBatch({ index: i + 1, total: files.length });
      const media = await upload(files[i]);
      if (media) onUploaded(media);
      else break; // Stop the batch on the first failure so the error stays visible.
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    cancel();
  };

  const formats = rule.formats.filter((format) => format !== 'jpeg').join(', ').toUpperCase();

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled || busy ? -1 : 0}
        aria-disabled={disabled || busy}
        onClick={() => !busy && !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !busy && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy && !disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-5 text-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          dragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50',
          disabled ? 'cursor-not-allowed opacity-60' : !busy && 'cursor-pointer hover:border-gray-400'
        )}
      >
        {busy ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading{batch.total > 1 ? ` ${batch.index} of ${batch.total}` : ''}… {progress}%
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-800">{label}</span>
            <span className="text-xs text-gray-500">
              {formats} · up to {formatBytes(rule.maxBytes)}
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        multiple={multiple}
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
