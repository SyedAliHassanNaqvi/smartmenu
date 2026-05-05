'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentGuests: number;
  location?: string;
}

interface FormData {
  tableNumber: number | '';
  capacity: number | '';
  location: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
}

const initialFormData: FormData = {
  tableNumber: '',
  capacity: '',
  location: '',
  status: 'available',
};

export default function Tables() {
  const { token } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      setTables(data);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table?: Table) => {
    if (table) {
      setEditingId(table._id);
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location || '',
        status: table.status,
      });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.tableNumber || !formData.capacity) {
      setError('Table number and capacity are required');
      return;
    }

    if (formData.tableNumber < 1) {
      setError('Table number must be at least 1');
      return;
    }

    if (formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId ? `/api/tables/${editingId}` : '/api/tables';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableNumber: Number(formData.tableNumber),
          capacity: Number(formData.capacity),
          location: formData.location,
          status: editingId ? formData.status : 'available',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save table');
      }

      setSuccess(editingId ? 'Table updated successfully' : 'Table added successfully');
      handleCloseModal();
      await fetchTables();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete table');
      
      setSuccess('Table deleted successfully');
      await fetchTables();
    } catch (err: any) {
      setError(err.message || 'Failed to delete table');
    }
  };

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant's tables</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Add Table</Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Table' : 'Add New Table'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Number</label>
                <Input
                className='text-white'
                  type="number"
                  min="1"
                  value={formData.tableNumber}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, tableNumber: e.target.value ? Number(e.target.value) : '' }))
                  }
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacity (Guests)</label>
                <Input
                className='text-white'
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, capacity: e.target.value ? Number(e.target.value) : '' }))
                  }
                  placeholder="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location (Optional)</label>
                <Input
                className='text-white'
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="e.g., Window, Corner, Outdoor"
                />
              </div>

              {editingId && (
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, status: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button

                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-white"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tables.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No tables yet. Create one to get started.</p>
          <Button onClick={() => handleOpenModal()}>Add Your First Table</Button>
        </Card>
      )}

      {/* Tables Grid */}
      {!loading && tables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Table {table.tableNumber}</h3>
                <Badge className={getStatusColor(table.status)}>
                  {table.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Capacity: <span className="font-semibold">{table.capacity} guests</span></p>
                {table.currentGuests > 0 && (
                  <p>Current: <span className="font-semibold">{table.currentGuests} guests</span></p>
                )}
                {table.location && (
                  <p>Location: <span className="font-semibold">{table.location}</span></p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenModal(table)}
                  className="w-full text-white"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(table._id)}
                  className="w-full"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
