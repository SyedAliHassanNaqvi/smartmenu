'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      containerRef.current.style.pointerEvents = 'none';
    }

    checkAuth().finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (checking) return;

    if (!isAuthenticated) {
      router.replace('/admin/login');
    } else if (containerRef.current) {
      containerRef.current.style.opacity = '1';
      containerRef.current.style.pointerEvents = 'auto';
      containerRef.current.style.transition = 'opacity 0.15s ease';
    }
  }, [checking, isAuthenticated, router]);

  return (
    <div ref={containerRef} className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      {/* rest of your dashboard */}
    </div>
  );
}