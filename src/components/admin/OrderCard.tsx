'use client';

import { memo } from 'react';
import { Timer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReadyByPicker } from '@/components/admin/ReadyByPicker';
import { ORDER_ACTION_LABELS, canTransition, nextOrderStatus, type OrderStatus } from '@/lib/order-status';
import { formatPrice } from '@/utils/helpers';
import { formatElapsed } from '@/utils/time';
import { cn } from '@/utils/cn';

export interface AdminOrder {
  _id: string;
  tableId: string;
  tableNumber: number;
  items: { productId: string; productName: string; quantity: number; price: number; specialRequests?: string }[];
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  paymentStatus: string;
  specialRequests?: string;
  readyBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderUpdate = { status?: OrderStatus; readyBy?: string | null };

interface OrderCardProps {
  order: AdminOrder;
  now: number;
  currency: string;
  isNew?: boolean;
  busy?: boolean;
  onUpdate: (order: AdminOrder, update: OrderUpdate) => void;
}

/** Statuses where the kitchen can still set or change the ETA. */
const ETA_EDITABLE: OrderStatus[] = ['placed', 'confirmed', 'preparing'];

function elapsedTone(createdAt: string, now: number): string {
  const minutes = (now - new Date(createdAt).getTime()) / 60000;
  if (minutes >= 20) return 'bg-red-50 text-red-700 ring-red-200';
  if (minutes >= 10) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-slate-50 text-slate-600 ring-slate-200';
}

export const OrderCard = memo(function OrderCard({ order, now, currency, isNew, busy, onUpdate }: OrderCardProps) {
  const next = nextOrderStatus(order.status);
  const cancellable = canTransition(order.status, 'cancelled');
  const isPlaced = order.status === 'placed';

  return (
    <article
      className={cn(
        'rounded-xl border bg-white p-4 shadow-sm transition',
        isNew ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-200',
        busy && 'opacity-60'
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-sm font-bold text-white">
            T{order.tableNumber}
          </span>
          <span className="font-mono text-xs text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
          {isNew && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1',
              elapsedTone(order.createdAt, now)
            )}
            title="Time since the order was placed"
          >
            <Timer className="h-3 w-3" />
            {formatElapsed(order.createdAt, now)}
          </span>
          {cancellable && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Cancel order #${order._id.slice(-6).toUpperCase()} for table ${order.tableNumber}?`)) {
                  onUpdate(order, { status: 'cancelled' });
                }
              }}
              className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Cancel order"
              title="Cancel order"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item, index) => (
          <li key={index}>
            <div className="flex justify-between gap-2">
              <span className="text-slate-800">
                <span className="font-bold text-slate-900">{item.quantity}×</span> {item.productName}
              </span>
              <span className="text-slate-400">{formatPrice(item.price * item.quantity, currency)}</span>
            </div>
            {item.specialRequests && <p className="pl-5 text-xs text-amber-700">↳ {item.specialRequests}</p>}
          </li>
        ))}
      </ul>

      {order.specialRequests && (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">Note: {order.specialRequests}</p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-sm">
        <span className="text-slate-500">Total</span>
        <span className="font-bold text-slate-900">{formatPrice(order.totalAmount, currency)}</span>
      </div>

      {ETA_EDITABLE.includes(order.status) && (
        <ReadyByPicker
          className="mt-3"
          value={order.readyBy}
          disabled={busy}
          label={isPlaced ? 'Accept with ready time' : 'Ready time'}
          onChange={(readyBy) =>
            onUpdate(order, {
              readyBy: readyBy ? readyBy.toISOString() : null,
              // Giving a new order an ETA accepts it in the same tap.
              ...(isPlaced && readyBy ? { status: 'confirmed' as const } : {}),
            })
          }
        />
      )}

      {next && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" disabled={busy} onClick={() => onUpdate(order, { status: next })}>
            {ORDER_ACTION_LABELS[next]}
          </Button>
          {order.status !== 'placed' && next !== 'ready' && canTransition(order.status, 'ready') && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onUpdate(order, { status: 'ready' })}>
              Ready
            </Button>
          )}
        </div>
      )}
    </article>
  );
});
