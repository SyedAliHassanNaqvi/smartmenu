import { apiFetch } from "@/lib/api-client";
import { MEDIA_RULES, type MediaKind } from "@/lib/media-rules";
import type { SignedUpload } from "@/types/media";

/**
 * Browser-side media uploads: get a signature from our API, then send the file
 * straight to Cloudinary with progress reporting. Safe for client imports.
 */

/** What the browser reports back to our API after an upload. */
export interface UploadedMedia {
  url: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  duration?: number;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  duration?: number;
  error?: { message?: string };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns a user-facing problem with the file, or null when it is acceptable. */
export function validateMediaFile(file: File, kind: MediaKind): string | null {
  const rule = MEDIA_RULES[kind];
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !rule.formats.includes(extension)) {
    return `Unsupported ${rule.label} type. Allowed: ${rule.formats.join(", ")}`;
  }
  if (file.size > rule.maxBytes) {
    return `The ${rule.label} is too large (${formatBytes(file.size)}). Maximum is ${formatBytes(rule.maxBytes)}.`;
  }
  return null;
}

/**
 * A resized Cloudinary rendition for previews. External URLs are returned
 * unchanged.
 */
export function thumbnailUrl(url: string, size = 160): string {
  if (!url.startsWith("https://res.cloudinary.com/")) return url;
  return url.replace("/upload/", `/upload/c_fill,w_${size},h_${size},q_auto,f_auto/`);
}

function abortError(): Error {
  return new DOMException("Upload cancelled", "AbortError");
}

/** POST a form with upload progress (fetch cannot report upload progress). */
function postWithProgress(
  url: string,
  form: FormData,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      const body = xhr.response as CloudinaryUploadResponse | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.secure_url) {
        resolve(body);
      } else {
        reject(new Error(body?.error?.message ?? `Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.onabort = () => reject(abortError());

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}

export async function uploadMedia(
  file: File,
  kind: MediaKind,
  options: {
    token: string | null;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  },
): Promise<UploadedMedia> {
  const problem = validateMediaFile(file, kind);
  if (problem) throw new Error(problem);

  const signed = await apiFetch<SignedUpload>("/api/media/sign", {
    method: "POST",
    token: options.token,
    body: { kind },
    signal: options.signal,
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) {
    form.append(key, value);
  }
  form.append("file", file);

  const result = await postWithProgress(signed.uploadUrl, form, options.onProgress, options.signal);

  return {
    url: result.secure_url,
    width: result.width || undefined,
    height: result.height || undefined,
    bytes: result.bytes,
    format: result.format,
    duration: result.duration,
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
