'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockMenuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella, basil',
    price: 12.99,
    category: 'main',
    image: '🍕',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons',
    price: 8.99,
    category: 'appetizer',
    image: '🥗',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Tiramisu',
    description: 'Traditional Italian dessert',
    price: 6.99,
    category: 'dessert',
    image: '🍰',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Iced Tea',
    description: 'Refreshing cold beverage',
    price: 3.99,
    category: 'beverage',
    image: '🧋',
    rating: 4.5,
  },
];

export default function TableView({ params }: { params: { tableId: string } }) {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'appetizer', 'main', 'dessert', 'beverage'];
  const filteredItems =
    selectedCategory === 'all'
      ? mockMenuItems
      : mockMenuItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item: any) => {
    setCart([...cart, item]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-gray-600 mt-2">Table ID: {params.tableId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-4xl">{item.image}</div>
                  <Badge>{item.category}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      ${item.price}
                    </span>
                    <span className="text-sm text-yellow-600">★ {item.rating}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Order</h2>

            {cart.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No items yet</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center pb-2 border-b"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">${item.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${(totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${(totalPrice * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full">Place Order</Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
