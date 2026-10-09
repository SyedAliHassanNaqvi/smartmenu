import { z } from "zod";

export const orderStatusSchema = z.enum([
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
]);

export const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive(),
  specialRequests: z.string().optional(),
  status: z.enum(["pending", "preparing", "ready", "served"]).default("pending"),
});

export const orderSchema = z.object({
  id: z.string().optional(),
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  tableId: z.string(),
  tableNumber: z.number().positive(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  status: orderStatusSchema.default("placed"),
  totalAmount: z.number().positive(),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  discountCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "mobile", "wallet"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  specialRequests: z.string().optional(),
  estimatedTime: z.number().optional(),
  readyBy: z.coerce.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

/**
 * Body accepted by the public POST /api/orders. Only identities and quantities
 * come from the client — names, prices, tax and totals are computed server-side
 * from the restaurant's products and settings.
 */
export const placeOrderSchema = z
  .object({
    tableCode: z.string().min(1).optional(),
    // Legacy QR links (restaurantId/tableNumber) — verified against the DB.
    restaurantId: z.string().min(1).optional(),
    tableId: z.string().min(1).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(50),
          specialRequests: z.string().trim().max(200).optional(),
        }),
      )
      .min(1, "At least one item is required")
      .max(50, "Too many items in one order"),
    specialRequests: z.string().trim().max(500).optional(),
  })
  .refine((body) => body.tableCode || (body.restaurantId && body.tableId), {
    message: "A table code is required",
  });

export type PlaceOrder = z.infer<typeof placeOrderSchema>;

/**
 * Body accepted by the admin PATCH /api/orders/[id].
 */
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  readyBy: z.coerce.date().nullable().optional(),
});
