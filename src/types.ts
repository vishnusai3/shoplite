export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number; // In paise (e.g., 1499900 = ₹14,999.00)
  compareAtPriceCents?: number;
  stockQuantity: number;
  sku?: string;
  isFeatured: boolean;
  isActive: boolean;
  images: ProductImage[];
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotalCents: number;
  itemCount: number;
}

export interface Address {
  id?: string;
  recipientName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string;
  unitPriceCents: number;
  quantity: number;
  totalPriceCents: number;
}

export interface Payment {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  status: OrderStatus;
  shippingAddress: Address;
  items: OrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStatus {
  database: {
    provider: string;
    isConfigured: boolean;
    url: string;
    hasServiceRole: boolean;
  };
  payments: {
    provider: string;
    isConfigured: boolean;
    keyId: string;
    mode: string;
  };
  serverTime: string;
  environment: string;
}
