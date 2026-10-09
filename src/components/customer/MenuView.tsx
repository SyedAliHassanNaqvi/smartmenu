'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/utils/helpers';
import { queryKeys } from '@/lib/query-keys';
import { apiFetch } from '@/lib/api-client';
import { ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { ActiveOrdersBanner } from '@/components/customer/ActiveOrdersBanner';
import type { PublicRestaurant, PublicTable } from '@/types/public';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  restaurantId: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  appetizer: '🥗',
  main: '🍕',
  dessert: '🍰',
  beverage: '🥤',
  special: '🍱',
};

const CATEGORY_LABELS: Record<string, string> = {
  appetizer: 'Starters',
  main: 'Main Course',
  dessert: 'Desserts',
  beverage: 'Drinks',
  special: 'Specials',
};

export function MenuView({
  table,
  restaurant,
  code,
}: {
  table: PublicTable;
  restaurant: PublicRestaurant;
  code: string;
}) {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState('all');

  const { items, itemCount, total, placedOrders, addToCart, updateItemQuantity } = useCart(
    code,
    restaurant.taxRate
  );

  const restaurantId = table.restaurantId;

  const cartUrl = `/customer/${code}/cart`;

  const {
    data: menuData,
    isLoading: loading,
    error: menuError,
  } = useQuery({
    queryKey: queryKeys.products.byRestaurant(restaurantId),
    queryFn: () =>
      apiFetch<{ products: MenuItem[] }>(
        `/api/products?restaurantId=${restaurantId}`
      ),
    enabled: !!restaurantId,
  });

  const menuItems = useMemo(() => menuData?.products ?? [], [menuData]);
  const error = menuError ? 'Failed to load menu' : '';

  const categories = useMemo(
    () => [...new Set(menuItems.filter((i) => i.isAvailable).map((i) => i.category))],
    [menuItems]
  );

  const visibleCategories =
    activeCategory === 'all'
      ? categories
      : categories.filter((category) => category === activeCategory);

  const getQuantity = (productId: string) =>
    items.find((item) => item.productId === productId)?.quantity ?? 0;

  const handleAdd = (item: MenuItem) => {
    addToCart(item._id, item.name, item.price, 1, item.image);
  };

  const handleIncrease = (item: MenuItem) => {
    updateItemQuantity(item._id, getQuantity(item._id) + 1);
  };

  const handleDecrease = (item: MenuItem) => {
    updateItemQuantity(item._id, getQuantity(item._id) - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <div className="h-6 w-40 bg-slate-200 rounded-full animate-pulse mb-2" />
          <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="max-w-lg mx-auto px-4 mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
            >
              <div className="h-40 bg-slate-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="leading-tight">
                <BrandLogo size="sm" />
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Table {table.tableNumber}
                {table.capacity ? ` • ${table.capacity} seats` : ''}
              </p>
            </div>
            <button
              onClick={() => router.push(cartUrl)}
              className="relative p-2.5 rounded-full bg-indigo-50 text-indigo-600 active:scale-95 transition"
              aria-label="View cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                    activeCategory === category
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {CATEGORY_EMOJI[category] || '🍽️'} {CATEGORY_LABELS[category] || category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        <ActiveOrdersBanner code={code} orders={placedOrders} />

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white mb-5 shadow-lg shadow-indigo-200">
          <p className="text-3xl mb-1">👋</p>
          <h2 className="text-xl font-bold">Welcome to {restaurant.name}</h2>
          <p className="text-sm text-indigo-100 mt-1">
            Table {table.tableNumber} · tap + to add items to your order.
          </p>
        </div>

        {visibleCategories.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-slate-500">No menu items available at the moment.</p>
          </div>
        )}

        {visibleCategories.map((category) => {
          const itemsInCategory = menuItems.filter(
            (item) => item.category === category && item.isAvailable
          );
          if (itemsInCategory.length === 0) return null;

          return (
            <section key={category} className="mb-8">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">{CATEGORY_EMOJI[category] || '🍽️'}</span>
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="grid gap-4">
                {itemsInCategory.map((item) => {
                  const quantity = getQuantity(item._id);
                  return (
                    <article
                      key={item._id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
                    >
                      <div className="relative h-40 w-full bg-slate-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-5xl">
                            {CATEGORY_EMOJI[item.category] || '🍽️'}
                          </div>
                        )}
                        <Badge className="absolute top-2.5 left-2.5 bg-white/90 text-slate-700 border-0 backdrop-blur">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </Badge>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="font-semibold text-slate-900 leading-snug">
                            {item.name}
                          </h4>
                          <span className="font-bold text-indigo-600 whitespace-nowrap">
                            {formatPrice(item.price, restaurant.currency)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex justify-end mt-3">
                          {quantity === 0 ? (
                            <button
                              onClick={() => handleAdd(item)}
                              className="flex items-center gap-1.5 rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold active:scale-95 transition shadow-sm shadow-indigo-200"
                            >
                              <Plus className="h-4 w-4" /> Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 p-1">
                              <button
                                onClick={() => handleDecrease(item)}
                                className="h-8 w-8 rounded-full bg-white text-indigo-600 flex items-center justify-center active:scale-95 transition shadow-sm"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-slate-900">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleIncrease(item)}
                                className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center active:scale-95 transition shadow-sm"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={() => router.push(cartUrl)}
              className="w-full flex items-center justify-between bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-xl active:scale-[0.98] transition"
            >
              <span className="flex items-center gap-2.5 font-semibold">
                <ShoppingBag className="h-5 w-5 text-indigo-300" />
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                {formatPrice(total, restaurant.currency)}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}