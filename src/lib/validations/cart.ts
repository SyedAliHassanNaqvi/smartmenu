import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number().positive(),
  quantity: z.number().positive("Quantity must be positive"),
  image: z.string().optional(),
  specialRequests: z.string().optional(),
});

export const cartSchema = z.object({
  tableId: z.string(),
  items: z.array(cartItemSchema),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  discountCode: z.string().optional(),
  total: z.number().min(0),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
