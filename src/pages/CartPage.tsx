import React from 'react';
import { useCart } from '../context/CartContext.tsx';
import { formatPrice } from '../services/api.ts';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, loading, updateQuantity, removeItem, clearCart, subtotalCents, itemCount } = useCart();

  const freeShippingThresholdCents = 99900; // ₹999.00
  const isFreeShipping = subtotalCents >= freeShippingThresholdCents;
  const shippingCents = isFreeShipping || subtotalCents === 0 ? 0 : 9900;
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdCents - subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-stone-500 text-sm">
        Updating your shopping bag...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-stone-900 font-['Space_Grotesk']">
            Your shopping bag is empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            You haven't added any crafted equipment to your bag yet. Explore our latest acoustic and workspace releases.
          </p>
        </div>
        <button
          onClick={() => onNavigate('products', { category: 'all' })}
          className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
        >
          <span>Discover Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-xs text-stone-500 mt-1">{itemCount} items currently reserved</p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-stone-400 hover:text-red-600 transition-colors"
        >
          Clear bag
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-orange-600" />
            {isFreeShipping
              ? 'You unlocked free express shipping!'
              : `Add ${formatPrice(remainingForFreeShipping)} more to qualify for free shipping`}
          </span>
          <span className="font-bold text-stone-900">
            {Math.min(100, Math.round((subtotalCents / freeShippingThresholdCents) * 100))}%
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-orange-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (subtotalCents / freeShippingThresholdCents) * 100)}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Items vs Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => onNavigate('product-detail', { slug: product.slug })}
                    className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden cursor-pointer shrink-0 border border-stone-200"
                  >
                    <img
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {product.category?.name || 'Item'}
                    </span>
                    <h3
                      onClick={() => onNavigate('product-detail', { slug: product.slug })}
                      className="font-bold text-sm sm:text-base text-stone-900 hover:text-orange-600 cursor-pointer transition-colors line-clamp-1"
                    >
                      {product.title}
                    </h3>
                    <p className="text-xs font-semibold text-stone-700">
                      {formatPrice(product.priceCents)} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="flex items-center border border-stone-200 bg-stone-50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-stone-600 hover:text-stone-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold font-mono text-stone-900 bg-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-stone-600 hover:text-stone-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm sm:text-base text-stone-900 font-['Space_Grotesk']">
                      {formatPrice(product.priceCents * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-600 text-xs inline-flex items-center gap-1 transition-colors mt-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-stone-900 font-['Space_Grotesk']">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-stone-900">{formatPrice(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-stone-900">
                {shippingCents === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shippingCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST / Tax</span>
              <span className="font-semibold text-stone-900">Included</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between text-sm sm:text-base font-extrabold text-stone-900">
              <span>Total Amount</span>
              <span className="font-['Space_Grotesk'] text-orange-600">{formatPrice(totalCents)}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Checkout via Razorpay Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
