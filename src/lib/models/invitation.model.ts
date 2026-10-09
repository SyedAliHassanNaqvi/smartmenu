import mongoose from "mongoose";
import { defineModel } from "./define-model";

export interface IInvitation {
  _id?: string;
  email: string;
  invitationToken: string;
  restaurantName: string;
  restaurantId?: string; // Will be set when admin creates account
  status: "pending" | "used" | "expired";
  paymentId: string;
  plan: "starter" | "pro" | "premium";
  amount: number;
  currency: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
}

const invitationSchema = new mongoose.Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantId: {
      type: String,
      sparse: true, // Allow null initially
    },
    status: {
      type: String,
      enum: ["pending", "used", "expired"],
      default: "pending",
    },
    paymentId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["starter", "pro", "premium"],
      default: "starter",
    },
    amount: {
      type: Number, // minor units (cents)
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "EUR",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    usedAt: Date,
  },
  { timestamps: true }
);

// Index for efficient lookups
invitationSchema.index({ email: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ paymentId: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire

export const Invitation = defineModel<IInvitation>("Invitation", invitationSchema);