import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { dbConnect } from "@/lib/db";
import { Invitation } from "@/lib/models/invitation.model";
import { serverEnv } from "@/lib/env";
import { withErrorHandling, ok } from "@/lib/api";

const resend = serverEnv.RESEND_API_KEY
  ? new Resend(serverEnv.RESEND_API_KEY)
  : null;

/**
 * POST /api/payments/nexi/webhook
 * Handle a Nexi payment webhook. On completion, creates a pending invitation
 * for the restaurant owner and emails them a setup link.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    console.log("[webhook] Nexi payment event:", body);

    const {
      paymentId,
      status,
      amount,
      currency,
      customerEmail,
      restaurantName,
    } = body as Record<string, unknown>;

    if (!paymentId || status !== "completed") {
      return ok({ received: true });
    }

    await dbConnect();

    const existingInvitation = await Invitation.findOne({ paymentId });
    if (existingInvitation) {
      return ok({ received: true });
    }

    const invitationToken = randomBytes(32).toString("hex");

    const invitation = new Invitation({
      email: customerEmail,
      invitationToken,
      restaurantName,
      status: "pending",
      paymentId,
      amount: Number(amount),
      currency: currency || "EUR",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await invitation.save();

    if (resend) {
      await sendInvitationEmail({
        to: String(customerEmail),
        restaurantName: String(restaurantName),
        amount: String(amount),
        currency: String(currency || "EUR"),
        invitationToken,
      });
    } else {
      console.warn("[webhook] RESEND_API_KEY not configured, skipping email");
    }

    return ok({
      received: true,
      invitationId: invitation._id.toString(),
      token: invitationToken,
    });
  });
}

async function sendInvitationEmail({
  to,
  restaurantName,
  amount,
  currency,
  invitationToken,
}: {
  to: string;
  restaurantName: string;
  amount: string;
  currency: string;
  invitationToken: string;
}): Promise<void> {
  const setupUrl = `${serverEnv.NEXT_PUBLIC_APP_URL}/setup?token=${invitationToken}`;

  try {
    await resend!.emails.send({
      from: "SmartMenu <noreply@smartmenu.app>",
      to,
      subject: `Welcome to SmartMenu - Complete Your ${restaurantName} Setup`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to SmartMenu!</h1>
          <p>Thank you for your payment. Your restaurant <strong>${restaurantName}</strong> is ready to be set up.</p>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0369a1; margin-top: 0;">Payment Confirmed</h2>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Restaurant:</strong> ${restaurantName}</p>
          </div>
          <p>To complete your restaurant setup and create your admin account, please click the button below:</p>
          <a href="${setupUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Complete Setup
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 7 days. If you didn't request this setup, please ignore this email.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    // Never fail the webhook because an email failed to send.
    console.error("[webhook] Failed to send invitation email:", emailError);
  }
}
