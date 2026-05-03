'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, router, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">SmartMenu</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
          {user && (
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          <a
            href="/admin/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Dashboard
          </a>
          <a
            href="/admin/menu"
            className="block px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Menu Management
          </a>
          <a
            href="/admin/tables"
            className="block px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Tables
          </a>
          <a
            href="/admin/qr-codes"
            className="block px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            QR Codes
          </a>
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 rounded hover:bg-red-700 transition text-red-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-gray-800 text-sm font-semibold uppercase tracking-wide">
              Admin Section
            </h2>
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-600">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            )}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
