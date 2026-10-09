import mongoose from "mongoose";
import { defineModel } from "./define-model";
import { ITable } from "@/types/models";

const tableSchema = new mongoose.Schema<ITable>(
  {
    restaurantId: {
      type: String,
      required: true,
      index: true, // Multi-tenancy: every table belongs to a restaurant
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: String,
    tableCode: String,
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
    },
    qrCode: String,
    currentGuests: {
      type: Number,
      default: 0,
    },
    activeOrder: String,
  },
  { timestamps: true }
);

// Index for efficient multi-tenant queries
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true }); // Table numbers unique per restaurant
tableSchema.index({ restaurantId: 1, status: 1 });
tableSchema.index({ tableCode: 1 }, { unique: true, sparse: true });

export const Table = defineModel<ITable>("Table", tableSchema);
