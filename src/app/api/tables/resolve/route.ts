import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { getPublicRestaurant } from "@/lib/public-restaurant";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/tables/resolve?code=xxx
 * Public. Resolves a table from its short opaque code. Used by the customer
 * flow when a QR link is scanned, so the table identity always comes from the
 * stored code rather than editable URL segments.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || searchParams.get("token");

    if (!code) {
      throw new ApiError(400, "Table code is required");
    }

    await dbConnect();

    const table = await Table.findOne({ tableCode: code });
    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    return ok({
      table: {
        _id: table._id.toString(),
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        location: table.location ?? "",
        restaurantId: table.restaurantId,
        code,
      },
      restaurant: await getPublicRestaurant(table.restaurantId),
    });
  });
}
