import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/tables/info?restaurantId=xxx&tableNumber=1
 * Public lookup used by the customer flow to resolve a table from its QR URL.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const tableNumber = searchParams.get("tableNumber");

    if (!restaurantId || !tableNumber) {
      throw new ApiError(400, "Restaurant ID and table number are required");
    }

    await dbConnect();

    const table = await Table.findOne({
      restaurantId,
      tableNumber: parseInt(tableNumber, 10),
    });

    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    return ok({
      table: {
        _id: table._id.toString(),
        tableNumber: table.tableNumber,
        status: table.status,
        capacity: table.capacity,
        restaurantId: table.restaurantId,
      },
    });
  });
}
