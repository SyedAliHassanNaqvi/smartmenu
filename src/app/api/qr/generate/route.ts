import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Table } from "@/lib/models/table.model";
import { generateTableQR, buildTableUrl } from "@/services/qr-service";
import { getAuthRestaurantId } from "@/lib/auth";
import { generateTableCode } from "@/lib/table-token";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * Always mint a fresh table code for the QR being generated. Generation is the
 * explicit "Generate/Regenerate" action, so it must rotate the code (otherwise
 * the regenerated QR would be pixel-identical and appear broken). Retry a few
 * times to dodge the rare unique-index collision.
 */
async function mintFreshTableCode(table: InstanceType<typeof Table>) {
  const existing = await Table.find({ _id: { $ne: table._id } })
    .select("tableCode")
    .lean()
    .exec();
  const codes = new Set(
    (existing as Array<{ tableCode?: string }>).map((t) => t.tableCode),
  );

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateTableCode();
    if (!codes.has(candidate)) {
      table.tableCode = candidate;
      return candidate;
    }
  }
  throw new ApiError(500, "Failed to generate a unique table code");
}

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

  const tableCode = await mintFreshTableCode(table);
  const qrCode = await generateTableQR(tableCode);
  const url = buildTableUrl(tableCode);

  table.qrCode = url;
  await table.save();

  return ok({
    success: true,
    tableId: table._id.toString(),
    tableNumber: table.tableNumber,
    qrCode,
    url,
    tableCode,
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
