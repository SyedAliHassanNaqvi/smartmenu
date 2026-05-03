import mongoose from "mongoose";

export interface IInvitation {
  _id?: string;
  email: string;
  invitationToken: string;
  restaurantName: string;
  restaurantId?: string; // Will be set when admin creates account
  status: "pending" | "used" | "expired";
  paymentId: string;
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
    amount: {
      type: Number,
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
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire

export const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>("Invitation", invitationSchema);