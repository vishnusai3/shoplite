# ShopLite — Full-Stack E-Commerce Application

ShopLite is a production-minded mini e-commerce web application engineered with a warm minimalist storefront, Node.js Express backend, Supabase PostgreSQL persistence with Row-Level Security (RLS), and Razorpay Standard Checkout in test mode.

---

## 1. Architecture Overview

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Vite
- **Backend:** Node.js with Express, TypeScript, CORS, Rate Limiting, HMAC-SHA256 Signature Verification
- **Database:** Supabase PostgreSQL with RLS policies, indexed relational tables, and UUID keys
- **Authentication:** Supabase Auth (Email & Password), JWT verification, and Role-Based Access Control (RBAC)
- **Payments:** Razorpay Standard Checkout in test mode with server-side price recalculation, order creation, signature verification, and idempotent webhook handling
- **Deployment:** Vercel (Frontend SPA) and Render (Express Web Service)

---

## 2. Directory Structure

```
├── .env.example                     # Reference environment variables
├── index.html                       # HTML entry point with Razorpay checkout SDK
├── metadata.json                    # AI Studio applet metadata
├── package.json                     # Root npm scripts and dependencies
├── server.ts                        # Express server entry point (Vite middleware in dev, static dist in prod)
├── supabase_schema.sql              # Supabase PostgreSQL schema, migrations, RLS & seed data
├── supabase/
│   └── migrations/
│       └── 20261011_initial_schema.sql
├── src/
│   ├── main.tsx                     # React client mounting
│   ├── App.tsx                      # Root state router and layout
│   ├── index.css                    # Tailwind CSS imports & global styles
│   ├── types.ts                     # Frontend TypeScript models
│   ├── components/
│   │   ├── Navbar.tsx               # Header with search, categories, bag badge & status trigger
│   │   ├── Footer.tsx               # Editorial footer with trust badges and policies
│   │   ├── ProductCard.tsx          # Card with zoom, stock status, INR pricing & quick add
│   │   └── SetupStatusModal.tsx     # Live system diagnostics and automated backend test runner
│   ├── context/
│   │   ├── AuthContext.tsx          # Supabase Auth + demo accounts + RBAC
│   │   └── CartContext.tsx          # Shopping bag operations, stock checks, subtotal
│   ├── pages/
│   │   ├── HomePage.tsx             # Hero, categories, featured releases, craftsmanship manifesto
│   │   ├── ProductListPage.tsx      # Search, category filters, price/alphabetical sorting, pagination
│   │   ├── ProductDetailPage.tsx    # Gallery, price, descriptions, stock count, quantity stepper
│   │   ├── CartPage.tsx             # Bag controls, free shipping threshold progress, order summary
│   │   ├── CheckoutPage.tsx         # Delivery addresses, customer details, Razorpay trigger
│   │   ├── OrderConfirmationPage.tsx# Verified order receipt, tracking details, summary
│   │   ├── OrderHistoryPage.tsx     # Past order archive with payment status
│   │   ├── ProfilePage.tsx          # Customer profile attributes and fast links
│   │   ├── LoginPage.tsx            # Email & password login + quick demo switches
│   │   ├── RegisterPage.tsx         # Customer registration with validation
│   │   ├── AdminDashboardPage.tsx   # Admin dashboard: overview, products CRUD, order statuses, tests
│   │   ├── AboutPage.tsx            # Materials and brand story
│   │   ├── ContactPage.tsx          # Support inquiries form
│   │   └── NotFoundPage.tsx         # Custom 404 page
│   ├── server/
│   │   ├── types.ts                 # Backend data contracts & schemas
│   │   ├── routes/
│   │   │   └── api.ts               # Express REST router
│   │   ├── controllers/
│   │   │   ├── productController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── cartController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── paymentController.ts
│   │   │   ├── adminController.ts
│   │   │   └── authController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts              # Bearer token verification & requireAdmin guard
│   │   │   ├── rateLimiter.ts       # Sliding window rate limiter
│   │   │   └── errorHandler.ts      # Centralized error handler
│   │   ├── services/
│   │   │   ├── razorpayService.ts   # Razorpay SDK client & HMAC-SHA256 signature verifier
│   │   │   └── tests.ts             # Automated backend verification test suite
│   │   └── db/
│   │       ├── supabase.ts          # Supabase client initializer
│   │       └── dataStore.ts         # Unified storage engine (Supabase PostgreSQL + seed fallback)
```

---

## 3. Database Setup (Supabase PostgreSQL)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> **New query**.
3. Open `supabase_schema.sql` (or `supabase/migrations/20261011_initial_schema.sql`) from this repository.
4. Copy and paste the entire script into the query editor and click **Run**.
5. The script automatically creates:
   - Tables: `profiles`, `categories`, `products`, `product_images`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `processed_webhooks`.
   - Security: Row Level Security (RLS) policies ensuring customers only read/write their own records, while public visitors view active products and categories.
   - Admin function: `public.is_admin()`.
   - Automatic triggers: auto-creates customer profile upon sign-up via `auth.users`.
   - Rich seed data: 4 categories, 6 hardware items, and sample images.
6. Copy your **Project URL**, **anon key**, and **service_role key** from **Project Settings -> API** into `.env`.

### Initial Administrator Provisioning

To assign administrator privileges to your user:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 4. Razorpay Test Payments Setup

1. Sign up or log in at [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Ensure you are in **Test Mode** (toggle visible in top header).
3. Navigate to **Account & Settings -> API Keys -> Generate Key**.
4. Copy the generated:
   - `Key ID` (e.g. `rzp_test_...`)
   - `Key Secret`
5. Paste them into `.env`:
   ```env
   RAZORPAY_KEY_ID="rzp_test_YourTestKeyId"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"
   RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
   ```
6. (Optional) For Webhooks:
   - Go to **Account & Settings -> Webhooks -> Add New Webhook**.
   - URL: `https://your-backend-url.onrender.com/api/payments/webhook`
   - Secret: Same as `RAZORPAY_WEBHOOK_SECRET`.
   - Events: `payment.captured`, `payment.failed`, `order.paid`.

---

## 5. Local Setup & Execution

### Prerequisites
- Node.js 20+ installed

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Start the unified development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:3000`.

---

## 6. Running Backend Verification Tests

ShopLite includes a dedicated test suite verifying:
- Product catalog prices and formats
- Server-side trusted price computation (client price tamper protection)
- Concurrency-safe atomic stock deduction and overselling guards
- Razorpay HMAC-SHA256 signature verification
- Webhook duplicate event rejection (Idempotency)
- Role-based authorization and RBAC boundaries
- Order persistence and item linking

### CLI Runner:
```bash
npx tsx src/server/services/tests.ts
```

### UI Runner:
Click **Cloud Status & Test Runner** in the top navigation bar or go to **Admin Dashboard -> Backend Tests** to execute the suite and inspect real-time results directly in the browser!

---

## 7. Deployment Instructions

### A. Deploy Backend to Render

1. Push your repository to GitHub.
2. Go to [render.com](https://render.com) and click **New -> Web Service**.
3. Select your repository.
4. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
   - `RAZORPAY_WEBHOOK_SECRET`: Your Webhook Secret
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://shoplite.vercel.app`)
6. Deploy! Render will give you a URL like `https://shoplite-api.onrender.com`.

### B. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New -> Project**.
2. Import your GitHub repository.
3. Framework Preset: **Vite**.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://shoplite-api.onrender.com/api` (or `/api` if deployed as single fullstack service)
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay Test Key ID
5. Click **Deploy**.
