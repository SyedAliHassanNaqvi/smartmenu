import type { MediaKind, Model3dStatus } from "@/lib/media-rules";

/**
 * A file stored on Cloudinary. `publicId` is always derived on the server from
 * the URL, so it can be trusted when deleting the asset. Safe for client imports.
 */
export interface MediaAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  /** Seconds, for videos. */
  duration?: number;
}

/**
 * 3D model state for a product. `source = "pipeline"` is produced by the
 * video → glb worker (Task 4); `"manual"` is a glb uploaded by an admin.
 */
export interface Model3d {
  status: Model3dStatus;
  source?: "pipeline" | "manual";
  glbUrl?: string;
  posterUrl?: string;
  publicId?: string;
  error?: string;
  updatedAt?: Date | string;
}

/** Response of POST /api/media/sign. */
export interface SignedUpload {
  kind: MediaKind;
  uploadUrl: string;
  /** Every field to send with the file, signature included. */
  fields: Record<string, string>;
  maxBytes: number;
}
