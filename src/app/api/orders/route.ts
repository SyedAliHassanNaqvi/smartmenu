import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order } from "@/lib/models/order.model";
import { createOrderSchema } from "@/lib/validations/order";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/orders?tableId=xxx&status=xxx
 * List orders for a table and/or status.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (tableId) query.tableId = tableId;
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return ok(orders);
  });
}

/**
 * POST /api/orders
 * Create a new order.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await dbConnect();

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const order = await Order.create(validatedData);
    return ok(order, 201);
  });
}
