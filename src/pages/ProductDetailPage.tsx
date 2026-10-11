import React, { useState, useEffect } from 'react';
import { api, formatPrice } from '../services/api.ts';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { 
  Check, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight,
  Share2
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await api.getProductBySlug(slug);
        setProduct(prod);
        setSelectedImageIndex(0);
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-stone-500 text-sm">
        Retrieving hardware specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Product Not Found</h2>
        <p className="text-stone-500 text-xs">The requested instrument could not be located in our catalog.</p>
        <button
          onClick={() => onNavigate('products', { category: 'all' })}
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', productId: product.id, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80', isPrimary: true, sortOrder: 1 }];

  const activeImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = async () => {
    if (product.stockQuantity <= 0) return;
    setAdding(true);
    const res = await addToCart(product.id, quantity);
    setAdding(false);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (product.stockQuantity <= 0) return;
    await addToCart(product.id, quantity);
    onNavigate('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => onNavigate('home')} className="hover:text-stone-900 transition-colors">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <button onClick={() => onNavigate('products', { category: 'all' })} className="hover:text-stone-900 transition-colors">Products</button>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button 
              onClick={() => onNavigate('products', { category: product.category?.slug })} 
              className="hover:text-stone-900 transition-colors"
            >
              {product.category.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image (Well proportioned) */}
          <div className="relative aspect-[4/3] max-h-[440px] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs">
            <img
              src={activeImage.url}
              alt={activeImage.altText || product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.isFeatured && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/90 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                Featured Selection
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-orange-600 ring-2 ring-orange-500/20'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & Purchase Control */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges / Category / SKU */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider">
                {product.category?.name || 'Artifact'}
              </span>
              <span className="text-stone-400 font-mono">SKU: {product.sku || 'SL-STD'}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk'] leading-tight">
              {product.title}
            </h1>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-bold text-stone-900 font-['Space_Grotesk']">
                {formatPrice(product.priceCents)}
              </span>
              {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                <span className="text-base text-stone-400 line-through">
                  {formatPrice(product.compareAtPriceCents)}
                </span>
              )}
              <span className="text-xs text-stone-500">Taxes included</span>
            </div>

            {/* Stock Availability Indicator */}
            <div className="pt-2">
              {product.stockQuantity > 0 ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80 inline-flex">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>In Stock ({product.stockQuantity} available to ship)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200/80 inline-flex">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Currently Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-stone-200">
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector & Action Buttons */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-stone-700">Quantity:</span>
                  <div className="inline-flex items-center border border-stone-200 bg-stone-50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-2 text-xs font-bold font-mono text-stone-900 bg-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                      disabled={quantity >= product.stockQuantity}
                      className="px-3 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Bag
                      </>
                    ) : adding ? (
                      <span>Adding...</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md shadow-orange-600/20"
                  >
                    Instant Checkout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guarantees & Value props */}
          <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200/80 space-y-2.5 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Complimentary express delivery across India on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Freshness Guarantee • Wax-free & Non-GMO sourced</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Instant replacement or full refund if quality isn't 100% satisfying</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
