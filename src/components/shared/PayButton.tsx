'use client';

import { useState } from 'react';

interface PayButtonProps {
  amount: number; // Amount in cents
  restaurantName: string;
  ownerEmail: string;
  ownerName: string;
  currency?: string;
  disabled?: boolean;
}

export default function PayButton({
  amount,
  restaurantName,
  ownerEmail,
  ownerName,
  currency = 'EUR',
  disabled = false,
}: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/xpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, restaurantName, ownerEmail, ownerName }),
      });

      const data = await response.json();

      if (data.url) {
        // Persist the pending order so /payment/success can confirm it.
        sessionStorage.setItem(
          'xpay_pending_order',
          JSON.stringify({
            orderId: data.orderId,
            restaurantName,
            ownerEmail,
            ownerName,
            amount,
            currency,
          })
        );
        window.location.href = data.url;
        // Don't setLoading(false) — keep spinner while browser navigates away
        return;
      }

      // Server returned a response but no URL — show what the server said
      setError(data.error ?? 'Payment initiation failed. Please try again.');
    } catch (err) {
      console.error('Payment error:', err);
      setError('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handlePayment}
        disabled={loading || disabled}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Redirecting to Nexi XPay...' : `Pay €${(amount / 100).toFixed(2)} with XPay`}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
