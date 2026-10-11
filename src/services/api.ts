import { Product, Category, Cart, Order, Address, SystemStatus } from '../types.ts';

const API_BASE = '/api';

// Retrieve or generate persistent anonymous session ID for guest carts
function getSessionId(): string {
  let sessionId = localStorage.getItem('shoplite_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('shoplite_session_id', sessionId);
  }
  return sessionId;
}

// Retrieve stored authentication token
export function getAuthToken(): string | null {
  return localStorage.getItem('shoplite_auth_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('shoplite_auth_token', token);
  } else {
    localStorage.removeItem('shoplite_auth_token');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const sessionId = getSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // --- CATALOG ---
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await request(`/products?${query.toString()}`);
    return {
      products: res.data || [],
      total: res.meta?.total || 0,
      page: res.meta?.page || 1,
      totalPages: res.meta?.totalPages || 1,
    };
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const res = await request('/products/featured');
    return res.data || [];
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const res = await request(`/products/${slug}`);
    return res.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await request('/categories');
    return res.data || [];
  },

  // --- CART ---
  async getCart(): Promise<Cart> {
    const res = await request('/cart');
    return res.data;
  },

  async addToCart(productId: string, quantity = 1): Promise<Cart> {
    const res = await request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return res.data;
  },

  async updateCartQuantity(itemId: string, quantity: number): Promise<Cart> {
    const res = await request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return res.data;
  },

  async removeCartItem(itemId: string): Promise<Cart> {
    const res = await request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async clearCart(): Promise<void> {
    await request('/cart', { method: 'DELETE' });
  },

  // --- ORDERS ---
  async createOrder(orderPayload: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Address;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<Order> {
    const res = await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await request('/orders/my-orders');
    return res.data || [];
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await request(`/orders/${id}`);
    return res.data;
  },

  // --- PAYMENTS & RAZORPAY ---
  async getPaymentConfig(): Promise<{ isConfigured: boolean; keyId: string; currency: string; mode: string }> {
    const res = await request('/payments/config');
    return res.data;
  },

  async createPaymentOrder(orderId: string): Promise<{
    razorpayOrderId: string;
    amountCents: number;
    currency: string;
    keyId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    isSimulated: boolean;
    isConfigured: boolean;
  }> {
    const res = await request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    return res.data;
  },

  async verifyPayment(verificationData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ payment: any; order: Order }> {
    const res = await request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
    return res.data;
  },

  // --- AUTH & USER ---
  async getMe(): Promise<{ isAuthenticated: boolean; user: any; addresses: Address[] }> {
    const res = await request('/auth/me');
    return res.data;
  },

  async loginDemo(role: 'admin' | 'customer'): Promise<{ token: string; user: any }> {
    const res = await request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    setAuthToken(res.data.token);
    return res.data;
  },

  async syncProfile(profile: any): Promise<any> {
    const res = await request('/auth/sync-profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
    return res.data;
  },

  // --- SYSTEM & TESTS ---
  async getSystemStatus(): Promise<SystemStatus> {
    const res = await request('/status');
    return res.data;
  },

  async runTests(): Promise<any> {
    const res = await request('/test-runner');
    return res.data;
  },

  // --- ADMIN ---
  async getAdminOverview(): Promise<any> {
    const res = await request('/admin/overview');
    return res.data;
  },

  async getAdminOrders(status?: string): Promise<Order[]> {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    const res = await request(`/admin/orders${query}`);
    return res.data || [];
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async createProduct(productData: any): Promise<Product> {
    const res = await request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return res.data;
  },

  async updateProduct(id: string, updates: any): Promise<Product> {
    const res = await request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async createCategory(categoryData: any): Promise<Category> {
    const res = await request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return res.data;
  },
};

// Helper: Format paise/cents to INR currency string (₹)
export function formatPrice(cents: number): string {
  const rupees = cents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}
