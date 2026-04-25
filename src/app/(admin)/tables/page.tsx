'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const mockTables = [
  { id: '1', number: 1, capacity: 4, status: 'available', guests: 0 },
  { id: '2', number: 2, capacity: 6, status: 'occupied', guests: 4 },
  { id: '3', number: 3, capacity: 2, status: 'reserved', guests: 0 },
];

export default function Tables() {
  const [tables] = useState(mockTables);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant's tables and QR codes</p>
        </div>
        <Button>Add Table</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Table {table.number}</h3>
              <Badge className={getStatusColor(table.status)}>
                {table.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>Capacity: <span className="font-semibold">{table.capacity} guests</span></p>
              <p>Current: <span className="font-semibold">{table.guests} guests</span></p>
            </div>

            <div className="space-y-2">
              <Button size="sm" className="w-full">
                View QR Code
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Edit Table
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
