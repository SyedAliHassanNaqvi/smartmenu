"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { isAbortError, uploadMedia, type UploadedMedia } from "@/lib/media-client";
import type { MediaKind } from "@/lib/media-rules";

/**
 * Upload one file at a time of the given kind to Cloudinary, exposing
 * progress, error and cancel. In-flight uploads are aborted on unmount.
 */
export function useMediaUpload(kind: MediaKind) {
  const token = useAuthStore((state) => state.token);
  const controllerRef = useRef<AbortController | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => () => controllerRef.current?.abort(), []);

  /** Resolves to the uploaded media, or null when it failed or was cancelled. */
  const upload = useCallback(
    async (file: File): Promise<UploadedMedia | null> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setUploading(true);
      setProgress(0);
      setError("");

      try {
        return await uploadMedia(file, kind, {
          token,
          onProgress: setProgress,
          signal: controller.signal,
        });
      } catch (err) {
        if (!isAbortError(err)) {
          setError(err instanceof Error ? err.message : "Upload failed");
        }
        return null;
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setUploading(false);
        }
      }
    },
    [kind, token],
  );

  const cancel = useCallback(() => controllerRef.current?.abort(), []);
  const clearError = useCallback(() => setError(""), []);

  return { upload, cancel, uploading, progress, error, clearError };
}
