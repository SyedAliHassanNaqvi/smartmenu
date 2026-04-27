'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showInput, setShowInput] = useState(false);
  const [tableId, setTableId] = useState('');
  const router = useRouter();

  const handleNavigate = () => {
    if (tableId.trim()) {
      router.push(`/customer/${tableId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SmartMenu</h1>
          <div className="flex gap-4">
            {showInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter table ID..."
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                />
                <Button onClick={handleNavigate}>Go</Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowInput(!showInput)}
            >
              {showInput ? 'Cancel' : 'Enter Table ID'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
