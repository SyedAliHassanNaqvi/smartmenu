'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface PendingOrder {
  orderId: string;
  restaurantName: string;
  ownerEmail: string;
  ownerName: string;
  amount: number;
  currency: string;
}

function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [state, setState] = useState<'processing' | 'error' | 'done'>('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmPayment = async () => {
      const raw = sessionStorage.getItem('xpay_pending_order');

      if (!raw) {
        setState('error');
        setError('We could not find your payment details. Please start the signup again.');
        return;
      }

      let pending: PendingOrder;
      try {
        pending = JSON.parse(raw) as PendingOrder;
      } catch {
        setState('error');
        setError('Payment details are corrupted. Please start the signup again.');
        return;
      }

      if (orderId && pending.orderId !== orderId) {
        setState('error');
        setError('This payment confirmation does not match the pending order.');
        return;
      }

      try {
        const response = await fetch('/api/xpay', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: pending.orderId,
            status: 'success',
            restaurantName: pending.restaurantName,
            ownerEmail: pending.ownerEmail,
            ownerName: pending.ownerName,
            amount: pending.amount,
            currency: pending.currency,
          }),
        });

        const data = await response.json();

        if (response.ok && data.invitationToken) {
          sessionStorage.removeItem('xpay_pending_order');
          setState('done');
          router.replace(`/setup?token=${data.invitationToken}`);
        } else {
          setState('error');
          setError(data.error || 'Failed to confirm payment. Please contact support.');
        }
      } catch (err) {
        console.error('Payment confirmation error:', err);
        setState('error');
        setError('Network error while confirming your payment. Please try again.');
      }
    };

    confirmPayment();
  }, [orderId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {state === 'processing' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Confirming your payment</h2>
            <p className="mt-2 text-sm text-slate-500">
              Setting up your restaurant invitation…
            </p>
          </>
        )}

        {state === 'done' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Payment confirmed!</h2>
            <p className="mt-2 text-sm text-slate-500">Redirecting you to finish your setup…</p>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => router.push('/signup')}>Back to signup</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <PaymentSuccess />
    </Suspense>
  );
}
