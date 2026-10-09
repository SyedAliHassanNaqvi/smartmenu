import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Order } from "@/lib/models/order.model";
import { updateOrderSchema } from "@/lib/validations/order";
import { getAuthRestaurantId } from "@/lib/auth";
import { canTransition, type OrderStatus } from "@/lib/order-status";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]
 * Public tracking lookup. Returns what the diner needs to follow their order
 * (status, items, totals, ready-by time) — no internal identifiers. Authenticated admins of the
 * owning restaurant get the full order back.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      throw new ApiError(404, "Order not found");
    }

    await dbConnect();

    const order = await Order.findById(id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const restaurantId = getAuthRestaurantId(request);
      if (order.restaurantId !== restaurantId) {
        throw new ApiError(404, "Order not found");
      }
      return ok(order);
    }

    const items = order.items as { productName: string; quantity: number; price: number }[];
    return ok({
      _id: order._id.toString(),
      tableNumber: order.tableNumber,
      status: order.status,
      items: items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      itemCount: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      subtotal: order.subtotal,
      tax: order.tax,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      estimatedTime: order.estimatedTime,
      readyBy: order.readyBy,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  });
}

/**
 * PATCH /api/orders/[id]
 * Admin action: update an order's status and/or set/clear the ready-by time.
 * Status changes must follow the lifecycle in `@/lib/order-status`.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const restaurantId = getAuthRestaurantId(request);

    const data = updateOrderSchema.parse(await request.json());

    if (!isValidObjectId(id)) {
      throw new ApiError(404, "Order not found");
    }

    await dbConnect();

    const order = await Order.findOne({ _id: id, restaurantId });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const update: Record<string, unknown> = {};

    if (data.status !== undefined && data.status !== order.status) {
      if (!canTransition(order.status as OrderStatus, data.status)) {
        throw new ApiError(409, `Cannot change an order from "${order.status}" to "${data.status}"`);
      }
      update.status = data.status;
      if (data.status === "completed" || data.status === "served") {
        update.completedAt = new Date();
      }
    }

    if (data.readyBy !== undefined) {
      update.readyBy = data.readyBy;
      update.estimatedTime = data.readyBy
        ? Math.max(0, Math.round((data.readyBy.getTime() - Date.now()) / 60000))
        : null;
    }

    const updated = await Order.findByIdAndUpdate(id, update, { new: true });
    return ok(updated);
  });
}
