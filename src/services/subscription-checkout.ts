import { randomBytes } from "crypto";
import { Resend } from "resend";
import { PaymentIntent } from "@/lib/models/payment-intent.model";
import { Invitation } from "@/lib/models/invitation.model";
import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/api-error";
import { getPlan, formatPlanPrice, type PlanId } from "@/config/plans";
import { createHostedPayment, generateOrderRef, getPaymentState } from "@/services/xpay-service";

/**
 * Restaurant subscription checkout: plan → XPay hosted page → verified payment →
 * setup invitation. Call these after `dbConnect()`.
 */

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const resend = serverEnv.RESEND_API_KEY ? new Resend(serverEnv.RESEND_API_KEY) : null;

export async function startSubscriptionCheckout(input: {
  plan: PlanId;
  restaurantName: string;
  ownerEmail: string;
  ownerName: string;
}): Promise<{ url: string; orderId: string }> {
  const plan = getPlan(input.plan);
  if (!plan) {
    throw new ApiError(400, "Unknown plan");
  }

  const orderRef = generateOrderRef("S");
  const appUrl = serverEnv.NEXT_PUBLIC_APP_URL;

  const intent = await PaymentIntent.create({
    orderRef,
    purpose: "subscription",
    amount: plan.price,
    currency: plan.currency,
    plan: plan.id,
    restaurantName: input.restaurantName,
    ownerEmail: input.ownerEmail,
    ownerName: input.ownerName,
  });

  const { hostedPage, securityToken } = await createHostedPayment({
    orderRef,
    amount: plan.price,
    currency: plan.currency,
    resultUrl: `${appUrl}/payment/success?orderId=${orderRef}`,
    cancelUrl: `${appUrl}/payment/cancel?orderId=${orderRef}`,
  });

  if (securityToken) {
    intent.securityToken = securityToken;
    await intent.save();
  }

  return { url: hostedPage, orderId: orderRef };
}

/**
 * Confirm a subscription payment with Nexi and issue the setup invitation.
 * Idempotent: the redirect page and the webhook may both call this; only one
 * invitation is ever created per payment.
 */
export async function confirmSubscriptionPayment(orderRef: string): Promise<{ invitationToken: string }> {
  const intent = await PaymentIntent.findOne({ orderRef, purpose: "subscription" });
  if (!intent) {
    throw new ApiError(404, "Payment not found");
  }
  if (intent.status === "paid" && intent.invitationToken) {
    return { invitationToken: intent.invitationToken };
  }

  const payment = await getPaymentState(orderRef);

  if (payment.state === "pending") {
    throw new ApiError(409, "Your payment has not been completed yet. Please wait a moment and refresh.");
  }
  if (payment.state === "failed") {
    await PaymentIntent.updateOne({ _id: intent._id, status: "created" }, { status: "failed" });
    throw new ApiError(402, "Your payment was not successful. Please try again.");
  }
  if (payment.amount !== undefined && payment.amount !== intent.amount) {
    console.error("[xpay] Amount mismatch for", orderRef, payment.amount, intent.amount);
    throw new ApiError(409, "Payment amount does not match the selected plan. Please contact support.");
  }

  // Atomically claim the payment so concurrent confirmations create one invitation.
  const invitationToken = randomBytes(32).toString("hex");
  const claimed = await PaymentIntent.findOneAndUpdate(
    { _id: intent._id, status: { $ne: "paid" } },
    { status: "paid", paidAt: new Date(), invitationToken },
    { new: true }
  );

  if (!claimed) {
    const current = await PaymentIntent.findById(intent._id);
    if (!current?.invitationToken) {
      throw new ApiError(409, "Payment is being processed. Please refresh in a moment.");
    }
    return { invitationToken: current.invitationToken };
  }

  await Invitation.create({
    email: intent.ownerEmail,
    invitationToken,
    restaurantName: intent.restaurantName,
    status: "pending",
    paymentId: orderRef,
    plan: intent.plan,
    amount: intent.amount,
    currency: intent.currency,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
  });

  await sendInvitationEmail({
    to: intent.ownerEmail!,
    restaurantName: intent.restaurantName!,
    amount: formatPlanPrice({ price: intent.amount, currency: intent.currency }),
    invitationToken,
  });

  return { invitationToken };
}

async function sendInvitationEmail({
  to,
  restaurantName,
  amount,
  invitationToken,
}: {
  to: string;
  restaurantName: string;
  amount: string;
  invitationToken: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[subscription] RESEND_API_KEY not configured, skipping invitation email");
    return;
  }

  const setupUrl = `${serverEnv.NEXT_PUBLIC_APP_URL}/setup?token=${invitationToken}`;
  const safeName = escapeHtml(restaurantName);

  try {
    await resend.emails.send({
      from: "Vision Dine <noreply@visiondine.app>",
      to,
      subject: `Welcome to Vision Dine - Complete Your ${restaurantName} Setup`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Welcome to Vision Dine!</h1>
          <p>Thank you for your payment. Your restaurant <strong>${safeName}</strong> is ready to be set up.</p>
          <div style="background-color: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #4338ca; margin-top: 0;">Payment Confirmed</h2>
            <p><strong>Amount:</strong> ${amount}</p>
            <p><strong>Restaurant:</strong> ${safeName}</p>
          </div>
          <p>To complete your restaurant setup and create your admin account, click the button below:</p>
          <a href="${setupUrl}"
             style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Complete Setup
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 7 days. If you didn't request this setup, please ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    // Never fail a confirmed payment because an email failed to send.
    console.error("[subscription] Failed to send invitation email:", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
