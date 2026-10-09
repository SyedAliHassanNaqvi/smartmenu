'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/utils/helpers';
import { apiFetch } from '@/lib/api-client';
import type { PublicRestaurant, PublicTable } from '@/types/public';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

export function CartView({
  table,
  restaurant,
  code,
}: {
  table: PublicTable;
  restaurant: PublicRestaurant;
  code: string;
}) {
  const router = useRouter();

  const [error, setError] = useState('');

  const {
    items,
    itemCount,
    subtotal,
    tax,
    taxRate,
    total,
    updateItemQuantity,
    removeFromCart,
    markOrderPlaced,
  } = useCart(code, restaurant.taxRate);

  const menuUrl = `/customer/${code}`;

  const placeOrder = useMutation({
    mutationFn: () =>
      apiFetch<{ _id: string }>('/api/orders', {
        method: 'POST',
        body: {
          tableCode: code.includes('/') ? undefined : code,
          restaurantId: table.restaurantId,
          tableId: table._id,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      }),
    onSuccess: (data) => {
      // Saved per table (persisted), so the tracker survives refreshes.
      markOrderPlaced(data._id);
      router.replace(`/customer/${code}/order/${data._id}`);
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : 'Failed to place order'),
  });

  const placing = placeOrder.isPending;

  const handlePlaceOrder = () => {
    if (items.length === 0 || placing) return;
    setError('');
    placeOrder.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(menuUrl)}
            className="p-2 -ml-2 rounded-full text-slate-600 active:scale-95 transition"
            aria-label="Back to menu"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Your Cart</h1>
            <p className="text-xs text-slate-500">
              Table {table.tableNumber}
              {itemCount > 0 ? ` • ${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : ''}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="h-14 w-14 text-slate-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6">Add some delicious items to get started.</p>
            <button
              onClick={() => router.push(menuUrl)}
              className="rounded-full bg-indigo-600 text-white px-6 py-3 font-semibold active:scale-95 transition"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex gap-3"
                >
                  <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      '🍽️'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-300 hover:text-red-500 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-indigo-600 font-semibold mt-0.5">
                      {formatPrice(item.price, restaurant.currency)}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 p-0.5">
                        <button
                          onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                          className="h-7 w-7 rounded-full bg-white text-indigo-600 flex items-center justify-center active:scale-95 transition shadow-sm"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                          className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center active:scale-95 transition shadow-sm"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity, restaurant.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal, restaurant.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({Math.round(taxRate * 1000) / 10}%)</span>
                  <span className="font-medium">{formatPrice(tax, restaurant.currency)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600">{formatPrice(total, restaurant.currency)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl mt-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full flex items-center justify-between bg-indigo-600 text-white rounded-2xl px-5 py-4 shadow-xl active:scale-[0.98] transition disabled:opacity-60"
            >
              <span className="font-bold">
                {placing ? 'Placing Order...' : 'Place Order'}
              </span>
              <span className="flex items-center gap-1.5 font-bold">{formatPrice(total, restaurant.currency)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}