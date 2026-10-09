import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { generateTableQR } from "@/services/qr-service";
import { getAuthRestaurantId } from "@/lib/auth";
import { generateTableCode } from "@/lib/table-token";
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
      .select("_id tableNumber capacity qrCode status tableCode")
      .sort({ tableNumber: 1 });

    const qrCodes = await Promise.all(
      tables.map(async (table) => {
        const isNewCode = !table.tableCode;
        const tableCode = table.tableCode || (table.tableCode = generateTableCode());
        const url = `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/customer/${tableCode}`;
        // Always persist a newly assigned code, and refresh the stored URL so
        // the two never drift apart.
        if (isNewCode || table.qrCode !== url) {
          table.qrCode = url;
          await table.save();
        }
        return {
          tableId: table._id.toString(),
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          url: table.qrCode,
          qrCode: await generateTableQR(tableCode),
          generatedAt: table.updatedAt,
        };
      }),
    );

    return ok(qrCodes);
  });
}
