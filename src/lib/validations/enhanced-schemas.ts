import { z } from "zod";

export const productSchemaEnhanced = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  price: z.number().positive("Price must be positive"),
  category: z.enum(["appetizer", "main", "dessert", "beverage", "special"]),
  image: z.string().url("Invalid image URL").optional(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().positive("Preparation time must be positive"),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  vegetarian: z.boolean().default(false),
  vegan: z.boolean().default(false),
  calories: z.number().positive().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().default(0),
  
  // New fields for detailed spec
  tags: z.array(z.string()).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  embeddings: z.array(z.number()).optional(), // Vector embeddings for semantic search
  arModelUrl: z.string().url().optional(), // 3D model for AR view
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ProductEnhanced = z.infer<typeof productSchemaEnhanced>;

export const orderSchemaEnhanced = z.object({
  id: z.string().optional(),
  tableId: z.string(),
  tableNumber: z.number().positive(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive(),
      specialRequests: z.string().optional(),
      status: z.enum(["pending", "preparing", "ready", "served"]).default("pending"),
    })
  ).min(1),
  
  status: z.enum(["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"]).default("pending"),
  totalAmount: z.number().positive(),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  discountCode: z.string().optional(),
  gameScore: z.number().min(0).default(0), // Gamified loyalty score
  
  paymentMethod: z.enum(["cash", "card", "mobile", "wallet"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  
  specialRequests: z.string().optional(),
  estimatedTime: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type OrderEnhanced = z.infer<typeof orderSchemaEnhanced>;

export const tableSchemaEnhanced = z.object({
  id: z.string().optional(),
  tableNumber: z.number().positive(),
  capacity: z.number().positive(),
  location: z.string().optional(),
  status: z.enum(["available", "occupied", "cleaning", "maintenance"]).default("available"),
  qrCode: z.string().optional(),
  currentGuests: z.number().min(0).default(0),
  activeOrderId: z.string().optional(),
  lastUpdated: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TableEnhanced = z.infer<typeof tableSchemaEnhanced>;
