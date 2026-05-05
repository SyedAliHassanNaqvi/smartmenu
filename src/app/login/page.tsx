'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isHydrated, checkAuth } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) {
      setChecking(true);
      return;
    }

    // This entire block runs only on the client after hydration.
    // We imperatively set the style here so the server never sees it —
    // which is what was causing the style attribute mismatch.
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
  }, [isHydrated, checkAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!checking && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [checking, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        // redirect handled by useEffect above once isAuthenticated flips
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {/* No style prop here — server and client render identical HTML.
          Opacity is set imperatively via ref after hydration. */}
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
              Don't have an account?{' '}
              <a href="/" className="text-primary hover:underline">
                Sign up for SmartMenu
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}