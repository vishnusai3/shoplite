import React from 'react';
import { Order } from '../types.ts';
import { formatPrice } from '../services/api.ts';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface OrderConfirmationPageProps {
  order?: Order;
  isSimulated?: boolean;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  isSimulated,
  onNavigate,
}) => {
  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">No active order to display</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Success Hero Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Payment Verified</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk']">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Order <strong className="text-stone-900 font-mono">#{order.orderNumber}</strong> has been received and verified. A confirmation receipt was generated for <strong className="text-stone-800">{order.customerEmail}</strong>.
          </p>
        </div>

        {isSimulated && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Processed in Sandbox Simulator Mode (Test Keys Pending)</span>
          </div>
        )}
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-[11px] text-stone-400 font-semibold uppercase">Order Number</span>
            <p className="font-mono font-bold text-stone-900 text-base">#{order.orderNumber}</p>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[11px] text-stone-400 font-semibold uppercase">Status</span>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-600 border-b border-stone-100 pb-6">
          <div>
            <h4 className="font-bold text-stone-900 uppercase text-[11px] mb-2 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-orange-600" />
              Delivery Destination
            </h4>
            <p className="font-semibold text-stone-900">{order.shippingAddress.recipientName}</p>
            <p>{order.shippingAddress.streetAddress}</p>
            {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            </p>
            <p className="mt-1 font-mono">{order.shippingAddress.phone}</p>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 uppercase text-[11px] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              Payment Verification
            </h4>
            <p>Provider: <strong>Razorpay Standard Gateway</strong></p>
            <p>Payment Status: <span className="text-emerald-700 font-bold uppercase">{order.payment?.status || 'Captured'}</span></p>
            {order.payment?.razorpayPaymentId && (
              <p className="font-mono text-[11px] text-stone-400">Ref: {order.payment.razorpayPaymentId}</p>
            )}
            <p className="mt-2 text-stone-500">Stock units deducted atomically from PostgreSQL inventory.</p>
          </div>
        </div>

        {/* Itemized List */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-900 uppercase text-xs">Ordered Items</h4>
          <div className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.productImageUrl && (
                    <img src={item.productImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200" />
                  )}
                  <div>
                    <p className="font-bold text-stone-900">{item.productTitle}</p>
                    <p className="text-stone-400">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-stone-900">
                  {formatPrice(item.totalPriceCents)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Cost */}
        <div className="border-t border-stone-200 pt-4 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingCents === 0 ? 'FREE' : formatPrice(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-100">
            <span>Total Paid</span>
            <span className="font-['Space_Grotesk'] text-orange-600">{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('orders')}
          className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>View All Orders</span>
        </button>

        <button
          onClick={() => onNavigate('products', { category: 'all' })}
          className="w-full sm:w-auto px-6 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
