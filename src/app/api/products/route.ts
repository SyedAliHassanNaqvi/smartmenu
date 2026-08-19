import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product } from "@/lib/models/product.model";
import { createProductSchema } from "@/lib/validations/product";
import { getAuthRestaurantId } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/products?restaurantId=xxx
 * Fetch available menu items for a restaurant.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      throw new ApiError(400, "Restaurant ID is required");
    }

    await dbConnect();

    const products = await Product.find({ restaurantId, isAvailable: true })
      .sort({ category: 1, name: 1 })
      .select("_id name description price category image isAvailable restaurantId");

    return ok(products);
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
    const validatedData = createProductSchema.parse(body);

    await dbConnect();

    const product = new Product({
      ...validatedData,
      restaurantId,
      price: validatedData.price,
    });

    await product.save();

    return ok(product, 201);
  });
}
