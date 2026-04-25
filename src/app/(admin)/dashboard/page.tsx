import { AdminTableMap } from '@/components/admin/AdminTableMap';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time restaurant management & analytics</p>
      </div>

      {/* Analytics Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Analytics</h2>
        <AdminAnalytics />
      </section>

      {/* Table Management Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Table Status Map</h2>
        <AdminTableMap />
      </section>
    </div>
  );
}
