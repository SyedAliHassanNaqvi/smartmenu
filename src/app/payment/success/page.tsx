'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const confirmMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ invitationToken: string }>('/api/xpay', { method: 'PUT', body: { orderId: id } }),
    onSuccess: (data) => {
      router.replace(`/setup?token=${data.invitationToken}`);
    },
  });

  // Confirm exactly once per page load (guards against StrictMode double effects).
  const { mutate } = confirmMutation;
  const startedRef = useRef(false);
  useEffect(() => {
    if (!orderId || startedRef.current) return;
    startedRef.current = true;
    mutate(orderId);
  }, [orderId, mutate]);

  const error = !orderId
    ? 'We could not find your payment reference. Please start the signup again.'
    : confirmMutation.error?.message;
  const pending = (confirmMutation.error as (Error & { status?: number }) | null)?.status === 409;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {error ? (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {pending ? 'Payment still processing' : 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              {orderId && (
                <Button
                  variant="outline"
                  onClick={() => mutate(orderId)}
                  disabled={confirmMutation.isPending}
                >
                  Check again
                </Button>
              )}
              <Button onClick={() => router.push('/signup')}>Back to signup</Button>
            </div>
          </>
        ) : confirmMutation.isSuccess ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Payment confirmed!</h2>
            <p className="mt-2 text-sm text-slate-500">Redirecting you to finish your setup…</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Confirming your payment</h2>
            <p className="mt-2 text-sm text-slate-500">Verifying with Nexi XPay…</p>
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
