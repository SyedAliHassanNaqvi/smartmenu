import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product } from "@/lib/models/product.model";
import { createProductSchema } from "@/lib/validations/product";
import { getAuthRestaurantId } from "@/lib/auth";
import { withErrorHandling, ok } from "@/lib/api";
import { resolveProductMedia } from "@/lib/product-media";

/**
 * GET /api/products
 *
 * Two modes:
 *  1. Public — GET /api/products?restaurantId=xxx returns only the available
 *     items, used by the customer-facing menu.
 *  2. Admin  — GET /api/products with an Authorization header returns every
 *     item (including unavailable ones) for the authenticated restaurant.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    await dbConnect();

    if (restaurantId) {
      const products = await Product.find({ restaurantId, isAvailable: true })
        .sort({ category: 1, name: 1 })
        .select("_id name description price category image isAvailable restaurantId");

      return ok({ products });
    }

    const adminRestaurantId = getAuthRestaurantId(request);

    const products = await Product.find({ restaurantId: adminRestaurantId })
      .sort({ category: 1, name: 1 });

    return ok({ products });
  });
}

/**
 * POST /api/products
 * Create a menu item for the authenticated restaurant.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    const body = await request.json();
    const { image, gallery, video, model3d, ...fields } = createProductSchema.parse(body);
    const media = resolveProductMedia({ image, gallery, video, model3d }, restaurantId);

    await dbConnect();

    const product = new Product({
      ...fields,
      ...media,
      restaurantId,
    });

    await product.save();

    return ok(product, 201);
  });
}
