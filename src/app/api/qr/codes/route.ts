import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { generateTableQR } from "@/services/qr-service";
import { getAuthRestaurantId } from "@/lib/auth";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/qr/codes
 * Fetch all tables (with QR code data URLs) for the authenticated restaurant.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    await dbConnect();

    const tables = await Table.find({ restaurantId })
      .select("_id tableNumber capacity qrCode status")
      .sort({ tableNumber: 1 });

    const qrCodes = await Promise.all(
      tables.map(async (table) => ({
        tableId: table._id.toString(),
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        url: table.qrCode,
        qrCode: table.qrCode
          ? await generateTableQR(`${restaurantId}/${table.tableNumber}`)
          : "",
        generatedAt: table.updatedAt,
      })),
    );

    return ok(qrCodes);
  });
}
