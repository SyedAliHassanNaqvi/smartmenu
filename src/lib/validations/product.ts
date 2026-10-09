import { z } from "zod";
import { MAX_GALLERY_IMAGES } from "@/lib/media-rules";

/**
 * A media file as reported back by the browser after a Cloudinary upload.
 * Only the URL is trusted, and only after the server's ownership check; the
 * `publicId` is derived from it on the server.
 */
export const mediaAssetInputSchema = z.object({
  url: z.string().url("Invalid media URL"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().nonnegative().optional(),
  format: z.string().max(10).optional(),
  duration: z.number().nonnegative().optional(),
});

/** A manually uploaded 3D model (the fallback for the video → glb pipeline). */
export const model3dInputSchema = z.object({
  glbUrl: z.string().url("Invalid 3D model URL"),
  posterUrl: z.string().url("Invalid poster URL").optional(),
});

/**
 * Fields an admin may set on a product. No `.default()`s here: defaults live
 * on the create schema only, so a partial update (e.g. toggling availability)
 * never silently resets fields it did not send.
 */
const productFieldsSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.enum(["appetizer", "main", "dessert", "beverage", "special"]),
  // `null` clears the field on update; omitting it leaves it unchanged.
  image: z.string().url("Invalid image URL").nullable().optional(),
  gallery: z
    .array(mediaAssetInputSchema)
    .max(MAX_GALLERY_IMAGES, `At most ${MAX_GALLERY_IMAGES} gallery images`)
    .optional(),
  video: mediaAssetInputSchema.nullable().optional(),
  model3d: model3dInputSchema.nullable().optional(),
  isAvailable: z.boolean(),
  preparationTime: z.coerce.number().positive("Preparation time must be positive"),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  vegetarian: z.boolean(),
  vegan: z.boolean(),
  calories: z.number().positive().optional(),
});

export const createProductSchema = productFieldsSchema.extend({
  isAvailable: z.boolean().default(true),
  vegetarian: z.boolean().default(false),
  vegan: z.boolean().default(false),
});

export const updateProductSchema = productFieldsSchema.partial();

export type ProductMediaInput = Pick<
  z.infer<typeof updateProductSchema>,
  "image" | "gallery" | "video" | "model3d"
>;
