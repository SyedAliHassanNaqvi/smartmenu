'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">SmartMenu</h1>
          <p className="text-xl text-gray-600">
            Revolutionizing Dining with AI-Powered Intelligence
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button
            size="lg"
            className="w-full text-lg h-12"
            onClick={() => router.push('/admin/dashboard')}
          >
            Admin Dashboard
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-600">
                or
              </span>
            </div>
          </div>

          <p className="text-gray-600">
            Scan QR code at your table to get started
          </p>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>Enjoy AI-powered recommendations • Real-time order tracking • AR menu exploration</p>
        </div>
      </div>
    </main>
  );
}
