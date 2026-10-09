import { after, type NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product } from "@/lib/models/product.model";
import { updateProductSchema } from "@/lib/validations/product";
import { getAuthRestaurantId } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";
import { collectOwnedMedia, removedMedia, resolveProductMedia } from "@/lib/product-media";
import { destroyAssets } from "@/services/media-service";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/products/[id]
 * Fetch a single menu item belonging to the authenticated restaurant.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const restaurantId = getAuthRestaurantId(request);

    await dbConnect();

    const product = await Product.findOne({ _id: id, restaurantId });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return ok(product);
  });
}

/**
 * PUT /api/products/[id]
 * Update a menu item belonging to the authenticated restaurant.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const restaurantId = getAuthRestaurantId(request);

    const body = await request.json();
    const { image, gallery, video, model3d, ...fields } = updateProductSchema.parse(body);

    await dbConnect();

    const product = await Product.findOne({ _id: id, restaurantId });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const mediaBefore = collectOwnedMedia(product, restaurantId);
    const media = resolveProductMedia({ image, gallery, video, model3d }, restaurantId, product);

    Object.assign(product, fields, media);
    await product.save();

    // Delete files the product no longer uses once the response is sent.
    const removed = removedMedia(mediaBefore, collectOwnedMedia(product, restaurantId));
    if (removed.length > 0) {
      after(() => destroyAssets(removed));
    }

    return ok(product);
  });
}

/**
 * DELETE /api/products/[id]
 * Delete a menu item belonging to the authenticated restaurant.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const restaurantId = getAuthRestaurantId(request);

    await dbConnect();

    const product = await Product.findOneAndDelete({ _id: id, restaurantId });
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const media = [...collectOwnedMedia(product, restaurantId).values()];
    if (media.length > 0) {
      after(() => destroyAssets(media));
    }

    return ok({ message: "Product deleted successfully" });
  });
}