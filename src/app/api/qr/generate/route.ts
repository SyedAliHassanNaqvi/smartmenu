import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { generateTableQR } from "@/services/qr-service";
import { getAuthRestaurantId } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * Resolve a table ID from either the request body (POST) or the `tableId`
 * query parameter (GET), generate its QR code, and persist the QR URL.
 */
async function generateForTable(tableId: string, restaurantId: string) {
  await dbConnect();

  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) {
    throw new ApiError(404, "Table not found or access denied");
  }

  const qrCode = await generateTableQR(`${restaurantId}/${table.tableNumber}`);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${appUrl}/customer/${restaurantId}/${table.tableNumber}`;

  table.qrCode = url;
  await table.save();

  return ok({
    success: true,
    tableId: table._id.toString(),
    tableNumber: table.tableNumber,
    qrCode,
    url,
    generatedAt: new Date().toISOString(),
  });
}

/**
 * POST /api/qr/generate
 * Generate a QR code for a table. Body: { tableId }
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    const body = await request.json();
    const tableId = body?.tableId;

    if (!tableId) {
      throw new ApiError(400, "Table ID is required");
    }

    return generateForTable(tableId, restaurantId);
  });
}

/**
 * GET /api/qr/generate?tableId=xxx
 * Generate a QR code for a table.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) {
      throw new ApiError(400, "Table ID parameter is required");
    }

    return generateForTable(tableId, restaurantId);
  });
}
