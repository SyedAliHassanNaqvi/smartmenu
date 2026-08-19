'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/use-auth-store';
import {
  UtensilsCrossed,
  Sparkles,
  Cuboid,
  BrainCircuit,
  Zap,
  ShieldCheck,
  QrCode,
  ScanLine,
  Smartphone,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  Bell,
  Check,
  Globe,
} from 'lucide-react';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const NAV_LINKS = [
  { label: 'Features', target: 'features' },
  { label: 'How it works', target: 'how-it-works' },
  { label: 'For Restaurants', target: 'restaurants' },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Recommendations',
    description:
      'A smart sommelier powered by semantic search suggests dishes your guests will love, based on their taste and mood.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Cuboid,
    title: 'WebAR Menu Exploration',
    description:
      'Point your camera at the table to see dishes in augmented reality — no app install required, right in the browser.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: ScanLine,
    title: 'Vision Dish Recognition',
    description:
      'Snap a photo of any dish to get instant nutrition info, ingredients, and AI-powered pairing suggestions.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Zap,
    title: 'Real-time Order Tracking',
    description:
      'Orders flow live from table to kitchen with instant status updates — order placed, preparing, served, done.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Sparkles,
    title: 'Gamified Loyalty',
    description:
      'Catch ingredients in a 30-second AR game to unlock automatic discounts and turn every visit into a reward.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: ShieldCheck,
    title: 'PWA & Offline Support',
    description:
      'Installable, lightning-fast, and works on the world\u2019s slowest networks with full offline caching.',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

const STEPS = [
  {
    step: '01',
    icon: QrCode,
    title: 'Scan the QR code',
    description:
      'Every table has a unique QR code. Guests simply point their phone camera to open your menu instantly.',
  },
  {
    step: '02',
    icon: Smartphone,
    title: 'Explore & order',
    description:
      'Browse dishes with AI help, preview them in AR, and add to cart — all from the comfort of their seat.',
  },
  {
    step: '03',
    icon: Bell,
    title: 'Track & get served',
    description:
      'Orders stream to the kitchen in real time while guests follow every status update on their phone.',
  },
];

const STATS = [
  { value: '1,000+', label: 'Concurrent guests' },
  { value: '10,000+', label: 'Menu items' },
  { value: '<300ms', label: 'AI search speed' },
  { value: '24/7', label: 'Order tracking' },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Smart<span className="text-indigo-600">Menu</span>
      </span>
    </div>
  );
}

function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const auth = mounted && isAuthenticated;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push('/')} className="cursor-pointer" aria-label="SmartMenu home">
          <Logo />
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {auth ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
              >
                Log out
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/admin/dashboard')}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Button>
              <Button size="sm" onClick={() => router.push('/signup')} className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="text-left text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              {auth ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => logout()}>
                    Log out
                  </Button>
                  <Button className="flex-1" onClick={() => router.push('/admin/dashboard')}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => router.push('/login')}>
                    Log in
                  </Button>
                  <Button className="flex-1" onClick={() => router.push('/signup')}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-xl">
          <Badge className="mb-5 gap-1.5 border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Restaurant Ordering
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Dining, but{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              smarter
            </span>
            .
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            SmartMenu turns every table into a digital dining experience — AI
            recommendations, augmented-reality menu previews, and real-time order
            tracking, all from a simple QR scan.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push('/customer')}
              className="h-12 gap-2 px-8 text-base"
            >
              Browse the menu
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
              className="h-12 gap-2 border-slate-300 bg-white/70 px-8 text-base backdrop-blur"
            >
              <LogIn className="h-5 w-5" />
              Login for restaurants
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <li className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              No app install
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              Instant QR access
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              Live order tracking
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative mx-auto w-64 sm:w-72">
            <div className="rounded-[2rem] border-[6px] border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-indigo-900/30">
              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Table 12</p>
                    <p className="text-sm font-semibold text-slate-900">SmartMenu Dining</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Smartphone className="h-4 w-4" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">Scan to order</p>
                    <QrCode className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="mx-auto w-fit rounded-xl bg-white p-2 shadow-sm">
                    <QRCode
                      value="smartmenu://customer/demo/table-12"
                      size={128}
                      bgColor="#ffffff"
                      fgColor="#312e81"
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  </div>
                  <p className="mt-3 text-center text-[10px] text-slate-400">
                    Point your camera at the code
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-10 top-6 hidden -rotate-6 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Cuboid className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">AR Preview</p>
                  <p className="text-[10px] text-slate-400">Dish in 3D</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-10 bottom-8 hidden rotate-6 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Order ready</p>
                  <p className="text-[10px] text-slate-400">Real-time status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything a modern restaurant needs
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Six powerful experiences packed into one seamless flow, from the first
            QR scan to the final bill.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-slate-900 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From table to table in three steps
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            A guest experience so smooth, it feels like magic.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="relative rounded-2xl border border-slate-700/60 bg-slate-800/60 p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-4xl font-extrabold text-slate-700">{item.step}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const mounted = useMounted();

  const isOwner = mounted && isAuthenticated && user?.role === 'admin';

  return (
    <section
      id="restaurants"
      className="scroll-mt-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
          <Globe className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to bring your restaurant online?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
          Join restaurants using SmartMenu to boost engagement, cut wait times, and
          turn diners into loyal regulars.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.push(isOwner ? '/admin/dashboard' : '/login')}
            className="h-12 gap-2 bg-white px-8 text-base text-indigo-700 shadow-lg shadow-indigo-900/20 hover:bg-indigo-50"
          >
            <LogIn className="h-5 w-5" />
            {isOwner ? 'Open dashboard' : 'Restaurant login'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push(isOwner ? '/admin/dashboard' : '/login')}
            className="h-12 gap-2 border-white/40 bg-white/10 px-8 text-base text-white backdrop-blur hover:bg-white/20"
          >
            {isOwner ? 'Open dashboard' : 'Owner access'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const router = useRouter();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <button onClick={() => router.push('/')} className="cursor-pointer" aria-label="SmartMenu home">
            <Logo />
          </button>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SmartMenu. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            {NAV_LINKS.map((link) => (
              <button
                key={link.target}
                onClick={() =>
                  document
                    .getElementById(link.target)
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="hover:text-indigo-600"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
