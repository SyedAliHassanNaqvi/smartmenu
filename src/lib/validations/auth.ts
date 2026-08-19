import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  restaurantDetails: z.object({
    ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    timezone: z.string().default("Europe/Rome"),
    language: z.string().default("en"),
  }),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "staff", "customer"]),
  createdAt: z.date(),
});

export type Login = z.infer<typeof loginSchema>;
export type Signup = z.infer<typeof signupSchema>;
export type User = z.infer<typeof userSchema>;
