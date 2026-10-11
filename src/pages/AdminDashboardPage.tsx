import React, { useState, useEffect } from 'react';
import { api, formatPrice } from '../services/api.ts';
import { Product, Category, Order, OrderStatus } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Shield, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'tests'>('overview');

  // Overview Data
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Products Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Orders Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Category Creation Modal
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryImg, setNewCategoryImg] = useState('');

  // Tests Runner state
  const [testResults, setTestResults] = useState<any>(null);
  const [runningTests, setRunningTests] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    priceRupees: '',
    compareAtPriceRupees: '',
    stockQuantity: '',
    categoryId: '',
    sku: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (isAdmin) {
      loadOverview();
      loadCategories();
    }
  }, [isAdmin]);

  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await api.getAdminOverview();
      setOverview(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await api.getProducts({ limit: 100 });
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const ords = await api.getAdminOrders(orderStatusFilter);
      setOrders(ords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'overview') loadOverview();
  }, [activeTab, orderStatusFilter]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Access Restricted</h2>
        <p className="text-xs text-stone-500">
          Administrator privileges are required to access this console. Please sign in as an admin.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceCents = Math.round(parseFloat(productForm.priceRupees) * 100);
      const compareAtPriceCents = productForm.compareAtPriceRupees
        ? Math.round(parseFloat(productForm.compareAtPriceRupees) * 100)
        : undefined;

      const payload = {
        title: productForm.title,
        description: productForm.description,
        priceCents,
        compareAtPriceCents,
        stockQuantity: parseInt(productForm.stockQuantity, 10),
        categoryId: productForm.categoryId || categories[0]?.id,
        sku: productForm.sku,
        isFeatured: productForm.isFeatured,
        isActive: productForm.isActive,
        images: productForm.imageUrl
          ? [{ id: 'img_usr_' + Date.now(), url: productForm.imageUrl, isPrimary: true, sortOrder: 1 }]
          : [],
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsCreatingProduct(false);
      setEditingProduct(null);
      await loadProducts();
      await loadOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      description: prod.description,
      priceRupees: (prod.priceCents / 100).toString(),
      compareAtPriceRupees: prod.compareAtPriceCents ? (prod.compareAtPriceCents / 100).toString() : '',
      stockQuantity: prod.stockQuantity.toString(),
      categoryId: prod.categoryId,
      sku: prod.sku || '',
      imageUrl: prod.images?.[0]?.url || '',
      isFeatured: prod.isFeatured,
      isActive: prod.isActive,
    });
    setIsCreatingProduct(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
      await loadOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadOrders();
      await loadOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await api.createCategory({
        name: newCategoryName,
        description: newCategoryDesc,
        imageUrl: newCategoryImg || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      });
      setIsCreatingCategory(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setNewCategoryImg('');
      await loadCategories();
      await loadOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleRunVerificationTests = async () => {
    try {
      setRunningTests(true);
      const res = await api.runTests();
      setTestResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Title & Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
              Administrator Console
            </h1>
            <p className="text-xs text-stone-500">Live store management & PostgreSQL inventory control</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'overview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'products' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'orders' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tests' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Backend Tests
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {loadingOverview ? (
            <div className="py-20 text-center text-xs text-stone-400">Loading store analytics...</div>
          ) : (
            <>
              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-xs font-semibold uppercase">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold font-['Space_Grotesk'] text-stone-900">
                    {formatPrice(overview?.stats?.totalRevenueCents || 0)}
                  </p>
                  <p className="text-[11px] text-stone-500">Verified captured payments</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-xs font-semibold uppercase">Total Orders</span>
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold font-['Space_Grotesk'] text-stone-900">
                    {overview?.stats?.totalOrders || 0}
                  </p>
                  <p className="text-[11px] text-stone-500">{overview?.stats?.processingOrdersCount || 0} pending dispatch</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-xs font-semibold uppercase">Active Products</span>
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold font-['Space_Grotesk'] text-stone-900">
                    {overview?.stats?.totalProducts || 0}
                  </p>
                  <p className="text-[11px] text-stone-500">Across {overview?.stats?.totalCategories || 0} collections</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="text-xs font-semibold uppercase">Stock Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold font-['Space_Grotesk'] text-stone-900">
                    {overview?.stats?.lowStockCount || 0}
                  </p>
                  <p className="text-[11px] text-stone-500">{overview?.stats?.outOfStockCount || 0} out of stock</p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-stone-900 font-['Space_Grotesk']">
                    Recent Customer Dispatches
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-orange-600 font-semibold hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {overview?.recentOrders?.map((ord: Order) => (
                    <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-mono font-bold text-stone-900">#{ord.orderNumber}</p>
                        <p className="text-stone-500">{ord.customerName} • {ord.customerEmail}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-semibold text-stone-900">
                          {formatPrice(ord.totalCents)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 font-['Space_Grotesk']">
              Product Catalog Inventory ({products.length} items)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreatingCategory(true)}
                className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-colors"
              >
                + New Category
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    description: '',
                    priceRupees: '',
                    compareAtPriceRupees: '',
                    stockQuantity: '10',
                    categoryId: categories[0]?.id || '',
                    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                    imageUrl: '',
                    isFeatured: false,
                    isActive: true,
                  });
                  setIsCreatingProduct(true);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* Product Form Modal / Section */}
          {isCreatingProduct && (
            <div className="p-6 rounded-2xl bg-white border border-stone-300 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-sm text-stone-900">
                  {editingProduct ? 'Edit Existing Product' : 'Create New Catalog Product'}
                </h3>
                <button onClick={() => setIsCreatingProduct(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Apex Studio Mechanical Numpad"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Acoustic specs, materials, dimensions..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Price in Rupees (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={productForm.priceRupees}
                    onChange={(e) => setProductForm({ ...productForm, priceRupees: e.target.value })}
                    placeholder="14999"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Compare at Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.compareAtPriceRupees}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPriceRupees: e.target.value })}
                    placeholder="17999"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Stock Quantity Units *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Category *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Primary Image URL</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-semibold text-stone-800">Featured in Hero / Showcase</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-semibold text-stone-800">Active (Visible to Shoppers)</span>
                  </label>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatingProduct(false)}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold"
                  >
                    Save Product Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Listing Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-stone-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{prod.title}</p>
                          <p className="text-[11px] text-stone-400 font-mono">{prod.sku}</p>
                        </div>
                      </td>
                      <td className="p-4 text-stone-600">{prod.category?.name || 'General'}</td>
                      <td className="p-4 font-mono font-bold text-stone-900">{formatPrice(prod.priceCents)}</td>
                      <td className="p-4">
                        <span className={`font-mono font-bold ${
                          prod.stockQuantity <= 0 ? 'text-red-600' : prod.stockQuantity < 10 ? 'text-amber-600' : 'text-stone-800'
                        }`}>
                          {prod.stockQuantity} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          prod.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {prod.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 font-['Space_Grotesk']">
              Order Dispatches & Payments
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Filter Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-mono font-bold text-stone-900">#{ord.orderNumber}</td>
                      <td className="p-4">
                        <p className="font-semibold text-stone-900">{ord.customerName}</p>
                        <p className="text-stone-400 text-[11px]">{ord.customerEmail}</p>
                      </td>
                      <td className="p-4 font-mono font-bold text-stone-900">{formatPrice(ord.totalCents)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.payment?.status === 'captured'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.payment?.status || 'pending'}
                        </span>
                        {ord.payment?.razorpayPaymentId && (
                          <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                            {ord.payment.razorpayPaymentId.substring(0, 12)}...
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKEND VERIFICATION TESTS */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-stone-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-bold text-base">Backend Verification Test Suite</h3>
                  <p className="text-xs text-stone-400">
                    Runs unit and integration assertions against prices, stock deduction, HMAC signatures, and idempotency.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunVerificationTests}
                disabled={runningTests}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {runningTests ? 'Running Suite...' : 'Execute All Tests Now'}
              </button>
            </div>

            {testResults ? (
              <div className="space-y-3 pt-4 border-t border-stone-800">
                <div className="flex items-center justify-between text-xs">
                  <span className={testResults.passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {testResults.passed ? 'ALL SUITE TESTS PASSED (100%)' : 'SOME TESTS FAILED'}
                  </span>
                  <span className="text-stone-400 font-mono">
                    {testResults.passedCount} of {testResults.total} passed
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs pr-2">
                  {testResults.results.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {r.passed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span className="font-bold text-stone-200">[{r.category}] {r.name}</span>
                        </div>
                        {r.message && <p className="text-red-400 text-[11px] pl-6">{r.message}</p>}
                      </div>
                      <span className="text-stone-500 text-[11px] shrink-0">{r.durationMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 border border-stone-800 rounded-xl">
                Click "Execute All Tests Now" to verify the backend behavior.
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {isCreatingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-bold text-sm text-stone-900">Add New Category Collection</h3>
              <button onClick={() => setIsCreatingCategory(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Ergonomics & Lighting"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Description</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Short tagline..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Image URL</label>
                <input
                  type="url"
                  value={newCategoryImg}
                  onChange={(e) => setNewCategoryImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
