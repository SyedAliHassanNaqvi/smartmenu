import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const { amount, currency } = await request.json();

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
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
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

  return NextResponse.json({ url: data.hostedPage });
}