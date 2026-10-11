import React, { useState, useEffect } from 'react';
import { api, formatPrice } from '../services/api.ts';
import { Order } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Package, Clock, CheckCircle, ChevronRight, ShoppingBag } from 'lucide-react';

interface OrderHistoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const list = await api.getMyOrders();
        setOrders(list);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Sign in to view orders</h2>
        <p className="text-xs text-stone-500">You must be logged in to access your order history.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="border-b border-stone-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
          Your Order History
        </h1>
        <p className="text-xs text-stone-500 mt-1">Review active and completed equipment dispatches</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500 text-xs">Loading your order archive...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-stone-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you complete an order via Razorpay Checkout, your tracking and invoice records will appear here.
          </p>
          <button
            onClick={() => onNavigate('products', { category: 'all' })}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={order.id}
                onClick={() => onNavigate('order-confirmation', { order })}
                className="group cursor-pointer p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-500 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-stone-900 text-sm">#{order.orderNumber}</p>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Placed on {dateStr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-['Space_Grotesk'] font-bold text-stone-900 text-base">
                      {formatPrice(order.totalCents)}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0">
                        {item.productImageUrl && (
                          <img src={item.productImageUrl} alt="" className="w-9 h-9 rounded-md object-cover border border-stone-200" />
                        )}
                        <span className="text-xs text-stone-700 font-medium line-clamp-1 max-w-[180px]">
                          {item.productTitle} &times; {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0 ml-4">
                    View receipt <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
