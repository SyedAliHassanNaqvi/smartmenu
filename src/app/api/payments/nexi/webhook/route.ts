import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Invitation } from '@/lib/models/invitation.model';
import { Resend } from 'resend';

// Initialize Resend for email sending (only if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Nexi webhook received:', body);

    // Validate webhook data (adjust based on Nexi's webhook format)
    const {
      paymentId,
      status,
      amount,
      currency,
      customerEmail,
      restaurantName,
      // Add other fields based on Nexi's webhook documentation
    } = body;

    if (!paymentId || status !== 'completed') {
      console.log('Payment not completed or missing paymentId');
      return NextResponse.json({ received: true });
    }

    await dbConnect();

    // Check if invitation already exists for this payment
    const existingInvitation = await Invitation.findOne({ paymentId });
    if (existingInvitation) {
      console.log('Invitation already exists for payment:', paymentId);
      return NextResponse.json({ received: true });
    }

    // Generate unique invitation token
    const invitationToken = generateInvitationToken();

    // Create invitation record
    const invitation = new Invitation({
      email: customerEmail,
      invitationToken,
      restaurantName,
      status: 'pending',
      paymentId,
      amount: parseFloat(amount),
      currency,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await invitation.save();

    // Send invitation email
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup?token=${invitationToken}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: 'SmartMenu <noreply@smartmenu.app>',
          to: customerEmail,
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

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="color: #6b7280; font-size: 12px;">
                SmartMenu - Digital Restaurant Management<br>
                If you have any questions, contact our support team.
              </p>
            </div>
          `,
        });

        console.log('Invitation email sent to:', customerEmail);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the webhook if email fails, but log it
      }
    } else {
      console.warn('RESEND_API_KEY not configured, skipping email send');
    }

    return NextResponse.json({
      received: true,
      invitationId: invitation._id.toString(),
      token: invitationToken
    });

  } catch (error) {
    console.error('Error processing Nexi webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateInvitationToken(): string {
  // Generate a secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}