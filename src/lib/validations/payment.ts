import { z } from "zod";
import { PLAN_IDS } from "@/config/plans";

/**
 * Body accepted by POST /api/xpay to start a subscription checkout.
 * The price comes from the plan on the server — the client never sends an amount.
 */
export const initiatePaymentSchema = z.object({
  plan: z.enum(PLAN_IDS),
  restaurantName: z.string().trim().min(2, "Restaurant name is required").max(100),
  ownerEmail: z.string().trim().email("A valid owner email is required"),
  ownerName: z.string().trim().min(2, "Owner name is required").max(100),
});

/**
 * Body accepted by PUT /api/xpay to confirm a payment. Only the order reference
 * is needed; its status is verified with Nexi on the server.
 */
export const confirmPaymentSchema = z.object({
  orderId: z.string().trim().min(1).max(32),
});

export type InitiatePayment = z.infer<typeof initiatePaymentSchema>;
export type ConfirmPayment = z.infer<typeof confirmPaymentSchema>;
