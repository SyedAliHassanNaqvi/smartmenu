import type { ProductMediaInput } from "@/lib/validations/product";
import type { MediaAsset, Model3d } from "@/types/media";
import type { MediaKind } from "@/lib/media-rules";
import {
  assertOwnedMedia,
  parseOwnedMediaUrl,
  type CloudinaryAssetRef,
} from "@/services/media-service";

type MediaAssetInput = NonNullable<ProductMediaInput["video"]>;

export interface ProductMediaFields {
  image?: string;
  gallery?: MediaAsset[];
  video?: MediaAsset;
  model3d?: Model3d;
}

interface ExistingMedia {
  image?: string | null;
  gallery?: MediaAsset[] | null;
  video?: MediaAsset | null;
  model3d?: Model3d | null;
}

function toAsset(input: MediaAssetInput, restaurantId: string, kind: MediaKind): MediaAsset {
  const { publicId } = assertOwnedMedia(input.url, restaurantId, kind);
  return { ...input, publicId };
}

/**
 * Turn validated media input into the fields to store on a product.
 *
 * Every uploaded asset is checked to live in this restaurant's Cloudinary
 * folder, and `publicId`s are derived on the server. Only keys present in the
 * input appear in the result (an `undefined` value clears that field), so a
 * partial update leaves untouched media alone. The cover `image` may also be
 * an external URL, kept for compatibility with existing menus.
 */
export function resolveProductMedia(
  input: ProductMediaInput,
  restaurantId: string,
  existing?: ExistingMedia,
): ProductMediaFields {
  const fields: ProductMediaFields = {};

  if (input.image !== undefined) {
    fields.image = input.image ?? undefined;
  }

  if (input.gallery !== undefined) {
    fields.gallery = input.gallery.map((item) => toAsset(item, restaurantId, "image"));
  }

  if (input.video !== undefined) {
    fields.video = input.video ? toAsset(input.video, restaurantId, "video") : undefined;
  }

  if (input.model3d !== undefined) {
    const current = existing?.model3d;
    const unchanged =
      input.model3d &&
      current?.glbUrl === input.model3d.glbUrl &&
      current?.posterUrl === input.model3d.posterUrl;

    if (!unchanged) {
      if (input.model3d) {
        const { publicId } = assertOwnedMedia(input.model3d.glbUrl, restaurantId, "model");
        if (input.model3d.posterUrl) {
          assertOwnedMedia(input.model3d.posterUrl, restaurantId, "image");
        }
        fields.model3d = {
          status: "ready",
          source: "manual",
          glbUrl: input.model3d.glbUrl,
          posterUrl: input.model3d.posterUrl,
          publicId,
          updatedAt: new Date(),
        };
      } else {
        fields.model3d = { status: "none", updatedAt: new Date() };
      }
    }
  }

  return fields;
}

/**
 * Every Cloudinary asset referenced by a product that belongs to the given
 * restaurant, keyed by public ID. External URLs are ignored.
 */
export function collectOwnedMedia(
  product: ExistingMedia,
  restaurantId: string,
): Map<string, CloudinaryAssetRef> {
  const urls = [
    product.image,
    ...(product.gallery ?? []).map((item) => item.url),
    product.video?.url,
    product.model3d?.glbUrl,
    product.model3d?.posterUrl,
  ];

  const assets = new Map<string, CloudinaryAssetRef>();
  for (const url of urls) {
    if (!url) continue;
    const asset = parseOwnedMediaUrl(url, restaurantId);
    if (asset) {
      assets.set(asset.publicId, { publicId: asset.publicId, resourceType: asset.resourceType });
    }
  }
  return assets;
}

/** Assets referenced before an update that are no longer referenced after it. */
export function removedMedia(
  before: Map<string, CloudinaryAssetRef>,
  after: Map<string, CloudinaryAssetRef>,
): CloudinaryAssetRef[] {
  return [...before.values()].filter((asset) => !after.has(asset.publicId));
}
