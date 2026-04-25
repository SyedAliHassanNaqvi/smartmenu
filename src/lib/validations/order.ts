import { z } from "zod";

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
  tableId: z.string(),
  tableNumber: z.number().positive(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  status: z.enum(["placed", "confirmed", "preparing", "ready", "served", "completed", "cancelled"]).default("placed"),
  totalAmount: z.number().positive(),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  discountCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "mobile", "wallet"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  specialRequests: z.string().optional(),
  estimatedTime: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

export const createOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const updateOrderSchema = orderSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
});
