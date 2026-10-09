import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { PaymentIntent } from "@/lib/models/payment-intent.model";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";
import { confirmSubscriptionPayment } from "@/services/subscription-checkout";

/**
 * POST /api/payments/nexi/webhook
 * Nexi XPay payment notification. The body is only used to find the payment:
 * the security token must match the one Nexi issued for that checkout, and the
 * payment state is always re-fetched from Nexi before anything is granted.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = (await request.json().catch(() => ({}))) as {
      securityToken?: string;
      operation?: { orderId?: string };
    };

    const orderRef = body.operation?.orderId;
    if (!orderRef) {
      return ok({ received: true });
    }

    await dbConnect();

    const intent = await PaymentIntent.findOne({ orderRef });
    if (!intent) {
      return ok({ received: true });
    }

    if (!intent.securityToken || body.securityToken !== intent.securityToken) {
      throw new ApiError(401, "Invalid notification");
    }

    if (intent.purpose === "subscription") {
      try {
        await confirmSubscriptionPayment(orderRef);
      } catch (error) {
        // Pending/failed payments are expected notifications, not webhook errors.
        if (!(error instanceof ApiError) || error.status >= 500) throw error;
      }
    }

    return ok({ received: true });
  });
}
