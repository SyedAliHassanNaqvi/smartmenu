/**
 * Upload rules shared by the client (pre-upload checks, file pickers) and the
 * server (signed `allowed_formats`). Safe for client imports.
 */
export const MEDIA_KINDS = ["image", "video", "model"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

const MB = 1024 * 1024;

export interface MediaRule {
  /** Cloudinary resource type the asset is stored under. */
  resourceType: "image" | "video";
  /** File extensions Cloudinary will accept (enforced by the signature). */
  formats: readonly string[];
  /** Value for an `<input type="file" accept>` attribute. */
  accept: string;
  /** Upper bound checked in the browser before uploading. */
  maxBytes: number;
  label: string;
}

export const MEDIA_RULES: Record<MediaKind, MediaRule> = {
  image: {
    resourceType: "image",
    formats: ["jpg", "jpeg", "png", "webp", "avif"],
    accept: "image/jpeg,image/png,image/webp,image/avif",
    maxBytes: 10 * MB,
    label: "image",
  },
  video: {
    resourceType: "video",
    formats: ["mp4", "mov", "webm"],
    accept: "video/mp4,video/quicktime,video/webm",
    maxBytes: 100 * MB,
    label: "video",
  },
  // Cloudinary stores 3D models (glb) under the image resource type.
  model: {
    resourceType: "image",
    formats: ["glb"],
    accept: ".glb,model/gltf-binary",
    maxBytes: 10 * MB,
    label: "3D model",
  },
};

/** Maximum number of extra images in a product gallery. */
export const MAX_GALLERY_IMAGES = 8;

export const MODEL3D_STATUSES = ["none", "queued", "processing", "ready", "failed"] as const;
export type Model3dStatus = (typeof MODEL3D_STATUSES)[number];
