import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/db';
import { Invitation } from '@/lib/models/invitation.model';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  const { amount, currency, restaurantName, ownerEmail, ownerName } = await request.json();

  // Validate required fields for invitation
  if (!restaurantName || !ownerEmail || !ownerName) {
    return NextResponse.json(
      { error: 'Restaurant name, owner email, and owner name are required' },
      { status: 400 }
    );
  }

  const orderId = `ORDER_${Date.now()}`;
  const cur = currency || 'EUR';

  const payload = {
    order: {
      orderId,
      amount: String(amount),   // ← must be a string e.g. "1000"
      currency: cur,
    },
    paymentSession: {
      actionType: 'PAY',
      amount: String(amount),
      recurrence: {
        action: 'NO_RECURRING',
      },
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?orderId=${orderId}`,
    },
  };

  let response: Response;
  let rawText: string;

  try {
    response = await fetch(process.env.NEXI_XPAY_API_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.NEXI_XPAY_API_KEY || '',
        'Correlation-Id': randomUUID(),   // ← required by Nexi
      },
      body: JSON.stringify(payload),
    });
    rawText = await response.text();
  } catch (err: any) {
    console.error('[xpay] Network error:', err?.message, err?.cause);
    return NextResponse.json({ error: 'Could not reach Nexi API' }, { status: 502 });
  }

  console.log('[xpay] Status:', response.status);
  console.log('[xpay] Body:', rawText);

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from Nexi', raw: rawText }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.errors ?? 'Payment initiation failed' },
      { status: response.status }
    );
  }

  if (!data.hostedPage) {
    return NextResponse.json({ error: 'No hostedPage in response', raw: data }, { status: 502 });
  }

  // Store payment info for later verification (you might want to use a database here)
  // For now, we'll create the invitation when payment succeeds

  return NextResponse.json({
    url: data.hostedPage,
    orderId
  });
}

// Webhook endpoint to handle payment success
export async function PUT(request: Request) {
  try {
    const { orderId, status, restaurantName, ownerEmail, ownerName, amount, currency } = await request.json();

    if (status !== 'success') {
      return NextResponse.json({ message: 'Payment not successful' });
    }

    await dbConnect();

    // Generate unique invitation token
    const invitationToken = randomBytes(32).toString('hex');

    // Create invitation record
    const invitation = new Invitation({
      email: ownerEmail,
      invitationToken,
      restaurantName,
      status: 'pending',
      paymentId: orderId,
      amount: parseFloat(amount),
      currency: currency || 'EUR',
    });

    await invitation.save();

    // TODO: Send email with invitation link using Resend API
    // const setupLink = `${process.env.NEXT_PUBLIC_APP_URL}/setup?token=${invitationToken}`;
    // await sendInvitationEmail(ownerEmail, restaurantName, setupLink);

    console.log(`Invitation created for ${ownerEmail} with token ${invitationToken}`);

    return NextResponse.json({ success: true, invitationToken });
  } catch (error: any) {
    console.error('Error processing payment success:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}