'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PayButton from '@/components/shared/PayButton';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { PLANS, formatPlanPrice } from '@/config/plans';
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    ownerEmail: '',
    phone: '',
  });
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);

  const formComplete = useMemo(
    () =>
      formData.restaurantName.trim().length >= 2 &&
      formData.ownerName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim()),
    [formData]
  );

  const updateField = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Vision Dine home">
            <BrandLogo />
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </nav>
      </header>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/50 blur-3xl" />
          <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 gap-1.5 border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Get started with Vision Dine
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Bring your restaurant online
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
              Tell us about your restaurant, pick a plan, and pay securely with{' '}
              <span className="font-semibold text-slate-900">Nexi XPay</span>. You&apos;ll set up
              your admin account right after.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/60 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Choose your plan</h2>
            <p className="mt-1 text-sm text-slate-500">
              One-time subscription payment, billed monthly.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {PLANS.map((plan) => {
                const active = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Popular
                      </span>
                    )}
                    <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {formatPlanPrice(plan)}
                      <span className="text-sm font-medium text-slate-400">/mo</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <h2 className="text-lg font-bold text-slate-900">Restaurant details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Restaurant name *
                  </label>
                  <Input
                    value={formData.restaurantName}
                    onChange={(e) => updateField('restaurantName', e.target.value)}
                    required
                    placeholder="e.g. Bella Napoli"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Owner name *
                  </label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Owner email *
                  </label>
                  <Input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => updateField('ownerEmail', e.target.value)}
                    required
                    placeholder="owner@restaurant.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+39 02 1234 5678"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedPlan.name} plan
                    </p>
                    <p className="text-xs text-slate-500">
                      Secured by Nexi XPay — sandbox test gateway
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 sm:ml-4">
                    {formatPlanPrice(selectedPlan)}
                  </p>
                </div>
              </div>

              {!formComplete && (
                <p className="mt-3 text-xs text-slate-500">
                  Fill in restaurant name, owner name and a valid owner email to continue.
                </p>
              )}

              <div className="mt-4">
                <PayButton
                  plan={selectedPlan}
                  restaurantName={formData.restaurantName}
                  ownerEmail={formData.ownerEmail}
                  ownerName={formData.ownerName}
                  disabled={!formComplete}
                />
              </div>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Your card details never touch Vision Dine — payment happens on the Nexi XPay page.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              PCI-DSS compliant payments
            </span>
            <span>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                Log in
              </Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
