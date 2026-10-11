-- ====================================================================
-- ShopLite E-Commerce - Complete Supabase Setup Script
-- ====================================================================
-- Copy and paste this entire script into your Supabase SQL Editor:
-- 1. Log in to https://app.supabase.com
-- 2. Select your Project -> Click "SQL Editor" in the left sidebar
-- 3. Click "New query" -> Paste this file -> Click "Run"
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    compare_at_price_cents INTEGER CHECK (compare_at_price_cents >= price_cents),
    stock_quantity INTEGER DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price_cents);

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 7. CUSTOMER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_name TEXT NOT NULL,
    street_address TEXT NOT NULL,
    apartment TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India' NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- 8. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    session_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON public.carts(session_id);

-- 9. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    shipping_cents INTEGER DEFAULT 0 NOT NULL CHECK (shipping_cents >= 0),
    tax_cents INTEGER DEFAULT 0 NOT NULL CHECK (tax_cents >= 0),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    shipping_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 11. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_image_url TEXT,
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 12. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency TEXT DEFAULT 'INR' NOT NULL,
    status payment_status DEFAULT 'pending'::payment_status NOT NULL,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON public.payments(razorpay_order_id);

-- 13. PROCESSED WEBHOOKS TABLE (FOR IDEMPOTENCY)
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- PRODUCTS POLICIES
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Anyone can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage product images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

-- ADDRESSES POLICIES
CREATE POLICY "Users can view own addresses"
    ON public.addresses FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own addresses"
    ON public.addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
    ON public.addresses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
    ON public.addresses FOR DELETE
    USING (auth.uid() = user_id);

-- CARTS & ITEMS POLICIES
CREATE POLICY "Users can view own cart"
    ON public.carts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cart"
    ON public.carts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view cart items"
    ON public.cart_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.carts
        WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can modify cart items"
    ON public.cart_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.carts
        WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    ));

-- ORDERS POLICIES
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    ));

-- PAYMENTS POLICIES
CREATE POLICY "Users can view own order payments"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = payments.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    ));

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Fresh Fruits & Berries', 'fruits', 'Farm-fresh organic apples, imported berries, and sun-ripened seasonal fruits.', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Snacks & Crisps', 'snacks', 'Artisanal baked crisps, roasted spiced nuts, and wholesome energy bites.', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80', 2),
    ('c3333333-3333-3333-3333-333333333333', 'Pantry & Grocery', 'grocery', 'Pure cold-pressed virgin oils, raw forest honey, stone-ground grains & staples.', 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&q=80', 3),
    ('c4444444-4444-4444-4444-444444444444', 'Beverages & Brews', 'beverages', 'Live fermented kombucha, cold-brewed botanicals, and fresh-squeezed juices.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (id, category_id, title, slug, description, price_cents, compare_at_price_cents, stock_quantity, sku, is_featured)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Shimla Royal Gala Apples (Organic)', 'shimla-royal-gala-apples', 'Crisp, naturally sweet Royal Gala apples harvested from high-altitude orchards in Himachal Pradesh. Wax-free, non-GMO, and freshly hand-sorted. 1 kg pack (~4 to 5 apples).', 19900, 24900, 65, 'FRU-001', true),
    ('p2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Truffle & Rosemary Gourmet Potato Crisps', 'truffle-rosemary-potato-crisps', 'Slow-cooked in cold-pressed sunflower oil, seasoned with Italian black summer truffle extract and wild sun-dried Mediterranean rosemary. Net wt. 125g.', 16500, 19500, 80, 'SNK-002', true),
    ('p3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Raw Multifloral Forest Honey (Unpasteurized)', 'raw-multifloral-forest-honey', 'Unprocessed, unheated raw honey harvested from the pristine Corbett buffer belt. Loaded with natural enzymes, propolis, and live pollen notes. 500g amber glass jar.', 42500, 49900, 40, 'GRO-003', true),
    ('p4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Hass Avocados (Twin Pack Ready to Eat)', 'hass-avocados-twin-pack', 'Rich, buttery Hass avocados with dark pebbled skin. Perfect for fresh guacamole, morning sourdough toast, and nutrient-dense grain bowls. Pack of 2 (~400g).', 27900, 34900, 34, 'FRU-004', true),
    ('p5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Slow Roasted Masala Cashews & Almonds', 'slow-roasted-masala-cashews-almonds', 'Jumbo W240 cashews and California nonpareil almonds dry-roasted with Himalayan pink salt, cumin, chaat spices, and zero palm oil. Net wt. 200g resealable pouch.', 32000, 38000, 55, 'SNK-005', true),
    ('p6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'Cold-Pressed Extra Virgin Olive Oil (500ml)', 'cold-pressed-extra-virgin-olive-oil', 'First cold extraction of hand-picked Koroneiki olives. Low acidity (<0.3%), fruity peppery finish, and rich in natural polyphenols. 500ml UV-protected bottle.', 64900, 79900, 28, 'GRO-006', false),
    ('p7777777-7777-7777-7777-777777777777', 'c1111111-1111-1111-1111-111111111111', 'Fresh Blueberries (Imported 125g Punnet)', 'fresh-blueberries-punnet', 'Sweet, plump, antioxidant-rich blueberries air-flown fresh. Perfect for morning bowls, smoothies, and snacking. Net weight 125g.', 24900, 29900, 45, 'FRU-007', false),
    ('p8888888-8888-8888-8888-888888888888', 'c4444444-4444-4444-4444-444444444444', 'Ginger Lemon Sparkling Live Kombucha (330ml)', 'ginger-lemon-live-kombucha', 'Naturally fermented black and green tea infused with organic cold-pressed ginger and zesty lemon juice. Packed with beneficial probiotics. Glass bottle 330ml.', 14500, 17500, 50, 'BEV-008', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt_text, is_primary, sort_order)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80', 'Fresh Shimla Royal Gala Apples', true, 1),
    ('p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80', 'Truffle Rosemary Potato Crisps', true, 1),
    ('p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80', 'Raw Forest Honey Jar', true, 1),
    ('p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80', 'Hass Avocados Fresh Half', true, 1),
    ('p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1536591375315-1b8368903277?w=800&q=80', 'Roasted Masala Cashews and Almonds', true, 1),
    ('p6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80', 'Cold Pressed Extra Virgin Olive Oil', true, 1),
    ('p7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80', 'Fresh Blueberries Punnet', true, 1),
    ('p8888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80', 'Sparkling Kombucha Glass Bottle', true, 1)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- HOW TO PROMOTE A USER TO ADMIN:
-- Run this in SQL Editor after user signs up:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ====================================================================
