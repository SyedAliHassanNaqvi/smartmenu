import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { getAuthRestaurantId } from "@/lib/auth";
import { getPublicRestaurant } from "@/lib/public-restaurant";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/restaurant
 * The authenticated user's restaurant (name, branding, currency, tax rate).
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);
    await dbConnect();
    return ok(await getPublicRestaurant(restaurantId));
  });
}
