import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { createTableSchema } from "@/lib/validations/table";
import { getAuthRestaurantId } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/tables
 * List all tables for the authenticated restaurant.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    await dbConnect();

    const tables = await Table.find({ restaurantId })
      .sort({ tableNumber: 1 })
      .select("_id tableNumber status capacity qrCode createdAt");

    return ok(tables);
  });
}

/**
 * POST /api/tables
 * Create a table for the authenticated restaurant.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    const body = await request.json();
    const validatedData = createTableSchema.parse(body);

    await dbConnect();

    const existingTable = await Table.findOne({
      restaurantId,
      tableNumber: validatedData.tableNumber,
    });
    if (existingTable) {
      throw new ApiError(409, "Table number already exists");
    }

    const table = new Table({
      ...validatedData,
      restaurantId,
      status: "available",
    });

    await table.save();

    return ok(table, 201);
  });
}
