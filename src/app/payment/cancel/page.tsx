'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

function PaymentCancel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <XCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Payment cancelled</h2>
        <p className="mt-2 text-sm text-slate-500">
          {orderId && (
            <>
              Order <span className="font-semibold">{orderId}</span> was not completed. No charges
              were made.
            </>
          )}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => router.push('/signup')}>Back to signup</Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <PaymentCancel />
    </Suspense>
  );
}
