'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InvitationData {
  valid: boolean;
  restaurantName: string;
  email: string;
  amount: number;
  currency: string;
}

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    ownerName: '',
    phone: '',
    address: '',
    timezone: 'Europe/Rome',
    language: 'en',
    theme: 'default',
  });

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    // Validate invitation token
    fetch(`/api/auth/validate-invitation?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setInvitation(data);
        } else {
          setError(data.error || 'Invalid invitation');
        }
      })
      .catch(err => {
        console.error('Error validating invitation:', err);
        setError('Failed to validate invitation');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          restaurantDetails: {
            ownerName: formData.ownerName,
            phone: formData.phone,
            address: formData.address,
            timezone: formData.timezone,
            language: formData.language,
            theme: formData.theme,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login or dashboard
        router.push('/login?message=Account created successfully');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The invitation link is invalid or has expired.'}
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Restaurant Setup</CardTitle>
          <CardDescription>
            Welcome! You've been invited to set up {invitation?.restaurantName}.
            Please complete your account details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Payment Confirmed</h3>
            <p className="text-green-700">
              Payment of {invitation?.amount} {invitation?.currency} has been received for {invitation?.restaurantName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                <Input value={invitation?.restaurantName} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Email</label>
                <Input value={invitation?.email} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Owner Name *</label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Restaurant Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address, city, country"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Europe/Rome">Europe/Rome</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="en">English</option>
                  <option value="it">Italian</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating Account...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SetupForm />
    </Suspense>
  );
}