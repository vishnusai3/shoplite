import { supabaseAdmin, isSupabaseConfigured } from './supabase.ts';
import type { 
  Category, 
  Product, 
  ProductImage, 
  Cart, 
  CartItem, 
  Order, 
  OrderItem, 
  Payment, 
  UserProfile, 
  Address,
  OrderStatus,
  PaymentStatus
} from '../types.ts';

// Initial Seed Data for Instant Run & Local Fallback
const initialCategories: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Fresh Fruits & Berries',
    slug: 'fruits',
    description: 'Farm-fresh organic apples, imported berries, and sun-ripened seasonal fruits.',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Snacks & Crisps',
    slug: 'snacks',
    description: 'Artisanal baked crisps, roasted spiced nuts, and wholesome energy bites.',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Pantry & Grocery',
    slug: 'grocery',
    description: 'Pure cold-pressed virgin oils, raw forest honey, stone-ground grains & staples.',
    imageUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&q=80',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Beverages & Brews',
    slug: 'beverages',
    description: 'Live fermented kombucha, cold-brewed botanicals, and fresh-squeezed juices.',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    isActive: true,
    sortOrder: 4,
  },
];

const initialProducts: Product[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    title: 'Shimla Royal Gala Apples (Organic)',
    slug: 'shimla-royal-gala-apples',
    description: 'Crisp, naturally sweet Royal Gala apples harvested from high-altitude orchards in Himachal Pradesh. Wax-free, non-GMO, and freshly hand-sorted. 1 kg pack (~4 to 5 apples).',
    priceCents: 19900, // ₹199.00
    compareAtPriceCents: 24900,
    stockQuantity: 65,
    sku: 'FRU-001',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-1-1',
        productId: 'p1111111-1111-1111-1111-111111111111',
        url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80',
        altText: 'Fresh Shimla Royal Gala Apples',
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: 'img-1-2',
        productId: 'p1111111-1111-1111-1111-111111111111',
        url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
        altText: 'Organic Apples in basket',
        isPrimary: false,
        sortOrder: 2,
      },
    ],
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    categoryId: 'c2222222-2222-2222-2222-222222222222',
    title: 'Truffle & Rosemary Gourmet Potato Crisps',
    slug: 'truffle-rosemary-potato-crisps',
    description: 'Slow-cooked in cold-pressed sunflower oil, seasoned with Italian black summer truffle extract and wild sun-dried Mediterranean rosemary. Gluten-free and ultra-crunchy. Net wt. 125g.',
    priceCents: 16500, // ₹165.00
    compareAtPriceCents: 19500,
    stockQuantity: 80,
    sku: 'SNK-002',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-2-1',
        productId: 'p2222222-2222-2222-2222-222222222222',
        url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80',
        altText: 'Truffle Rosemary Potato Crisps',
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: 'img-2-2',
        productId: 'p2222222-2222-2222-2222-222222222222',
        url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
        altText: 'Gourmet Crisps bowl',
        isPrimary: false,
        sortOrder: 2,
      },
    ],
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    categoryId: 'c3333333-3333-3333-3333-333333333333',
    title: 'Raw Multifloral Forest Honey (Unpasteurized)',
    slug: 'raw-multifloral-forest-honey',
    description: 'Unprocessed, unheated raw honey harvested from the pristine Corbett buffer belt. Loaded with natural enzymes, propolis, and live pollen notes. 500g amber glass jar.',
    priceCents: 42500, // ₹425.00
    compareAtPriceCents: 49900,
    stockQuantity: 40,
    sku: 'GRO-003',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-3-1',
        productId: 'p3333333-3333-3333-3333-333333333333',
        url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
        altText: 'Raw Forest Honey Jar',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    title: 'Hass Avocados (Twin Pack Ready to Eat)',
    slug: 'hass-avocados-twin-pack',
    description: 'Rich, buttery Hass avocados with dark pebbled skin. Perfect for fresh guacamole, morning sourdough toast, and nutrient-dense grain bowls. Pack of 2 (~400g).',
    priceCents: 27900, // ₹279.00
    compareAtPriceCents: 34900,
    stockQuantity: 34,
    sku: 'FRU-004',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-4-1',
        productId: 'p4444444-4444-4444-4444-444444444444',
        url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
        altText: 'Hass Avocados Fresh Half',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    categoryId: 'c2222222-2222-2222-2222-222222222222',
    title: 'Slow Roasted Masala Cashews & Almonds',
    slug: 'slow-roasted-masala-cashews-almonds',
    description: 'Jumbo W240 cashews and California nonpareil almonds dry-roasted with Himalayan pink salt, cumin, chaat spices, and zero palm oil. Net wt. 200g resealable pouch.',
    priceCents: 32000, // ₹320.00
    compareAtPriceCents: 38000,
    stockQuantity: 55,
    sku: 'SNK-005',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-5-1',
        productId: 'p5555555-5555-5555-5555-555555555555',
        url: 'https://images.unsplash.com/photo-1536591375315-1b8368903277?w=800&q=80',
        altText: 'Roasted Masala Cashews and Almonds',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'p6666666-6666-6666-6666-666666666666',
    categoryId: 'c3333333-3333-3333-3333-333333333333',
    title: 'Cold-Pressed Extra Virgin Olive Oil (500ml)',
    slug: 'cold-pressed-extra-virgin-olive-oil',
    description: 'First cold extraction of hand-picked Koroneiki olives. Low acidity (<0.3%), fruity peppery finish, and rich in natural polyphenols. 500ml UV-protected bottle.',
    priceCents: 64900, // ₹649.00
    compareAtPriceCents: 79900,
    stockQuantity: 28,
    sku: 'GRO-006',
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-6-1',
        productId: 'p6666666-6666-6666-6666-666666666666',
        url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
        altText: 'Cold Pressed Extra Virgin Olive Oil',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'p7777777-7777-7777-7777-777777777777',
    categoryId: 'c1111111-1111-1111-1111-111111111111',
    title: 'Fresh Blueberries (Imported 125g Punnet)',
    slug: 'fresh-blueberries-punnet',
    description: 'Sweet, plump, antioxidant-rich blueberries air-flown fresh. Perfect for morning bowls, smoothies, and snacking. Net weight 125g.',
    priceCents: 24900, // ₹249.00
    compareAtPriceCents: 29900,
    stockQuantity: 45,
    sku: 'FRU-007',
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-7-1',
        productId: 'p7777777-7777-7777-7777-777777777777',
        url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80',
        altText: 'Fresh Blueberries Punnet',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'p8888888-8888-8888-8888-888888888888',
    categoryId: 'c4444444-4444-4444-4444-444444444444',
    title: 'Ginger Lemon Sparkling Live Kombucha (330ml)',
    slug: 'ginger-lemon-live-kombucha',
    description: 'Naturally fermented black and green tea infused with organic cold-pressed ginger and zesty lemon juice. Packed with beneficial probiotics. Glass bottle 330ml.',
    priceCents: 14500, // ₹145.00
    compareAtPriceCents: 17500,
    stockQuantity: 50,
    sku: 'BEV-008',
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-8-1',
        productId: 'p8888888-8888-8888-8888-888888888888',
        url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
        altText: 'Sparkling Kombucha Glass Bottle',
        isPrimary: true,
        sortOrder: 1,
      },
    ],
  },
];

