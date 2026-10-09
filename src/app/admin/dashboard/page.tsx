'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, ChefHat, CircleDollarSign, ConciergeBell, Inbox, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { OrderCard, type AdminOrder, type OrderUpdate } from '@/components/admin/OrderCard';
import { queryKeys } from '@/lib/query-keys';
import { apiFetch } from '@/lib/api-client';
import { useNow } from '@/hooks/use-now';
import { formatPrice } from '@/utils/helpers';
import { formatClock } from '@/utils/time';
import { cn } from '@/utils/cn';
import type { OrderStatus } from '@/lib/order-status';
import type { PublicRestaurant } from '@/types/public';

const ACTIVE_FILTER = 'status=placed,confirmed,preparing,ready,served';
const POLL_MS = 5000;
const SOUND_KEY = 'visiondine-admin-sound';

const COLUMNS: { key: string; title: string; hint: string; statuses: OrderStatus[]; icon: typeof Inbox }[] = [
  { key: 'new', title: 'New', hint: 'Accept with an ETA in one tap', statuses: ['placed'], icon: Inbox },
  { key: 'kitchen', title: 'In the kitchen', hint: 'Accepted and preparing', statuses: ['confirmed', 'preparing'], icon: ChefHat },
  { key: 'ready', title: 'Ready to serve', hint: 'Take these to the table', statuses: ['ready'], icon: ConciergeBell },
  { key: 'served', title: 'Served', hint: 'Complete when the table is done', statuses: ['served'], icon: CircleDollarSign },
];

function startOfToday(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/** Short two-tone chime via Web Audio (no asset needed). */
function playChime() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + index * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.32);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Audio not available — the visual "New" badge still shows.
  }
}

