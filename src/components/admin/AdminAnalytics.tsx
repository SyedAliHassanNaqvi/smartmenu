'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Admin Analytics Component
 * Visualizes popular items and order trends
 */
export function AdminAnalytics() {
  // Mock analytics data
  const popularItems = [
    { name: 'Margherita Pizza', ordered: 87, arViews: 156, conversionRate: 55.8 },
    { name: 'Caesar Salad', ordered: 64, arViews: 92, conversionRate: 69.6 },
    { name: 'Tiramisu', ordered: 52, arViews: 118, conversionRate: 44.1 },
    { name: 'Iced Tea', ordered: 103, arViews: 87, conversionRate: 118.4 },
    { name: 'Pasta Carbonara', ordered: 71, arViews: 145, conversionRate: 49.0 },
  ];

  const peakHours = [
    { hour: '11 AM', orders: 12, customers: 8 },
    { hour: '12 PM', orders: 34, customers: 22 },
    { hour: '1 PM', orders: 28, customers: 18 },
    { hour: '6 PM', orders: 41, customers: 26 },
    { hour: '7 PM', orders: 38, customers: 24 },
    { hour: '8 PM', orders: 25, customers: 16 },
  ];

  const topOrderedToday = popularItems.sort((a, b) => b.ordered - a.ordered).slice(0, 3);
  const topARViewed = popularItems.sort((a, b) => b.arViews - a.arViews).slice(0, 3);

  const totalOrders = popularItems.reduce((sum, item) => sum + item.ordered, 0);
  const totalARViews = popularItems.reduce((sum, item) => sum + item.arViews, 0);
  const conversionRate = ((totalOrders / totalARViews) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">Total Orders</p>
          <p className="text-4xl font-bold text-blue-600">{totalOrders}</p>
          <p className="text-xs text-gray-600 mt-2">↑ 12% from yesterday</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">AR Views</p>
          <p className="text-4xl font-bold text-purple-600">{totalARViews}</p>
          <p className="text-xs text-gray-600 mt-2">↑ 8% AR engagement</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">Conversion Rate</p>
          <p className="text-4xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-xs text-gray-600 mt-2">AR to Order conversion</p>
        </Card>
      </div>

      {/* Popular Items Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Popular Items Analysis</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Item Name</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Orders</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">AR Views</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {popularItems.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-blue-100 text-blue-800 mx-auto">
                      {item.ordered}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-purple-100 text-purple-800 mx-auto">
                      {item.arViews}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        item.conversionRate > 100 ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {item.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Peak Hours */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">⏰ Peak Hours Today</h3>

        <div className="space-y-3">
          {peakHours.map((hour, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-16 font-medium text-gray-700">{hour.hour}</span>

              {/* Orders bar */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${(hour.orders / 41) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-semibold text-gray-900">
                    {hour.orders}
                  </span>
                </div>
              </div>

              {/* Customers info */}
              <span className="w-20 text-right text-sm text-gray-600">
                {hour.customers} customers
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-green-50 border-2 border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">🏆 Most Ordered</h4>
          <div className="space-y-2">
            {topOrderedToday.map((item, idx) => (
              <p key={idx} className="text-sm text-gray-700">
                {idx + 1}. <span className="font-semibold">{item.name}</span> ({item.ordered} orders)
              </p>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-2 border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3">👀 Most AR Viewed</h4>
          <div className="space-y-2">
            {topARViewed.map((item, idx) => (
              <p key={idx} className="text-sm text-gray-700">
                {idx + 1}. <span className="font-semibold">{item.name}</span> ({item.arViews} views)
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
