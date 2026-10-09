import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { initiatePaymentSchema, confirmPaymentSchema } from "@/lib/validations/payment";
import { withErrorHandling, ok } from "@/lib/api";
import { confirmSubscriptionPayment, startSubscriptionCheckout } from "@/services/subscription-checkout";

/**
 * POST /api/xpay
 * Start a restaurant subscription checkout for the chosen plan. Returns the
 * Nexi XPay hosted page URL to redirect to.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const input = initiatePaymentSchema.parse(await request.json());
    await dbConnect();
    return ok(await startSubscriptionCheckout(input));
  });
}

/**
 * PUT /api/xpay
 * Called by /payment/success after Nexi redirects back. Verifies the payment
 * with Nexi and returns the setup invitation token.
 */
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const { orderId } = confirmPaymentSchema.parse(await request.json());
    await dbConnect();
    return ok(await confirmSubscriptionPayment(orderId));
  });
}
