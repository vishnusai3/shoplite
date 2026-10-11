import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { User, Shield, Package, Mail, Phone, MapPin, LogOut } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout, isAdmin } = useAuth();
  const [orderCount, setOrderCount] = useState<number>(0);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      api.getMyOrders().then(orders => {
        setOrderCount(orders.length);
        setLoadingOrders(false);
      }).catch(() => setLoadingOrders(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Sign in to view profile</h2>
        <p className="text-xs text-stone-500">Access your customer details and shipment archive.</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="border-b border-stone-200/80 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
            Customer Profile
          </h1>
          <p className="text-xs text-stone-500 mt-1">Manage your credentials and delivery preferences</p>
        </div>

        <button
          onClick={async () => {
            await logout();
            onNavigate('home');
          }}
          className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-red-50 hover:text-red-600 text-stone-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-stone-200 p-6 space-y-4 text-center shadow-xs">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-700 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
            {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">{user.fullName || 'Valued Customer'}</h2>
            <p className="text-xs text-stone-400 font-mono">{user.email}</p>
          </div>
          <div className="pt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              user.role === 'admin'
                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                : 'bg-stone-100 text-stone-700'
            }`}>
              {user.role} Account
            </span>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                Go to Admin Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Details & Fast Actions */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Account Attributes
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-stone-700">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>Primary Email: <strong className="text-stone-900">{user.email}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <Phone className="w-4 h-4 text-stone-400" />
                <span>Phone: <strong className="text-stone-900">{user.phone || '+91 98765 43210 (Demo)'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-stone-700">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>Region: <strong className="text-stone-900">India (Standard Logistics Zone)</strong></span>
              </div>
            </div>
          </div>

          {/* Orders Stat Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Purchase History</h4>
                <p className="text-xs text-stone-500">
                  {loadingOrders ? 'Counting dispatches...' : `${orderCount} verified orders registered in database`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
