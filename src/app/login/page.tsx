'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/store/use-auth-store';
import { apiFetch } from '@/lib/api-client';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'staff' | 'customer';
    restaurantId?: string;
  };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isHydrated, checkAuth } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: data }),
    onSuccess: (data) => {
      login(data.token, data.user);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Login failed');
    },
  });

  const submitting = loginMutation.isPending;

  useEffect(() => {
    if (!isHydrated) return;

    if (cardRef.current) {
      cardRef.current.style.opacity = '0';
      cardRef.current.style.pointerEvents = 'none';
    }

    checkAuth().finally(() => {
      if (cardRef.current) {
        cardRef.current.style.opacity = '1';
        cardRef.current.style.pointerEvents = 'auto';
        cardRef.current.style.transition = 'opacity 0.15s ease';
      }
      setChecking(false);
    });
  }, [isHydrated, checkAuth]);

  useEffect(() => {
    if (!checking && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [checking, isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card ref={cardRef} className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to manage your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                placeholder="admin@restaurant.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up for Vision Dine
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}