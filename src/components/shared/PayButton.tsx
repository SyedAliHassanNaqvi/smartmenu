'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { formatPlanPrice, type Plan } from '@/config/plans';

interface PayButtonProps {
  plan: Plan;
  restaurantName: string;
  ownerEmail: string;
  ownerName: string;
  disabled?: boolean;
}

/**
 * Starts a subscription checkout for `plan` and redirects to the Nexi XPay
 * hosted page. The server decides the amount from the plan.
 */
export default function PayButton({
  plan,
  restaurantName,
  ownerEmail,
  ownerName,
  disabled = false,
}: PayButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const paymentMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ url: string; orderId: string }>('/api/xpay', {
        method: 'POST',
        body: { plan: plan.id, restaurantName, ownerEmail, ownerName },
      }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: Error) => {
      setError(err.message || 'Network error. Please check your connection and try again.');
    },
  });

  const loading = paymentMutation.isPending;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={() => {
          setError(null);
          paymentMutation.mutate();
        }}
        disabled={loading || disabled}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {loading ? 'Redirecting to Nexi XPay...' : `Pay ${formatPlanPrice(plan)} with XPay`}
      </button>

      {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
    </div>
  );
}
