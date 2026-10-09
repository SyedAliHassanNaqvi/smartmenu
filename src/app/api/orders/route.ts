import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Order } from "@/lib/models/order.model";
import { Table } from "@/lib/models/table.model";
import { Product } from "@/lib/models/product.model";
import { Restaurant } from "@/lib/models/restaurant.model";
import { placeOrderSchema } from "@/lib/validations/order";
import { getAuthRestaurantId } from "@/lib/auth";
import { roundMoney } from "@/lib/order-status";
import { DEFAULT_TAX_RATE } from "@/lib/constants";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/orders?status=a,b&tableId=xxx&from=iso date
 * List orders for the authenticated restaurant. Optionally filter by one or
 * more statuses (comma-separated), table, and creation time.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const restaurantId = getAuthRestaurantId(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");
    const from = searchParams.get("from");

    await dbConnect();

    const query: Record<string, unknown> = { restaurantId };
    if (status) {
      const statuses = status.split(",").map((value) => value.trim()).filter(Boolean);
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    if (tableId) query.tableId = tableId;
    if (from) query.createdAt = { $gte: new Date(from) };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return ok(orders);
  });
}

/**
 * POST /api/orders
 * Public: place an order from a table. The table is resolved from its code
 * (or, for legacy links, verified by restaurantId + tableId). Item names,
 * prices, tax and totals are always computed here from the restaurant's
 * products and settings — client-supplied amounts are never trusted.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = placeOrderSchema.parse(await request.json());

    await dbConnect();

    const table = body.tableCode
      ? await Table.findOne({ tableCode: body.tableCode })
      : isValidObjectId(body.tableId)
        ? await Table.findOne({ _id: body.tableId, restaurantId: body.restaurantId })
        : null;
    if (!table) {
      throw new ApiError(404, "Table not found");
    }

    const restaurantId: string = table.restaurantId;

    const productIds = [...new Set(body.items.map((item) => item.productId))];
    if (!productIds.every((id) => isValidObjectId(id))) {
      throw new ApiError(400, "Invalid product in order");
    }

    const [products, restaurant] = await Promise.all([
      Product.find({ _id: { $in: productIds }, restaurantId }).select("name price isAvailable"),
      isValidObjectId(restaurantId)
        ? Restaurant.findById(restaurantId).select("settings.taxRate")
        : null,
    ]);

    const productMap = new Map(
      products.map((product: { _id: { toString(): string }; name: string; price: number; isAvailable: boolean }) => [
        product._id.toString(),
        product,
      ]),
    );

    const items = body.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new ApiError(400, "An item in your cart is no longer on the menu");
      }
      if (!product.isAvailable) {
        throw new ApiError(409, `${product.name} is currently unavailable`);
      }
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        specialRequests: item.specialRequests,
      };
    });

    const taxRate: number = restaurant?.settings?.taxRate ?? DEFAULT_TAX_RATE;
    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const tax = roundMoney(subtotal * taxRate);

    const order = await Order.create({
      restaurantId,
      tableId: table._id.toString(),
      tableNumber: table.tableNumber,
      items,
      subtotal,
      tax,
      discount: 0,
      totalAmount: roundMoney(subtotal + tax),
      specialRequests: body.specialRequests,
    });

    return ok(order, 201);
  });
}
