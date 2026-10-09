import mongoose from "mongoose";
import { defineModel } from "./define-model";

/**
 * Server-side record of one Nexi XPay checkout. Created before redirecting the
 * payer to the hosted page, so the amount and what was bought never depend on
 * data coming back from the browser.
 */
export interface IPaymentIntent {
  _id?: string;
  /** Our order reference sent to Nexi (max 18 chars). */
  orderRef: string;
  purpose: "subscription" | "order";
  /** Amount in minor units (cents). */
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  /** Token Nexi echoes in its notifications; used to authenticate the webhook. */
  securityToken?: string;
  paidAt?: Date;

  // purpose = "subscription"
  plan?: "starter" | "pro" | "premium";
  restaurantName?: string;
  ownerEmail?: string;
  ownerName?: string;
  invitationToken?: string;

  // purpose = "order" (diner payments)
  restaurantId?: string;
  orderId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const paymentIntentSchema = new mongoose.Schema<IPaymentIntent>(
  {
    orderRef: { type: String, required: true, unique: true },
    purpose: { type: String, enum: ["subscription", "order"], required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "EUR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    securityToken: String,
    paidAt: Date,

    plan: { type: String, enum: ["starter", "pro", "premium"] },
    restaurantName: { type: String, trim: true },
    ownerEmail: { type: String, lowercase: true, trim: true },
    ownerName: { type: String, trim: true },
    invitationToken: String,

    restaurantId: { type: String, index: true },
    orderId: { type: String, index: true },
  },
  { timestamps: true }
);

export const PaymentIntent = defineModel<IPaymentIntent>("PaymentIntent", paymentIntentSchema);
