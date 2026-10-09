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

/**
 * Fields an admin may edit. Explicit (no defaults) so a partial update never
 * resets status/occupancy, and system fields (tableCode, qrCode, activeOrder)
 * stay server-controlled.
 */
export const updateTableSchema = z.object({
  tableNumber: z.number().int().positive("Table number must be positive").optional(),
  capacity: z.number().int().positive("Capacity must be positive").optional(),
  location: z.string().trim().max(100).optional(),
  status: z.enum(["available", "occupied", "reserved", "maintenance"]).optional(),
});
