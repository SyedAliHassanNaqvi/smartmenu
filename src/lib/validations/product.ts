import { z } from "zod";

export const productSchema = z.object({
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
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const updateProductSchema = productSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
});
