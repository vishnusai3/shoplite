import React, { useState } from 'react';
import { Product } from '../types.ts';
import { formatPrice } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { Plus, Check, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, cart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const cartQty = cartItem?.quantity || 0;

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;

    setAdding(true);
    const res = await addToCart(product.id, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const discountPercent = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents
    ? Math.round(((product.compareAtPriceCents - product.priceCents) / product.compareAtPriceCents) * 100)
    : null;

  // Extract compact unit/pack size from title or description if present
  const extractPackSize = () => {
    const text = product.title + ' ' + product.description;
    const match = text.match(/(\d+\s*(?:kg|g|ml|l|pack|units?|pieces?|box))/i);
    return match ? match[1].toLowerCase() : (product.category?.name || 'Fresh item');
  };

  const packSize = extractPackSize();

  return (
    <div
      onClick={() => onNavigate('product-detail', { slug: product.slug })}
      className="group cursor-pointer flex flex-col bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-400 transition-all duration-200"
    >
      {/* Compact Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-orange-600 text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-stone-900/90 text-white shadow-xs">
              Popular
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Pack / Weight Size Badge */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5 font-medium">
            <span className="capitalize">{packSize}</span>
            {product.stockQuantity > 0 && product.stockQuantity < 10 && (
              <span className="text-[10px] text-amber-700 font-semibold">
                Only {product.stockQuantity} left
              </span>
            )}
          </div>

          {/* Product Title (Compact 2-line clamp) */}
          <h3 className="font-semibold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Add to Bag Row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 gap-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-stone-900 font-['Space_Grotesk'] leading-none">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
              <span className="text-[10px] text-stone-400 line-through mt-0.5">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
          </div>

          {/* Compact Grocery Style Add Button */}
          {product.stockQuantity > 0 && (
            <button
              onClick={handleQuickAdd}
              disabled={adding}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
                added || cartQty > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200'
              }`}
              title="Add to shopping bag"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : cartQty > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{cartQty} in bag</span>
                </>
              ) : adding ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
