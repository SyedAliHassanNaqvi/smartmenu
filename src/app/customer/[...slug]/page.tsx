'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MenuView } from '@/components/customer/MenuView';
import { CartView } from '@/components/customer/CartView';
import { OrderTracker } from '@/components/customer/OrderTracker';
import { queryKeys } from '@/lib/query-keys';
import { apiFetch } from '@/lib/api-client';
import type { PublicRestaurant, PublicTable } from '@/types/public';

type ResolvedTable = { table: PublicTable; restaurant: PublicRestaurant };

type CustomerRoute =
  | { view: 'menu' }
  | { view: 'cart' }
  | { view: 'order'; orderId: string };

/**
 * Supported URLs (base = QR code, or legacy "restaurantId/tableNumber"):
 *   /customer/<base>                 menu
 *   /customer/<base>/cart            cart
 *   /customer/<base>/order/<orderId> live order tracking
 */
function parseSlug(slug: string[]): { base: string[]; route: CustomerRoute } {
  const orderIndex = slug.lastIndexOf('order');
  if (orderIndex > 0 && slug.length === orderIndex + 2) {
    return { base: slug.slice(0, orderIndex), route: { view: 'order', orderId: slug[orderIndex + 1] } };
  }
  if (slug.length > 1 && slug[slug.length - 1] === 'cart') {
    return { base: slug.slice(0, -1), route: { view: 'cart' } };
  }
  return { base: slug, route: { view: 'menu' } };
}

export default function CustomerView({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const { base, route } = parseSlug(slug);
  const isCodeRoute = base.length === 1;
  const isLegacyRoute = base.length === 2;
  const code = isCodeRoute ? base[0] : '';
  const [restaurantId, tableNumber] = isLegacyRoute ? base : ['', ''];

  useEffect(() => {
    if (!isCodeRoute && !isLegacyRoute) {
      router.replace('/');
    }
  }, [isCodeRoute, isLegacyRoute, router]);

  const codeQuery = useQuery({
    queryKey: queryKeys.tables.resolve(code),
    queryFn: () => apiFetch<ResolvedTable>(`/api/tables/resolve?code=${encodeURIComponent(code)}`),
    enabled: isCodeRoute,
  });

  const legacyQuery = useQuery({
    queryKey: queryKeys.tables.info(restaurantId, Number(tableNumber)),
    queryFn: () =>
      apiFetch<ResolvedTable>(
        `/api/tables/info?restaurantId=${encodeURIComponent(restaurantId)}&tableNumber=${encodeURIComponent(tableNumber)}`
      ),
    enabled: isLegacyRoute,
  });

  if (!isCodeRoute && !isLegacyRoute) {
    return null;
  }

  const query = isCodeRoute ? codeQuery : legacyQuery;
  const table = query.data?.table ?? null;
  const restaurant = query.data?.restaurant ?? null;

  if (query.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (query.isError || !table || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Invalid Link</h2>
          <p className="text-slate-500 mb-6">
            {(query.error as Error | null)?.message || 'This link is not valid. Please scan the QR code again.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="rounded-full bg-indigo-600 text-white px-6 py-3 font-semibold active:scale-95 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tableKey = base.join('/');
  const viewProps = { table, restaurant, code: tableKey };

  switch (route.view) {
    case 'cart':
      return <CartView {...viewProps} />;
    case 'order':
      return <OrderTracker {...viewProps} orderId={route.orderId} />;
    default:
      return <MenuView {...viewProps} />;
  }
}
