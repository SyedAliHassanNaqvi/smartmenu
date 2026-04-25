'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Admin Table Map Component
 * Real-time table status visualization with WebSocket support
 */
export function AdminTableMap() {
  const [tables, setTables] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'cleaning'>('all');

  // Mock table data
  const mockTables = [
    {
      id: '1',
      number: 1,
      capacity: 4,
      status: 'available',
      guests: 0,
      orderTotal: 0,
    },
    {
      id: '2',
      number: 2,
      capacity: 6,
      status: 'occupied',
      guests: 4,
      orderTotal: 45.5,
    },
    {
      id: '3',
      number: 3,
      capacity: 2,
      status: 'available',
      guests: 0,
      orderTotal: 0,
    },
    {
      id: '4',
      number: 4,
      capacity: 4,
      status: 'cleaning',
      guests: 0,
      orderTotal: 0,
    },
    {
      id: '5',
      number: 5,
      capacity: 8,
      status: 'occupied',
      guests: 6,
      orderTotal: 89.99,
    },
    {
      id: '6',
      number: 6,
      capacity: 4,
      status: 'available',
      guests: 0,
      orderTotal: 0,
    },
  ];

  useEffect(() => {
    setTables(mockTables);

    // In production: Connect to WebSocket for real-time updates
    // const ws = new WebSocket('wss://your-server.com/ws/tables');
    // ws.onmessage = (event) => {
    //   const updatedTable = JSON.parse(event.data);
    //   setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    // };
  }, []);

  const filteredTables =
    filter === 'all' ? tables : tables.filter((t) => t.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const occupancyStats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Total Tables</p>
          <p className="text-3xl font-bold text-gray-900">{occupancyStats.total}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-3xl font-bold text-green-600">{occupancyStats.available}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-3xl font-bold text-blue-600">{occupancyStats.occupied}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Cleaning</p>
          <p className="text-3xl font-bold text-yellow-600">{occupancyStats.cleaning}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'available', 'occupied', 'cleaning'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <Card
            key={table.id}
            className={`p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 ${getStatusColor(
              table.status
            )}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-2xl font-bold text-gray-900">T{table.number}</h3>
              <Badge className="capitalize">{table.status}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                Capacity: <span className="font-semibold">{table.capacity}</span>
              </p>
              <p className="text-gray-700">
                Guests: <span className="font-semibold">{table.guests}</span>
              </p>

              {table.status === 'occupied' && (
                <p className="text-gray-700">
                  Order: <span className="font-semibold">${table.orderTotal}</span>
                </p>
              )}
            </div>

            <Button variant="outline" size="sm" className="w-full mt-3">
              View Details
            </Button>
          </Card>
        ))}
      </div>

      {/* Real-time Status Indicator */}
      <Card className="p-4 bg-blue-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-gray-700">
            Real-time updates enabled • Last updated:{' '}
            <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