export default function AdminDashboardPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const now = useNow(15000);
  const [today] = useState(startOfToday);
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(SOUND_KEY) !== 'off';
  });
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const activeKey = queryKeys.orders.list(ACTIVE_FILTER);
  const finishedFilter = `status=completed,cancelled&from=${encodeURIComponent(today)}`;

  const { data: restaurant } = useQuery({
    queryKey: queryKeys.restaurant.current,
    queryFn: () => apiFetch<PublicRestaurant>('/api/restaurant', { token }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
  const currency = restaurant?.currency ?? 'EUR';

  const activeQuery = useQuery({
    queryKey: activeKey,
    queryFn: () => apiFetch<AdminOrder[]>(`/api/orders?${ACTIVE_FILTER}`, { token }),
    enabled: !!token,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const finishedQuery = useQuery({
    queryKey: queryKeys.orders.list(finishedFilter),
    queryFn: () => apiFetch<AdminOrder[]>(`/api/orders?${finishedFilter}`, { token }),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const activeOrders = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);
  const finishedOrders = useMemo(() => finishedQuery.data ?? [], [finishedQuery.data]);

  // Highlight + chime for orders that arrive while the dashboard is open.
  const seenIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!activeQuery.data) return;
    const placedIds = activeQuery.data.filter((o) => o.status === 'placed').map((o) => o._id);
    if (seenIds.current === null) {
      seenIds.current = new Set(activeQuery.data.map((o) => o._id));
      return;
    }
    const fresh = placedIds.filter((id) => !seenIds.current!.has(id));
    activeQuery.data.forEach((o) => seenIds.current!.add(o._id));
    if (fresh.length) {
      setNewIds((prev) => new Set([...prev, ...fresh]));
      if (soundOn) playChime();
    }
  }, [activeQuery.data, soundOn]);

  const placedCount = activeOrders.filter((o) => o.status === 'placed').length;
  useEffect(() => {
    document.title = placedCount ? `(${placedCount}) New orders · Vision Dine` : 'Dashboard · Vision Dine';
  }, [placedCount]);

  const updateOrder = useMutation({
    mutationFn: ({ order, update }: { order: AdminOrder; update: OrderUpdate }) =>
      apiFetch<AdminOrder>(`/api/orders/${order._id}`, { method: 'PATCH', token, body: update }),
    // Optimistic: move the card immediately; roll back if the server refuses.
    onMutate: async ({ order, update }) => {
      setBusyIds((prev) => new Set(prev).add(order._id));
      setNewIds((prev) => {
        const nextIds = new Set(prev);
        nextIds.delete(order._id);
        return nextIds;
      });
      await queryClient.cancelQueries({ queryKey: activeKey });
      const previous = queryClient.getQueryData<AdminOrder[]>(activeKey);
      queryClient.setQueryData<AdminOrder[]>(activeKey, (orders = []) =>
        orders.map((o) => (o._id === order._id ? { ...o, ...update } : o))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(activeKey, context.previous);
    },
    onSettled: (_data, _error, { order }) => {
      setBusyIds((prev) => {
        const nextIds = new Set(prev);
        nextIds.delete(order._id);
        return nextIds;
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });

  const { mutate } = updateOrder;
  const handleUpdate = useCallback(
    (order: AdminOrder, update: OrderUpdate) => mutate({ order, update }),
    [mutate]
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {
      // ignore
    }
    if (next) playChime();
  };

  const todaysOrders = [...activeOrders, ...finishedOrders].filter(
    (o) => o.createdAt >= today && o.status !== 'cancelled'
  );
  const revenueToday = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: 'New', value: placedCount, tone: 'text-indigo-600' },
    {
      label: 'In the kitchen',
      value: activeOrders.filter((o) => o.status === 'confirmed' || o.status === 'preparing').length,
      tone: 'text-amber-600',
    },
    { label: 'Ready to serve', value: activeOrders.filter((o) => o.status === 'ready').length, tone: 'text-emerald-600' },
    { label: 'Revenue today', value: formatPrice(revenueToday, currency), tone: 'text-slate-900' },
  ];

  const error = activeQuery.error ?? updateOrder.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live orders</h1>
          <p className="text-sm text-slate-500">
            {user?.name ? `Hi ${user.name.split(' ')[0]} — ` : ''}
            {todaysOrders.length} order{todaysOrders.length === 1 ? '' : 's'} today · updates every {POLL_MS / 1000}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition',
              soundOn
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-500'
            )}
            title="Play a sound when a new order arrives"
          >
            {soundOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {soundOn ? 'Sound on' : 'Sound off'}
          </button>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className={cn('h-4 w-4', activeQuery.isFetching && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', stat.tone)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message || 'Something went wrong'}
        </div>
      )}

      {activeQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const orders = activeOrders
              .filter((o) => column.statuses.includes(o.status))
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            const Icon = column.icon;
            return (
              <section key={column.key} className="flex flex-col rounded-2xl bg-slate-100/70 p-3">
                <header className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Icon className="h-4 w-4 text-indigo-600" />
                      {column.title}
                    </h2>
                    <p className="text-xs text-slate-500">{column.hint}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-sm">
                    {orders.length}
                  </span>
                </header>
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">
                      Nothing here
                    </p>
                  ) : (
                    orders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        now={now}
                        currency={currency}
                        isNew={newIds.has(order._id)}
                        busy={busyIds.has(order._id)}
                        onUpdate={handleUpdate}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {finishedOrders.length > 0 && (
        <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="cursor-pointer select-none px-5 py-3 text-sm font-semibold text-slate-700">
            Finished today ({finishedOrders.length})
          </summary>
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {finishedOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Table {order.tableNumber}</span>
                  <span className="font-mono text-xs text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
                </span>
                <span className="hidden flex-1 truncate text-slate-500 sm:block">
                  {order.items.map((item) => `${item.quantity}× ${item.productName}`).join(', ')}
                </span>
                <span className="text-xs text-slate-400">{formatClock(order.updatedAt)}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  )}
                >
                  {order.status}
                </span>
                <span className="w-20 text-right font-semibold text-slate-900">
                  {formatPrice(order.totalAmount, currency)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
