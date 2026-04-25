import mongoose from "mongoose";
import { ITable } from "@/types/models";

const tableSchema = new mongoose.Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: String,
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

export const Table = mongoose.models.Table || mongoose.model<ITable>("Table", tableSchema);
