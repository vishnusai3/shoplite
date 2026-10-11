import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Value Propositions Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-orange-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Insured Express Shipping</h4>
              <p className="text-xs text-stone-400">Dispatched within 24 hours with trackable logistics</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-orange-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Razorpay Standard Security</h4>
              <p className="text-xs text-stone-400">PCI-DSS compliant HMAC signature verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-orange-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Hassle-Free 14-Day Returns</h4>
              <p className="text-xs text-stone-400">Full refund if items do not meet your expectations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-extrabold text-xl text-white font-['Space_Grotesk'] tracking-tight">
              Shop<span className="text-orange-500">Lite</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Curated contemporary design objects, mechanical peripherals, acoustics, and daily carry items crafted for discerning spaces.
          </p>
          <div className="text-[11px] text-stone-500">
            Powered by Supabase PostgreSQL & Express
          </div>
        </div>

        {/* Shop Collections */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Market Aisles</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li>
              <button onClick={() => onNavigate('products', { category: 'fruits' })} className="hover:text-white transition-colors">
                Fresh Fruits & Berries
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products', { category: 'snacks' })} className="hover:text-white transition-colors">
                Snacks & Crisps
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products', { category: 'grocery' })} className="hover:text-white transition-colors">
                Pantry & Staples
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products', { category: 'beverages' })} className="hover:text-white transition-colors">
                Cold Brews & Kombucha
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products', { category: 'all' })} className="hover:text-white transition-colors">
                Explore All Items
              </button>
            </li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li>
              <button onClick={() => onNavigate('orders')} className="hover:text-white transition-colors">
                Track Order
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                About ShopLite
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                Contact & Support
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('profile')} className="hover:text-white transition-colors">
                Customer Account
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stay Connected</h4>
          <p className="text-xs text-stone-400">
            Subscribe for limited batch releases, archival discounts, and industrial design notes.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 flex-1"
            />
            <button 
              onClick={() => alert('Thank you for subscribing to ShopLite updates!')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <div>
          © {new Date().getFullYear()} ShopLite Inc. All rights reserved. Crafted with precision.
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-stone-400 cursor-pointer">Security Audits</span>
        </div>
      </div>
    </footer>
  );
};
