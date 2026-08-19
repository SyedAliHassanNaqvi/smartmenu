import { z } from "zod";

/**
 * Body accepted by POST /api/xpay to initiate a Nexi XPay payment session.
 */
export const initiatePaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("EUR"),
  restaurantName: z.string().min(1, "Restaurant name is required"),
  ownerEmail: z.string().email("A valid owner email is required"),
  ownerName: z.string().min(1, "Owner name is required"),
});

/**
 * Body accepted by PUT /api/xpay to confirm a successful payment and
 * create the restaurant invitation.
 */
export const paymentSuccessSchema = z.object({
  orderId: z.string().min(1),
  status: z.string().min(1),
  restaurantName: z.string().min(1),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(1),
  amount: z.coerce.number(),
  currency: z.string().length(3).optional(),
});

export type InitiatePayment = z.infer<typeof initiatePaymentSchema>;
export type PaymentSuccess = z.infer<typeof paymentSuccessSchema>;
