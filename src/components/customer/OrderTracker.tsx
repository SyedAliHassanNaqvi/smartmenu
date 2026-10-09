'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, ChefHat, Clock, PartyPopper, Plus, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useCart } from '@/hooks/use-cart';
import { useNow } from '@/hooks/use-now';
import { formatPrice } from '@/utils/helpers';
import { formatClock, formatCountdown } from '@/utils/time';
import { cn } from '@/utils/cn';
import type { PublicOrder, PublicRestaurant, PublicTable } from '@/types/public';

/** Diner-facing steps; "completed" is shown as the last step being done. */
const STEPS = [
  { status: 'placed', label: 'Order received' },
  { status: 'confirmed', label: 'Accepted by the kitchen' },
  { status: 'preparing', label: 'Being prepared' },
  { status: 'ready', label: 'Ready' },
  { status: 'served', label: 'Served — enjoy!' },
] as const;

const STEP_INDEX: Record<PublicOrder['status'], number> = {
  placed: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  served: 4,
  completed: 4,
  cancelled: -1,
};

const POLL_MS = 3000;

export function OrderTracker({
  table,
  restaurant,
  code,
  orderId,
}: {
  table: PublicTable;
  restaurant: PublicRestaurant;
  code: string;
  orderId: string;
}) {
  const router = useRouter();
  const now = useNow();
  const { forgetOrder } = useCart(code, restaurant.taxRate);
  const menuUrl = `/customer/${code}`;

  const { data: order, error, isLoading } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => apiFetch<PublicOrder>(`/api/orders/${orderId}`),
    // Keep polling until the order is finished (real-time push arrives in a later task).
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'cancelled' ? false : POLL_MS;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const notFound = (error as (Error & { status?: number }) | null)?.status === 404;
  useEffect(() => {
    if (notFound) forgetOrder(orderId);
  }, [notFound, forgetOrder, orderId]);

  const money = (value: number) => formatPrice(value, restaurant.currency);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-5xl mb-4">🧾</p>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {notFound ? 'Order not found' : 'Could not load your order'}
          </h2>
          <p className="text-slate-500 mb-6">{notFound ? 'It may have been removed by the restaurant.' : error?.message}</p>
          <button
            onClick={() => router.push(menuUrl)}
            className="rounded-full bg-indigo-600 text-white px-6 py-3 font-semibold active:scale-95 transition"
          >
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  const stepIndex = STEP_INDEX[order.status];
  const cancelled = order.status === 'cancelled';
  const readyAt = order.readyBy ? new Date(order.readyBy).getTime() : null;
  const msLeft = readyAt !== null ? readyAt - now : null;
  const isReady = stepIndex >= 3;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(menuUrl)}
            className="p-2 -ml-2 rounded-full text-slate-600 active:scale-95 transition"
            aria-label="Back to menu"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500">
              {restaurant.name} • Table {table.tableNumber} • placed {formatClock(order.createdAt)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Hero: ready-by countdown / state */}
        <section
          className={cn(
            'rounded-3xl p-6 text-white shadow-lg',
            cancelled
              ? 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-200'
              : isReady
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
                : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200'
          )}
        >
          {cancelled ? (
            <div className="flex items-center gap-3">
              <XCircle className="h-10 w-10 shrink-0" />
              <div>
                <p className="text-xl font-bold">Order cancelled</p>
                <p className="text-sm text-white/80">Please ask a member of staff if you have questions.</p>
              </div>
            </div>
          ) : isReady ? (
            <div className="flex items-center gap-3">
              <PartyPopper className="h-10 w-10 shrink-0" />
              <div>
                <p className="text-2xl font-extrabold">
                  {stepIndex >= 4 ? 'Served — enjoy your meal!' : 'Your order is ready!'}
                </p>
                <p className="text-sm text-white/80">
                  {stepIndex >= 4 ? 'Thanks for dining with us.' : 'The staff will bring it to your table.'}
                </p>
              </div>
            </div>
          ) : msLeft !== null ? (
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                <Clock className="h-4 w-4" /> Estimated ready by {formatClock(readyAt!)}
              </p>
              <p className="mt-1 text-5xl font-extrabold tabular-nums tracking-tight">
                {msLeft > 0 ? formatCountdown(msLeft) : 'Any moment now'}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ChefHat className="h-10 w-10 shrink-0" />
              <div>
                <p className="text-xl font-bold">Sent to the kitchen</p>
                <p className="text-sm text-white/80">We&apos;ll show a ready time as soon as the restaurant sets one.</p>
              </div>
            </div>
          )}
        </section>

        {/* Timeline */}
        {!cancelled && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <ol className="space-y-4">
              {STEPS.map((step, index) => {
                // Steps up to the current status have happened; the next one is in progress.
                const done = index <= stepIndex;
                const current = index === stepIndex + 1;
                return (
                  <li key={step.status} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                        done && 'border-indigo-600 bg-indigo-600 text-white',
                        current && 'border-indigo-600 text-indigo-600 animate-pulse',
                        !done && !current && 'border-slate-200 text-slate-300'
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        'text-sm',
                        done || current ? 'font-semibold text-slate-900' : 'text-slate-400'
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Items */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Your items</h2>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-3">
                <span className="text-slate-700">
                  <span className="font-semibold text-slate-900">{item.quantity}×</span> {item.productName}
                </span>
                <span className="text-slate-600">{money(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>{money(order.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="text-indigo-600">{money(order.totalAmount)}</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <button
            onClick={() => router.push(menuUrl)}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl px-5 py-4 font-bold shadow-xl active:scale-[0.98] transition"
          >
            <Plus className="h-5 w-5" /> Order more
          </button>
        </div>
      </div>
    </div>
  );
}
