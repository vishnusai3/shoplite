import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  Shield, 
  LogOut, 
  Package, 
  Layers, 
  Activity,
  ChevronDown
} from 'lucide-react';
import { SetupStatusModal } from './SetupStatusModal.tsx';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, isAdmin, logout, loginAsDemo } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs px-4 py-2 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Complimentary insured delivery on all orders above ₹999</span>
            <span className="sm:hidden">Free shipping over ₹999</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowStatusModal(true)}
              className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] font-medium text-orange-400 hover:text-orange-300"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cloud Status & Test Runner</span>
            </button>
            <div className="hidden md:flex items-center gap-3 border-l border-stone-700 pl-3">
              {!user ? (
                <>
                  <button 
                    onClick={() => loginAsDemo('customer')}
                    className="text-stone-400 hover:text-stone-200"
                  >
                    Demo Customer
                  </button>
                  <button 
                    onClick={() => loginAsDemo('admin')}
                    className="text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Demo Admin
                  </button>
                </>
              ) : (
                <span className="text-stone-400">
                  Signed in as: <strong className="text-white font-medium">{user.role}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white font-bold tracking-tight text-lg shadow-sm group-hover:bg-orange-600 transition-colors">
                  S
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-stone-900 font-['Space_Grotesk']">
                    Shop<span className="text-orange-600">Lite</span>
                  </span>
                  <span className="block text-[10px] tracking-widest uppercase font-semibold text-stone-600 -mt-1">
                    Storefront
                  </span>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700">
                <button
                  onClick={() => onNavigate('products', { category: 'all' })}
                  className={`hover:text-stone-900 transition-colors ${
                    currentPage === 'products' ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => onNavigate('products', { category: 'fruits' })}
                  className="hover:text-stone-900 transition-colors"
                >
                  Fresh Fruits
                </button>
                <button
                  onClick={() => onNavigate('products', { category: 'snacks' })}
                  className="hover:text-stone-900 transition-colors"
                >
                  Snacks & Crisps
                </button>
                <button
                  onClick={() => onNavigate('products', { category: 'grocery' })}
                  className="hover:text-stone-900 transition-colors"
                >
                  Pantry & Staples
                </button>
                <button
                  onClick={() => onNavigate('products', { category: 'beverages' })}
                  className="hover:text-stone-900 transition-colors"
                >
                  Beverages
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className={`hover:text-stone-900 transition-colors ${
                    currentPage === 'about' ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  About
                </button>
              </nav>
            </div>

            {/* Search Input Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xs mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search fruits, snacks, pantry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-100/80 border border-stone-200/90 rounded-full pl-9 pr-4 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>
            </div>

            {/* Actions: Admin, Cart, Auth, Mobile Toggle */}
            <div className="flex items-center gap-3">
              {/* Admin Dashboard Pill if Admin */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5 text-orange-400" />
                  Admin Dashboard
                </button>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={() => onNavigate('cart')}
                className="relative p-2.5 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 transition-colors"
                  aria-label="User account"
                >
                  <UserIcon className="w-5 h-5" />
                  <ChevronDown className="w-3.5 h-3.5 hidden sm:block text-stone-400" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-xs font-semibold text-stone-900 truncate">{user.fullName || user.email}</p>
                          <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                          <span className={`mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => onNavigate('admin')}
                            className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 font-medium"
                          >
                            <Shield className="w-4 h-4 text-orange-600" />
                            Admin Console
                          </button>
                        )}

                        <button
                          onClick={() => onNavigate('orders')}
                          className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-stone-400" />
                          Order History
                        </button>

                        <button
                          onClick={() => onNavigate('profile')}
                          className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          Customer Profile
                        </button>

                        <div className="border-t border-stone-100 my-1"></div>

                        <button
                          onClick={() => logout()}
                          className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-xs text-stone-500 border-b border-stone-100">
                          Sign in to manage your orders & bag
                        </div>
                        <button
                          onClick={() => onNavigate('login')}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-stone-900 hover:bg-stone-50"
                        >
                          Log In
                        </button>
                        <button
                          onClick={() => onNavigate('register')}
                          className="w-full px-4 py-2 text-left text-xs text-stone-600 hover:bg-stone-50"
                        >
                          Create Account
                        </button>
                        <div className="border-t border-stone-100 my-1"></div>
                        <div className="px-4 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-stone-600">
                          Instant Quick Sign-in:
                        </div>
                        <button
                          onClick={() => loginAsDemo('customer')}
                          className="w-full px-4 py-1.5 text-left text-xs text-stone-700 hover:bg-stone-50"
                        >
                          Demo Customer
                        </button>
                        <button
                          onClick={() => loginAsDemo('admin')}
                          className="w-full px-4 py-1.5 text-left text-xs text-orange-600 font-medium hover:bg-stone-50"
                        >
                          Demo Administrator
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-stone-700 hover:text-stone-900"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-stone-200/80 space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-100 border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-800"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              <div className="grid grid-cols-2 gap-2 text-sm font-medium text-stone-700">
                <button
                  onClick={() => { onNavigate('products', { category: 'all' }); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  All Items
                </button>
                <button
                  onClick={() => { onNavigate('products', { category: 'fruits' }); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  Fresh Fruits
                </button>
                <button
                  onClick={() => { onNavigate('products', { category: 'snacks' }); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  Snacks & Crisps
                </button>
                <button
                  onClick={() => { onNavigate('products', { category: 'grocery' }); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  Pantry & Grocery
                </button>
                <button
                  onClick={() => { onNavigate('products', { category: 'beverages' }); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  Beverages
                </button>
                <button
                  onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  About Us
                </button>
              </div>

              {isAdmin && (
                <button
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                  className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-orange-400" />
                  Admin Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Diagnostics Modal */}
      <SetupStatusModal 
        isOpen={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
      />
    </>
  );
};
