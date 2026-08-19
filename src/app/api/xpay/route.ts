import type { NextRequest } from "next/server";
import { randomUUID, randomBytes } from "crypto";
import { dbConnect } from "@/lib/db";
import { Invitation } from "@/lib/models/invitation.model";
import {
  initiatePaymentSchema,
  paymentSuccessSchema,
} from "@/lib/validations/payment";
import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok, fail } from "@/lib/api";

/**
 * POST /api/xpay
 * Initiate a Nexi XPay hosted payment page for a restaurant subscription.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { amount, currency } = initiatePaymentSchema.parse(body);

    const orderId = `ORDER_${Date.now()}`;
    const appUrl = serverEnv.NEXT_PUBLIC_APP_URL;

    const payload = {
      order: {
        orderId,
        amount: String(amount),
        currency,
      },
      paymentSession: {
        actionType: "PAY",
        amount: String(amount),
        recurrence: {
          action: "NO_RECURRING",
        },
        resultUrl: `${appUrl}/payment/success?orderId=${orderId}`,
        cancelUrl: `${appUrl}/payment/cancel?orderId=${orderId}`,
      },
    };

    let response: Response;
    let rawText: string;

    try {
      response = await fetch(serverEnv.NEXI_XPAY_API_URL || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": serverEnv.NEXI_XPAY_API_KEY || "",
          "Correlation-Id": randomUUID(),
        },
        body: JSON.stringify(payload),
      });
      rawText = await response.text();
    } catch (error) {
      console.error("[xpay] Network error:", error);
      throw new ApiError(502, "Could not reach Nexi API");
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText);
    } catch {
      return fail("Invalid JSON from Nexi", 502);
    }

    if (!response.ok) {
      return fail(
        (typeof data.errors === "string" && data.errors) ||
          "Payment initiation failed",
        response.status,
      );
    }

    if (!data.hostedPage) {
      return fail("No hostedPage in response", 502);
    }

    return ok({
      url: data.hostedPage,
      orderId,
    });
  });
}

/**
 * PUT /api/xpay
 * Confirm a successful payment and create the invitation for restaurant setup.
 */
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const parsed = paymentSuccessSchema.parse(body);

    if (parsed.status !== "success") {
      return ok({ message: "Payment not successful" });
    }

    await dbConnect();

    const invitationToken = randomBytes(32).toString("hex");

    const invitation = new Invitation({
      email: parsed.ownerEmail,
      invitationToken,
      restaurantName: parsed.restaurantName,
      status: "pending",
      paymentId: parsed.orderId,
      amount: parsed.amount,
      currency: parsed.currency || "EUR",
    });

    await invitation.save();

    console.log(
      `Invitation created for ${parsed.ownerEmail} with token ${invitationToken}`,
    );

    return ok({ success: true, invitationToken });
  });
}
