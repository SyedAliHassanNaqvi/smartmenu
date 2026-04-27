'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

const mockProducts = [
  { id: '1', name: 'Margherita Pizza', price: 12.99, category: 'main', available: true },
  { id: '2', name: 'Caesar Salad', price: 8.99, category: 'appetizer', available: true },
  { id: '3', name: 'Tiramisu', price: 6.99, category: 'dessert', available: false },
];

export default function MenuManagement() {
  const [products] = useState(mockProducts);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant's menu items</p>
        </div>
        <Button>Add New Item</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">${product.price}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.available ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
