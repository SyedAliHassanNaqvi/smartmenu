'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { queryKeys } from '@/lib/query-keys';
import { apiFetch } from '@/lib/api-client';
import { thumbnailUrl } from '@/lib/media-client';
import type { MediaAsset, Model3d } from '@/types/media';
import {
  ProductMediaFields,
  emptyProductMedia,
  type ProductMediaValue,
} from '@/components/admin/ProductMediaFields';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Box,
  CheckCircle2,
  Film,
  Package,
  Pencil,
  Plus,
  Search,
  Timer,
  Trash2,
  XCircle,
} from 'lucide-react';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image?: string;
  gallery?: MediaAsset[];
  video?: MediaAsset;
  model3d?: Model3d;
  isAvailable: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  vegetarian: boolean;
  vegan: boolean;
  calories?: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['appetizer', 'main', 'dessert', 'beverage', 'special'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  appetizer: 'bg-blue-100 text-blue-800',
  main: 'bg-green-100 text-green-800',
  dessert: 'bg-pink-100 text-pink-800',
  beverage: 'bg-yellow-100 text-yellow-800',
  special: 'bg-purple-100 text-purple-800',
};

interface FormState {
  name: string;
  description: string;
  price: string;
  category: Category;
  preparationTime: string;
  calories: string;
  ingredients: string;
  allergens: string;
  vegetarian: boolean;
  vegan: boolean;
  isAvailable: boolean;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  category: 'main',
  preparationTime: '',
  calories: '',
  ingredients: '',
  allergens: '',
  vegetarian: false,
  vegan: false,
  isAvailable: true,
};

