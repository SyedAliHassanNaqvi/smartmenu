import mongoose from "mongoose";
import { IOrder } from "@/types/models";

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    productName: String,
    quantity: Number,
    price: Number,
    specialRequests: String,
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served"],
      default: "pending",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema<IOrder>(
  {
    tableId: {
      type: String,
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "ready", "served", "completed", "cancelled"],
      default: "placed",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountCode: String,
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile", "wallet"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    specialRequests: String,
    estimatedTime: Number,
    completedAt: Date,
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
