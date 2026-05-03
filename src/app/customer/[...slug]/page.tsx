'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  restaurantId: string;
}

interface TableInfo {
  _id: string;
  tableNumber: number;
  status: string;
  capacity: number;
  restaurantId: string;
}

export default function CustomerView({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { items, itemCount, total, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    // Handle different URL formats
    let restaurantId: string;
    let tableNumber: string;

    if (slug.length === 1) {
      // Legacy format: /customer/[tableId]
      // For backward compatibility, assume tableId contains restaurant info
      // For now, redirect to a migration page or show an error
      router.replace('/migration?legacyTableId=' + slug[0]);
      return;
    } else if (slug.length === 2) {
      // New format: /customer/[restaurantId]/[tableNumber]
      [restaurantId, tableNumber] = slug;
    } else {
      setError('Invalid URL format');
      setLoading(false);
      return;
    }

    // Fetch table info and menu items
    const fetchData = async () => {
      try {
        // Fetch table info
        const tableResponse = await fetch(`/api/tables/info?restaurantId=${restaurantId}&tableNumber=${tableNumber}`);
        if (!tableResponse.ok) {
          throw new Error('Table not found');
        }
        const tableData = await tableResponse.json();
        setTableInfo(tableData.table);

        // Fetch menu items
        const menuResponse = await fetch(`/api/products?restaurantId=${restaurantId}`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenuItems(menuData.products || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, router]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item._id, item.name, item.price, 1);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      appetizer: 'bg-blue-100 text-blue-800',
      main: 'bg-green-100 text-green-800',
      dessert: 'bg-pink-100 text-pink-800',
      beverage: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SmartMenu</h1>
              {tableInfo && (
                <p className="text-sm text-gray-600">
                  Table {tableInfo.tableNumber} • {tableInfo.capacity} seats
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/customer/${slug.join('/')}/ar-view`)}
              >
                🎮 AR View
              </Button>
              <Button
                variant="outline"
                className="relative"
                onClick={() => router.push(`/customer/${slug.join('/')}/cart`)}
              >
                🛒 Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {categories.map(category => (
          <section key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter(item => item.category === category && item.isAvailable)
                .map(item => (
                  <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-4xl">
                      {item.image || '🍽️'}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          €{item.price.toFixed(2)}
                        </span>
                        <Button
                          onClick={() => handleAddToCart(item)}
                          size="sm"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </section>
        ))}

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}