const toMediaValue = (product: Product): ProductMediaValue => ({
  image: product.image || '',
  gallery: product.gallery ?? [],
  video: product.video ?? null,
  model3d:
    product.model3d && product.model3d.status !== 'none'
      ? {
          glbUrl: product.model3d.glbUrl,
          posterUrl: product.model3d.posterUrl,
          status: product.model3d.status,
          source: product.model3d.source,
        }
      : null,
});

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function MenuManager() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [media, setMedia] = useState<ProductMediaValue>(emptyProductMedia);
  const [originalMedia, setOriginalMedia] = useState<ProductMediaValue>(emptyProductMedia);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');

  const { data: productsData, isLoading: loading, error: productsError } = useQuery({
    queryKey: queryKeys.products.byRestaurant(''), // will be overridden by queryFn
    queryFn: () =>
      apiFetch<{ products: Product[] }>('/api/products', { token: token || undefined }),
    enabled: !!token,
  });

  const products = productsData?.products ?? [];
  const fetchError = productsError ? 'Failed to load menu items' : '';

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.ingredients || []).some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        );

      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((product) => product.isAvailable).length;

    return {
      total,
      available,
      outOfStock: total - available,
      categories: new Set(products.map((product) => product.category)).size,
    };
  }, [products]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        category: product.category,
        preparationTime: String(product.preparationTime),
        calories: product.calories != null ? String(product.calories) : '',
        ingredients: (product.ingredients || []).join(', '),
        allergens: (product.allergens || []).join(', '),
        vegetarian: product.vegetarian,
        vegan: product.vegan,
        isAvailable: product.isAvailable,
      });
      const productMedia = toMediaValue(product);
      setMedia(productMedia);
      setOriginalMedia(productMedia);
    } else {
      setEditingId(null);
      setFormData(emptyForm);
      setMedia(emptyProductMedia);
      setOriginalMedia(emptyProductMedia);
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyForm);
    setMedia(emptyProductMedia);
    setOriginalMedia(emptyProductMedia);
    setMediaBusy(false);
    setError('');
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: ({ url, body }: { url: string; body: unknown }) =>
      apiFetch<Product>(url, { method: editingId ? 'PUT' : 'POST', token, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.byRestaurant('') });
      setSuccess(editingId ? 'Menu item updated successfully' : 'Menu item added successfully');
      handleCloseModal();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'An error occurred'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/products/${id}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.byRestaurant('') });
      setSuccess('Menu item deleted successfully');
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to delete menu item'),
  });

  const toggleMutation = useMutation({
    mutationFn: (product: Product) =>
      apiFetch<Product>(`/api/products/${product._id}`, {
        method: 'PUT',
        token,
        body: { isAvailable: !product.isAvailable },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.byRestaurant('') }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to update availability'),
  });

  const submitting = saveMutation.isPending || deleteMutation.isPending || toggleMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mediaBusy) {
      setError('Please wait for uploads to finish');
      return;
    }
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    const price = Number(formData.price);
    if (!formData.price || Number.isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      return;
    }

    const preparationTime = Number(formData.preparationTime);
    if (!formData.preparationTime || Number.isNaN(preparationTime) || preparationTime <= 0) {
      setError('Preparation time must be a positive number');
      return;
    }

    // `null` clears a field on update. The 3D model is only sent when it was
    // changed here, so a pipeline-managed model is never overwritten.
    const model3dChanged =
      media.model3d?.glbUrl !== originalMedia.model3d?.glbUrl ||
      media.model3d?.posterUrl !== originalMedia.model3d?.posterUrl;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      category: formData.category,
      image: media.image.trim() || (editingId ? null : undefined),
      gallery: media.gallery,
      video: media.video ?? (editingId ? null : undefined),
      ...(model3dChanged && {
        model3d: media.model3d?.glbUrl
          ? { glbUrl: media.model3d.glbUrl, posterUrl: media.model3d.posterUrl }
          : null,
      }),
      preparationTime,
      calories: formData.calories.trim() ? Number(formData.calories) : undefined,
      ingredients: splitList(formData.ingredients),
      allergens: splitList(formData.allergens),
      vegetarian: formData.vegetarian,
      vegan: formData.vegan,
      isAvailable: formData.isAvailable,
    };

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    saveMutation.mutate({ url, body: payload });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    deleteMutation.mutate(id);
  };

  const handleToggleAvailability = (product: Product) => {
    toggleMutation.mutate(product);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant&apos;s menu items</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{fetchError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">Total Items</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">Available</p>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">Out of Stock</p>
          <p className="text-3xl font-bold text-red-500">{stats.outOfStock}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-gray-600 font-semibold mb-2">Categories</p>
          <p className="text-3xl font-bold text-purple-600">{stats.categories}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, description or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as 'all' | Category)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {showModal && (
        // The overlay scrolls; the inner wrapper centres short forms and lets tall
        // ones grow downward, so the top of the form is never pushed off-screen.
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="w-full max-w-2xl my-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g., Margherita Pizza"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Short description of the dish"
                        rows={3}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Price (Rs) *</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="12.99"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as Category,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Preparation Time (min) *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.preparationTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            preparationTime: e.target.value,
                          }))
                        }
                        placeholder="20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Calories (optional)</label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.calories}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, calories: e.target.value }))
                        }
                        placeholder="650"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ingredients (comma separated)
                      </label>
                      <Input
                        type="text"
                        value={formData.ingredients}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, ingredients: e.target.value }))
                        }
                        placeholder="tomato, mozzarella, basil"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Allergens (comma separated)
                      </label>
                      <Input
                        type="text"
                        value={formData.allergens}
                        onChange={(e) =>
                          setFormData((prev: FormState) => ({ ...prev, allergens: e.target.value }))
                        }
                        placeholder="gluten, dairy"
                      />
                    </div>
                  </div>

                  <ProductMediaFields
                    value={media}
                    onChange={setMedia}
                    onBusyChange={setMediaBusy}
                  />

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.vegetarian}
                        onChange={(e) =>
                          setFormData((prev: FormState) => ({
                            ...prev,
                            vegetarian: e.target.checked,
                          }))
                        }
                        className="h-4 w-4"
                      />
                      Vegetarian
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.vegan}
                        onChange={(e) =>
                          setFormData((prev: FormState) => ({ ...prev, vegan: e.target.checked }))
                        }
                        className="h-4 w-4"
                      />
                      Vegan
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) =>
                          setFormData((prev: FormState) => ({ ...prev, isAvailable: e.target.checked }))
                        }
                        className="h-4 w-4"
                      />
                      Available for ordering
                    </label>
                  </div>

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
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || mediaBusy} className="flex-1">
                      {submitting ? 'Saving...' : mediaBusy ? 'Uploading...' : 'Save'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No menu items yet. Create one to get started.</p>
          <Button onClick={() => handleOpenModal()}>Add Your First Menu Item</Button>
        </Card>
      )}

      {!loading && products.length > 0 && filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No menu items match your search.</p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Card>
      )}

      {!loading && filteredProducts.length > 0 && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Item</TableHead>
                <TableHead className="font-semibold text-gray-900">Category</TableHead>
                <TableHead className="font-semibold text-gray-900">Price</TableHead>
                <TableHead className="font-semibold text-gray-900">Prep</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-xl overflow-hidden shrink-0">
                        {product.image ? (
                          <img
                            src={thumbnailUrl(product.image, 96)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          '🍽️'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {product.vegetarian && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              Vegetarian
                            </Badge>
                          )}
                          {product.vegan && (
                            <Badge className="bg-lime-100 text-lime-800">Vegan</Badge>
                          )}
                          {product.video && (
                            <span title="Has a video" className="text-gray-500">
                              <Film className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {product.model3d?.status === 'ready' && (
                            <span title="Has a 3D model" className="text-gray-500">
                              <Box className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {product.calories != null && (
                            <span className="text-xs text-gray-500">
                              {product.calories} kcal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={CATEGORY_COLORS[product.category]}>
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    Rs {product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" /> {product.preparationTime} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(product)}
                      className="flex items-center gap-2"
                      title={
                        product.isAvailable
                          ? 'Click to mark out of stock'
                          : 'Click to make available'
                      }
                    >
                      {product.isAvailable ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span
                        className={
                          product.isAvailable ? 'text-green-700' : 'text-red-600'
                        }
                      >
                        {product.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(product)}
                       
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}