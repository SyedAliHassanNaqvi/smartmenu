'use client';

import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">SmartMenu</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
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
            Tables & QR Codes
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <h2 className="text-gray-800 text-sm font-semibold uppercase tracking-wide">
            Admin Section
          </h2>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