// Seed Profiles
const initialProfiles: UserProfile[] = [
  {
    id: 'usr_admin_shoplite',
    email: 'admin@shoplite.dev',
    fullName: 'System Administrator',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_customer_demo',
    email: 'customer@shoplite.dev',
    fullName: 'Arjun Sharma',
    phone: '+91 98765 43210',
    role: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Orders
const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'SL-2026-8812',
    userId: 'usr_customer_demo',
    customerEmail: 'customer@shoplite.dev',
    customerName: 'Arjun Sharma',
    customerPhone: '+91 98765 43210',
    subtotalCents: 52900,
    shippingCents: 0,
    taxCents: 0,
    totalCents: 52900,
    status: 'delivered',
    shippingAddress: {
      recipientName: 'Arjun Sharma',
      streetAddress: '42, Indiranagar 100ft Road',
      apartment: 'Suite 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      phone: '+91 98765 43210',
    },
    items: [
      {
        id: 'item-1001-1',
        orderId: 'ord-1001',
        productId: 'p1111111-1111-1111-1111-111111111111',
        productTitle: 'Shimla Royal Gala Apples (Organic 1kg)',
        productImageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
        unitPriceCents: 19900,
        quantity: 1,
        totalPriceCents: 19900,
      },
      {
        id: 'item-1001-2',
        orderId: 'ord-1001',
        productId: 'p2222222-2222-2222-2222-222222222222',
        productTitle: 'Truffle & Rosemary Gourmet Potato Crisps',
        productImageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
        unitPriceCents: 16500,
        quantity: 2,
        totalPriceCents: 33000,
      },
    ],
    payment: {
      id: 'pay-1001',
      orderId: 'ord-1001',
      razorpayOrderId: 'order_test_881200000000',
      razorpayPaymentId: 'pay_test_881200000000',
      amountCents: 52900,
      currency: 'INR',
      status: 'captured',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// In-Memory Storage Singletons
class DataStore {
  private categories: Category[] = [...initialCategories];
  private products: Product[] = [...initialProducts];
  private profiles: UserProfile[] = [...initialProfiles];
  private carts: Map<string, Cart> = new Map();
  private orders: Order[] = [...initialOrders];
  private payments: Payment[] = [initialOrders[0].payment!];
  private addresses: Address[] = [
    {
      id: 'addr-demo-1',
      userId: 'usr_customer_demo',
      recipientName: 'Arjun Sharma',
      streetAddress: '42, Indiranagar 100ft Road',
      apartment: 'Suite 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      phone: '+91 98765 43210',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  private processedWebhooks: Set<string> = new Set();

  constructor() {
    // Populate categories on products
    this.attachCategoriesToProducts();
  }

  private attachCategoriesToProducts() {
    this.products = this.products.map(p => ({
      ...p,
      category: this.categories.find(c => c.id === p.categoryId),
    }));
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            description: d.description || '',
            imageUrl: d.image_url,
            isActive: d.is_active,
            sortOrder: d.sort_order,
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local store', e);
      }
    }
    return this.categories.filter(c => c.isActive);
  }

  async getAllCategoriesAdmin(): Promise<Category[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            description: d.description || '',
            imageUrl: d.image_url,
            isActive: d.is_active,
            sortOrder: d.sort_order,
          }));
        }
      } catch (e) {
        console.warn('Supabase categories fetch failed', e);
      }
    }
    return this.categories;
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...categoryData,
      id: 'cat_' + Math.random().toString(36).substring(2, 10),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert({
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description,
            image_url: newCategory.imageUrl,
            is_active: newCategory.isActive,
            sort_order: newCategory.sortOrder,
          })
          .select()
          .single();
        if (!error && data) {
          newCategory.id = data.id;
        }
      } catch (e) {
        console.warn('Supabase category insert error', e);
      }
    }

    this.categories.push(newCategory);
    return newCategory;
  }

  private mapSupabaseProduct(d: any): Product {
    return {
      id: d.id,
      categoryId: d.category_id,
      title: d.title,
      slug: d.slug,
      description: d.description || '',
      priceCents: d.price_cents,
      compareAtPriceCents: d.compare_at_price_cents,
      stockQuantity: d.stock_quantity,
      sku: d.sku,
      isFeatured: d.is_featured,
      isActive: d.is_active,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      category: d.categories ? {
        id: d.categories.id,
        name: d.categories.name,
        slug: d.categories.slug,
        description: d.categories.description || '',
        imageUrl: d.categories.image_url,
        isActive: d.categories.is_active,
        sortOrder: d.categories.sort_order,
      } : undefined,
      images: (d.product_images || []).map((img: any) => ({
        id: img.id,
        productId: img.product_id,
        url: img.url,
        altText: img.alt_text,
        isPrimary: img.is_primary,
        sortOrder: img.sort_order,
      })),
    };
  }

  // --- PRODUCTS ---
  async getProducts(params?: {
    categorySlug?: string;
    search?: string;
    sortBy?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 12;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('products')
          .select('*, product_images(*), categories(*)', { count: 'exact' })
          .eq('is_active', true);

        if (params?.featured) {
          query = query.eq('is_featured', true);
        }

        if (params?.categorySlug && params.categorySlug !== 'all') {
          const cats = await this.getCategories();
          const cat = cats.find(c => c.slug === params.categorySlug);
          if (cat) {
            query = query.eq('category_id', cat.id);
          }
        }

        if (params?.search) {
          const q = params.search.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`);
        }

        switch (params?.sortBy) {
          case 'price-asc':
            query = query.order('price_cents', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('price_cents', { ascending: false });
            break;
          case 'name-asc':
            query = query.order('title', { ascending: true });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          const products = data.map(d => this.mapSupabaseProduct(d));
          const total = count ?? products.length;
          const totalPages = Math.ceil(total / limit) || 1;
          return { products, total, page, totalPages };
        }
      } catch (e) {
        console.warn('Supabase products fetch failed, using fallback', e);
      }
    }

    let items = [...this.products].filter(p => p.isActive);

    if (params?.featured) {
      items = items.filter(p => p.isFeatured);
    }

    if (params?.categorySlug && params.categorySlug !== 'all') {
      const cat = this.categories.find(c => c.slug === params.categorySlug);
      if (cat) {
        items = items.filter(p => p.categoryId === cat.id);
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        p => p.title.toLowerCase().includes(q) || 
             p.description.toLowerCase().includes(q) ||
             p.sku?.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (params?.sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case 'price-desc':
        items.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'name-asc':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return {
      products: paginatedItems,
      total,
      page,
      totalPages,
    };
  }

  async getProductBySlugOrId(identifier: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        const { data, error } = await supabaseAdmin
          .from('products')
          .select('*, product_images(*), categories(*)')
          .eq(isUuid ? 'id' : 'slug', identifier)
          .maybeSingle();
        if (!error && data) {
          return this.mapSupabaseProduct(data);
        }
      } catch (err) {
        console.warn('Supabase getProductBySlugOrId error', err);
      }
    }
    const prod = this.products.find(p => p.slug === identifier || p.id === identifier);
    return prod || null;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const id = 'prod_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    const newProduct: Product = {
      id,
      categoryId: productData.categoryId || this.categories[0].id,
      title: productData.title || 'Untitled Product',
      slug: productData.slug || ('prod-' + Date.now()),
      description: productData.description || '',
      priceCents: productData.priceCents || 0,
      compareAtPriceCents: productData.compareAtPriceCents,
      stockQuantity: productData.stockQuantity || 0,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      isFeatured: Boolean(productData.isFeatured),
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      images: productData.images || [],
      createdAt: now,
      updatedAt: now,
    };

    newProduct.category = this.categories.find(c => c.id === newProduct.categoryId);

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('products')
          .insert({
            title: newProduct.title,
            slug: newProduct.slug,
            description: newProduct.description,
            price_cents: newProduct.priceCents,
            compare_at_price_cents: newProduct.compareAtPriceCents,
            stock_quantity: newProduct.stockQuantity,
            sku: newProduct.sku,
            is_featured: newProduct.isFeatured,
            is_active: newProduct.isActive,
            category_id: newProduct.categoryId,
          })
          .select()
          .single();
        if (!error && data) {
          newProduct.id = data.id;
        }
      } catch (e) {
        console.warn('Supabase product insert error', e);
      }
    }

    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.categoryId) {
      updated.category = this.categories.find(c => c.id === updates.categoryId);
    }

    this.products[index] = updated;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('products')
          .update({
            title: updated.title,
            slug: updated.slug,
            description: updated.description,
            price_cents: updated.priceCents,
            compare_at_price_cents: updated.compareAtPriceCents,
            stock_quantity: updated.stockQuantity,
            sku: updated.sku,
            is_featured: updated.isFeatured,
            is_active: updated.isActive,
            category_id: updated.categoryId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase product update error', e);
      }
    }

    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase product delete error', e);
      }
    }

    return true;
  }

  // --- STOCK MANAGEMENT (CONCURRENCY SAFE) ---
  async reserveAndDeductStock(items: { productId: string; quantity: number }[]): Promise<{ success: boolean; error?: string }> {
    // 1. First verify all items have sufficient stock
    for (const item of items) {
      const prod = this.products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ${item.productId}` };
      }
      if (prod.stockQuantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${prod.title}". Only ${prod.stockQuantity} remaining.` 
        };
      }
    }

    // 2. Perform atomic deduction
    for (const item of items) {
      const prod = this.products.find(p => p.id === item.productId)!;
      prod.stockQuantity -= item.quantity;
      prod.updatedAt = new Date().toISOString();
    }

    return { success: true };
  }

  async restoreStock(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stockQuantity += item.quantity;
      }
    }
  }

  // --- CARTS ---
  async getOrCreateCart(cartKey: { userId?: string; sessionId?: string }): Promise<Cart> {
    const key = cartKey.userId || cartKey.sessionId || 'guest_default';
    let cart = this.carts.get(key);

    if (!cart) {
      cart = {
        id: 'cart_' + Math.random().toString(36).substring(2, 9),
        userId: cartKey.userId,
        sessionId: cartKey.sessionId,
        items: [],
        subtotalCents: 0,
        itemCount: 0,
      };
      this.carts.set(key, cart);
    }

    this.recalculateCart(cart);
    return cart;
  }

  async addItemToCart(cartKey: { userId?: string; sessionId?: string }, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(cartKey);
    const prod = this.products.find(p => p.id === productId);

    if (!prod) {
      throw new Error('Product does not exist');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const existingIndex = cart.items.findIndex(i => i.productId === productId);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > prod.stockQuantity) {
        throw new Error(`Cannot add more than ${prod.stockQuantity} items in stock`);
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].updatedAt = new Date().toISOString();
    } else {
      if (quantity > prod.stockQuantity) {
        throw new Error(`Requested quantity exceeds available stock (${prod.stockQuantity})`);
      }
      cart.items.push({
        id: 'item_' + Math.random().toString(36).substring(2, 9),
        cartId: cart.id,
        productId,
        quantity,
        product: prod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    this.recalculateCart(cart);
    return cart;
  }

  async updateCartItemQuantity(cartKey: { userId?: string; sessionId?: string }, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(cartKey);
    const itemIndex = cart.items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const prod = this.products.find(p => p.id === cart.items[itemIndex].productId);
      if (prod && quantity > prod.stockQuantity) {
        throw new Error(`Requested quantity exceeds available stock (${prod.stockQuantity})`);
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updatedAt = new Date().toISOString();
    }

    this.recalculateCart(cart);
    return cart;
  }

  async removeCartItem(cartKey: { userId?: string; sessionId?: string }, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(cartKey);
    cart.items = cart.items.filter(i => i.id !== itemId);
    this.recalculateCart(cart);
    return cart;
  }

  async clearCart(cartKey: { userId?: string; sessionId?: string }): Promise<void> {
    const key = cartKey.userId || cartKey.sessionId || 'guest_default';
    const cart = this.carts.get(key);
    if (cart) {
      cart.items = [];
      cart.subtotalCents = 0;
      cart.itemCount = 0;
    }
  }

  private recalculateCart(cart: Cart) {
    let subtotal = 0;
    let count = 0;

    cart.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        item.product = prod;
        subtotal += prod.priceCents * item.quantity;
        count += item.quantity;
      }
    });

    cart.subtotalCents = subtotal;
    cart.itemCount = count;
  }

  // --- ORDERS ---
  async getOrders(params?: { userId?: string; status?: string; page?: number; limit?: number }): Promise<{ orders: Order[]; total: number }> {
    let list = [...this.orders];

    if (params?.userId) {
      list = list.filter(o => o.userId === params.userId);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter(o => o.status === params.status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      orders: list,
      total: list.length,
    };
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const id = 'ord_' + Math.random().toString(36).substring(2, 10);
    const orderNumber = `SL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const order: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(order);
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  // --- PAYMENTS & WEBHOOKS ---
  async savePayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const id = 'pay_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    const payment: Payment = {
      ...paymentData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.payments.push(payment);

    // Link payment on the order
    const order = this.orders.find(o => o.id === payment.orderId);
    if (order) {
      order.payment = payment;
      order.updatedAt = now;
    }

    return payment;
  }

  async getPaymentByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return this.payments.find(p => p.razorpayOrderId === razorpayOrderId) || null;
  }

  async updatePaymentStatus(
    razorpayOrderId: string, 
    status: PaymentStatus, 
    details?: { razorpayPaymentId?: string; razorpaySignature?: string; gatewayResponse?: any }
  ): Promise<Payment | null> {
    const payment = this.payments.find(p => p.razorpayOrderId === razorpayOrderId);
    if (!payment) return null;

    payment.status = status;
    if (details?.razorpayPaymentId) payment.razorpayPaymentId = details.razorpayPaymentId;
    if (details?.razorpaySignature) payment.razorpaySignature = details.razorpaySignature;
    if (details?.gatewayResponse) payment.gatewayResponse = details.gatewayResponse;
    payment.updatedAt = new Date().toISOString();

    const order = this.orders.find(o => o.id === payment.orderId);
    if (order) {
      order.payment = payment;
      if (status === 'captured') {
        order.status = 'processing';
      } else if (status === 'failed') {
        order.status = 'cancelled';
      }
      order.updatedAt = new Date().toISOString();
    }

    return payment;
  }

  isWebhookProcessed(eventId: string): boolean {
    return this.processedWebhooks.has(eventId);
  }

  markWebhookProcessed(eventId: string): void {
    this.processedWebhooks.add(eventId);
  }

  // --- PROFILES & AUTH ---
  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    return this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getProfileById(id: string): Promise<UserProfile | null> {
    return this.profiles.find(p => p.id === id) || null;
  }

  async upsertProfile(profile: Partial<UserProfile> & { email: string; id: string }): Promise<UserProfile> {
    const existingIndex = this.profiles.findIndex(p => p.id === profile.id || p.email === profile.email);
    const now = new Date().toISOString();

    if (existingIndex > -1) {
      const updated: UserProfile = {
        ...this.profiles[existingIndex],
        ...profile,
        updatedAt: now,
      };
      this.profiles[existingIndex] = updated;
      return updated;
    }

    const newProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName || profile.email.split('@')[0],
      phone: profile.phone,
      role: profile.role || 'customer',
      avatarUrl: profile.avatarUrl,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.push(newProfile);
    return newProfile;
  }

  // --- ADDRESSES ---
  async getUserAddresses(userId: string): Promise<Address[]> {
    return this.addresses.filter(a => a.userId === userId);
  }

  async saveAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const id = 'addr_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const newAddr: Address = {
      ...address,
      id,
      createdAt: now,
      updatedAt: now,
    };
    if (newAddr.isDefault) {
      this.addresses.forEach(a => {
        if (a.userId === newAddr.userId) a.isDefault = false;
      });
    }
    this.addresses.push(newAddr);
    return newAddr;
  }
}

export const dataStore = new DataStore();
