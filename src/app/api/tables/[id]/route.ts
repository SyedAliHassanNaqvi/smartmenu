import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { updateTableSchema } from "@/lib/validations/table";
import { getAuthRestaurantId } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/tables/[id]
 * Update a table belonging to the authenticated restaurant.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const restaurantId = getAuthRestaurantId(request);

    const body = await request.json();
    const validatedData = updateTableSchema.parse(body);

    await dbConnect();

    const table = await Table.findOne({ _id: id, restaurantId });
    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    if (
      validatedData.tableNumber &&
      validatedData.tableNumber !== table.tableNumber
    ) {
      const existingTable = await Table.findOne({
        restaurantId,
        tableNumber: validatedData.tableNumber,
        _id: { $ne: id },
      });
      if (existingTable) {
        throw new ApiError(409, "Table number already exists");
      }
    }

    Object.assign(table, validatedData);
    await table.save();

    return ok(table);
  });
}

/**
 * DELETE /api/tables/[id]
 * Delete a table belonging to the authenticated restaurant.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const restaurantId = getAuthRestaurantId(request);

    await dbConnect();

    const table = await Table.findOneAndDelete({ _id: id, restaurantId });
    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    return ok({ message: "Table deleted successfully" });
  });
}
