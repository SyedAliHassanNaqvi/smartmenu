'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { adminNavItems } from '@/config/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { cn } from '@/utils/cn';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isHydrated, logout, checkAuth } = useAuthStore();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Wait for hydration before checking auth
  useEffect(() => {
    if (!isHydrated) return;

    checkAuth().finally(() => setAuthChecked(true));
  }, [isHydrated, checkAuth]);

  useEffect(() => {
    if (authChecked && !isAuthenticated && pathname !== '/login') {
      window.location.href = '/login';
    }
  }, [authChecked, isAuthenticated, pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!authChecked || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const activeItem = adminNavItems.find((item) => pathname?.startsWith(item.href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-5">
        <Link href="/admin/dashboard" onClick={() => setMobileNavOpen(false)}>
          <BrandLogo size="sm" tagline="Restaurant admin" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {adminNavItems.map((item) => {
          const active = item === activeItem;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5', active ? 'text-indigo-600' : 'text-slate-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-slate-700">{activeItem?.label ?? 'Admin'}</h2>
        </header>
        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
