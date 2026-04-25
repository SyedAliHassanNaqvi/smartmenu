import { z } from "zod";

export const tableSchema = z.object({
  id: z.string().optional(),
  tableNumber: z.number().positive("Table number must be positive"),
  capacity: z.number().positive("Capacity must be positive"),
  location: z.string().optional(),
  status: z.enum(["available", "occupied", "reserved", "maintenance"]).default("available"),
  qrCode: z.string().optional(),
  currentGuests: z.number().min(0).default(0),
  activeOrder: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Table = z.infer<typeof tableSchema>;

export const createTableSchema = tableSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  currentGuests: true,
});

export const updateTableSchema = tableSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
});
