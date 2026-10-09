import { createHash, randomUUID } from "crypto";
import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/api-error";
import { MEDIA_RULES, type MediaKind } from "@/lib/media-rules";
import type { SignedUpload } from "@/types/media";

/**
 * Cloudinary integration (server only).
 *
 * Browsers upload straight to Cloudinary using short-lived signatures issued
 * here, so large files never pass through our route handlers. The signature
 * pins the destination `public_id` (inside the restaurant's folder) and the
 * allowed formats, so a client cannot upload anywhere else or anything else.
 */

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface CloudinaryAssetRef {
  publicId: string;
  resourceType: "image" | "video";
}

export interface ParsedMediaUrl extends CloudinaryAssetRef {
  format?: string;
}

function getConfig(): CloudinaryConfig | null {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = serverEnv;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return null;
  }
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
}

function requireConfig(): CloudinaryConfig {
  const config = getConfig();
  if (!config) {
    throw new ApiError(503, "Media uploads are not configured on this server");
  }
  return config;
}

/**
 * Cloudinary request signature: SHA-1 of the parameters sorted by key and
 * joined as `key=value&...`, with the API secret appended.
 */
export function signParams(params: Record<string, string>, apiSecret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

/** Root folder holding every product asset of one restaurant. */
export function productMediaFolder(restaurantId: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(restaurantId)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }
  return `visiondine/${restaurantId}/products`;
}

/**
 * Issue a one-off signed upload for a restaurant. The returned `fields` are
 * posted to `uploadUrl` together with the file.
 */
export function signUpload(restaurantId: string, kind: MediaKind): SignedUpload {
  const { cloudName, apiKey, apiSecret } = requireConfig();
  const rule = MEDIA_RULES[kind];

  const params: Record<string, string> = {
    allowed_formats: rule.formats.join(","),
    overwrite: "false",
    public_id: `${productMediaFolder(restaurantId)}/${kind}/${randomUUID()}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };

  return {
    kind,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${rule.resourceType}/upload`,
    fields: { ...params, api_key: apiKey, signature: signParams(params, apiSecret) },
    maxBytes: rule.maxBytes,
  };
}

/**
 * Parse a Cloudinary delivery URL and return its asset reference, but only
 * when it belongs to our cloud and to the given restaurant's folder.
 * Returns null for anything else (external URLs, other tenants, transforms).
 */
export function parseOwnedMediaUrl(url: string, restaurantId: string): ParsedMediaUrl | null {
  const config = getConfig();
  if (!config) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") {
    return null;
  }

  const match = parsed.pathname.match(/^\/([^/]+)\/(image|video)\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match || match[1] !== config.cloudName) return null;

  let path: string;
  try {
    path = decodeURIComponent(match[3]);
  } catch {
    return null;
  }
  if (path.includes("..")) return null;

  const dot = path.lastIndexOf(".");
  const hasExtension = dot > path.lastIndexOf("/");
  const publicId = hasExtension ? path.slice(0, dot) : path;

  if (!publicId.startsWith(`${productMediaFolder(restaurantId)}/`)) return null;

  return {
    publicId,
    resourceType: match[2] as "image" | "video",
    format: hasExtension ? path.slice(dot + 1).toLowerCase() : undefined,
  };
}

/**
 * Like `parseOwnedMediaUrl`, but also checks the asset matches the expected
 * kind and throws a 400 when it does not.
 */
export function assertOwnedMedia(
  url: string,
  restaurantId: string,
  kind: MediaKind,
): ParsedMediaUrl {
  const rule = MEDIA_RULES[kind];
  const asset = parseOwnedMediaUrl(url, restaurantId);

  const valid =
    asset &&
    asset.resourceType === rule.resourceType &&
    asset.format !== undefined &&
    rule.formats.includes(asset.format);

  if (!valid) {
    throw new ApiError(400, `The ${rule.label} must be uploaded through Vision Dine`);
  }
  return asset;
}

/**
 * Best-effort deletion of assets from Cloudinary. Never throws: failures are
 * logged, since a leftover file must not fail the user's request.
 */
export async function destroyAssets(assets: CloudinaryAssetRef[]): Promise<void> {
  const config = getConfig();
  if (!config || assets.length === 0) return;

  const results = await Promise.allSettled(
    assets.map(async ({ publicId, resourceType }) => {
      const params = {
        invalidate: "true",
        public_id: publicId,
        timestamp: String(Math.floor(Date.now() / 1000)),
      };
      const body = new URLSearchParams({
        ...params,
        api_key: config.apiKey,
        signature: signParams(params, config.apiSecret),
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`,
        { method: "POST", body },
      );
      if (!response.ok) {
        throw new Error(`${publicId}: HTTP ${response.status}`);
      }
    }),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[media] Failed to delete Cloudinary asset:", result.reason);
    }
  }
}
