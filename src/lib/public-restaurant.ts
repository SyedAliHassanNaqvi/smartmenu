import { isValidObjectId } from "mongoose";
import { Restaurant } from "@/lib/models/restaurant.model";
import { DEFAULT_CURRENCY, DEFAULT_TAX_RATE } from "@/lib/constants";
import type { PublicRestaurant } from "@/types/public";

/**
 * The restaurant details a diner is allowed to see (branding + pricing settings).
 * Call after `dbConnect()`. Falls back to defaults if the restaurant is missing.
 */
export async function getPublicRestaurant(restaurantId: string): Promise<PublicRestaurant> {
  const restaurant = isValidObjectId(restaurantId)
    ? await Restaurant.findById(restaurantId).select("name logo theme settings").lean<{
        name: string;
        logo?: string;
        theme?: { primaryColor?: string; secondaryColor?: string };
        settings?: { currency?: string; taxRate?: number };
      }>()
    : null;

  return {
    _id: restaurantId,
    name: restaurant?.name ?? "Restaurant",
    logo: restaurant?.logo,
    currency: restaurant?.settings?.currency ?? DEFAULT_CURRENCY,
    taxRate: restaurant?.settings?.taxRate ?? DEFAULT_TAX_RATE,
    theme: restaurant?.theme,
  };
}
