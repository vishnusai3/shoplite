import React, { useEffect, useState } from 'react';
import { api, formatPrice } from '../services/api.ts';
import { Product, Category } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Package, 
  ChevronRight,
  Apple,
  Cookie,
  ShoppingBag,
  Coffee,
  HeartHandshake,
  Truck
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          api.getFeaturedProducts(),
          api.getCategories(),
        ]);
        setFeaturedProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'fruits': return <Apple className="w-4 h-4" />;
      case 'snacks': return <Cookie className="w-4 h-4" />;
      case 'grocery': return <ShoppingBag className="w-4 h-4" />;
      case 'beverages': return <Coffee className="w-4 h-4" />;
      default: return <Leaf className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-stone-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="absolute inset-0 bg-radial-at-tr from-stone-800 via-stone-900 to-black opacity-90 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-orange-400 text-xs font-semibold tracking-wide">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Farm-to-Door Harvest • 100% Organic & Non-GMO</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Space_Grotesk'] leading-[1.1]">
              Fresh farm fruits, <br />
              <span className="text-orange-500">wholesome snacks</span> & daily grocery staples.
            </h1>

            <p className="text-stone-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              Carefully harvested organic produce, slow-baked gourmet crisps, raw unheated forest honey, and cold-pressed kitchen essentials delivered with guaranteed freshness.
            </p>

            <div className="pt-2 flex flex-wrap gap-3.5 items-center">
              <button
                onClick={() => onNavigate('products', { category: 'all' })}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-orange-600/25 flex items-center gap-2"
              >
                <span>Shop Fresh Market</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('products', { category: 'fruits' })}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white font-medium text-xs sm:text-sm rounded-xl border border-white/15 backdrop-blur-xs transition-colors"
              >
                Explore Fruits & Berries
              </button>
            </div>

            {/* Fast Stats */}
            <div className="pt-6 border-t border-stone-800 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">100%</p>
                <p className="text-[11px] text-stone-400">Chemical & Wax Free</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">Under 24h</p>
                <p className="text-[11px] text-stone-400">Harvest to Dispatch</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">₹0 Fee</p>
                <p className="text-[11px] text-stone-400">Free delivery on ₹999+</p>
              </div>
            </div>
          </div>

          {/* Hero Fresh Produce Showcase Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto aspect-4/3 sm:aspect-5/4 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1000&q=85"
                alt="Fresh Organic Fruits & Produce"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

              {/* Floating Hero Card Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-stone-900/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400">Fresh Harvest</span>
                  <h4 className="text-xs sm:text-sm font-bold">Organic Shimla Royal Gala</h4>
                  <p className="text-[11px] text-stone-300">₹199 / 1 kg • In Stock</p>
                </div>
                <button
                  onClick={() => onNavigate('product-detail', { slug: 'shimla-royal-gala-apples' })}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white transition-colors"
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Fresh Aisles</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-['Space_Grotesk'] mt-0.5">
              Explore by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { category: 'all' })}
            className="text-xs font-semibold text-stone-700 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            All Pantry & Produce <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="group cursor-pointer relative rounded-xl overflow-hidden aspect-[16/10] bg-stone-200 border border-stone-200 hover:shadow-md transition-all"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-1.5 mb-0.5 text-orange-400">
                  {getCategoryIcon(cat.slug)}
                  <span className="text-[9px] font-bold uppercase tracking-wider">Aisle</span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm font-['Space_Grotesk'] group-hover:text-orange-400 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (COMPACT GRID - ITEM SIZE FIXED!) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Daily Hand-Picked</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-['Space_Grotesk'] mt-0.5">
              Popular Fruits, Snacks & Staples
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { category: 'all' })}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-orange-600 transition-colors"
          >
            Browse all items ({featuredProducts.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-stone-400 text-xs">Loading fresh produce...</div>
        ) : (
          /* COMPACT SPACE-EFFICIENT GROCERY GRID */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. FARM HONESTY & SOURCING PILLARS */}
      <section className="bg-stone-100/80 border-y border-stone-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Clean Food Standards</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-['Space_Grotesk']">
                Grown with care, picked at peak natural ripeness.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                We partner directly with certified regenerative farms across Himachal Pradesh, Karnataka, and Uttarakhand to bring pure, unadulterated nourishment to your kitchen.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate('about')}
                  className="text-xs font-bold text-stone-900 underline hover:text-orange-600 transition-colors"
                >
                  Learn about our harvest protocol &rarr;
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1.5">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-xs text-stone-900">Zero Synthetic Wax</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Fruits are completely unpolished and delivered in breathable eco-cartons.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1.5">
                <Cookie className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-xs text-stone-900">No Palm Oil Crisps</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Slow-cooked only in cold-pressed high-oleic virgin oils with pink Himalayan rock salt.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1.5">
                <Truck className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-xs text-stone-900">Cold-Chain Delivery</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Insulated packaging prevents thermal shock and preserves moisture integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-orange-600 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 max-w-xl text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold font-['Space_Grotesk']">
              Fill your pantry with wholesome goodness
            </h3>
            <p className="text-orange-100 text-xs sm:text-sm">
              Explore freshly harvested fruits, crunchy snacks, and pure grocery staples with Razorpay checkout.
            </p>
          </div>
          <button
            onClick={() => onNavigate('products', { category: 'all' })}
            className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-105 shrink-0"
          >
            Order Grocery Basket
          </button>
        </div>
      </section>
    </div>
  );
};
