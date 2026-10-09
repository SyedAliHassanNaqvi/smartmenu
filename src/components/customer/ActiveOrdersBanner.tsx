'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { ChevronRight, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useNow } from '@/hooks/use-now';
import { formatCountdown } from '@/utils/time';
import type { PlacedOrderRef } from '@/store/cart-slice';
import type { PublicOrder } from '@/types/public';

const STATUS_LABEL: Record<PublicOrder['status'], string> = {
  placed: 'Received',
  confirmed: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready!',
  served: 'Served',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const HIDDEN: PublicOrder['status'][] = ['served', 'completed', 'cancelled'];

/**
 * Compact list of this table's in-progress orders, each linking to its tracker.
 */
export function ActiveOrdersBanner({ code, orders }: { code: string; orders: PlacedOrderRef[] }) {
  const now = useNow();

  const results = useQueries({
    queries: orders.map((ref) => ({
      queryKey: queryKeys.orders.detail(ref.id),
      queryFn: () => apiFetch<PublicOrder>(`/api/orders/${ref.id}`),
      refetchInterval: 10000,
      retry: false,
    })),
  });

  const active = results
    .map((result) => result.data)
    .filter((order): order is PublicOrder => !!order && !HIDDEN.includes(order.status));

  if (active.length === 0) return null;

  return (
    <div className="space-y-2 mb-5">
      {active.map((order) => {
        const msLeft = order.readyBy ? new Date(order.readyBy).getTime() - now : null;
        const ready = order.status === 'ready';
        return (
          <Link
            key={order._id}
            href={`/customer/${code}/order/${order._id}`}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm active:scale-[0.99] transition ${
              ready ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-100 bg-white'
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                Order #{order._id.slice(-6).toUpperCase()} ·{' '}
                <span className={ready ? 'text-emerald-600' : 'text-indigo-600'}>{STATUS_LABEL[order.status]}</span>
              </p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {ready
                  ? 'Coming to your table'
                  : msLeft !== null
                    ? msLeft > 0
                      ? `Ready in ${formatCountdown(msLeft)}`
                      : 'Any moment now'
                    : 'Waiting for a ready time'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </Link>
        );
      })}
    </div>
  );
}
