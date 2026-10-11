import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onNavigate('home');
    } else {
      setError(res.error || 'Failed to authenticate.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-stone-900 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
          S
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 font-['Space_Grotesk']">
          Welcome to ShopLite
        </h1>
        <p className="text-xs text-stone-500">
          Sign in to manage your bag, track dispatches, and access curated hardware.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Box */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 text-center">
            One-Click Developer & Tester Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await loginAsDemo('customer');
                onNavigate('home');
              }}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-stone-600" />
              <span>Customer Demo</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await loginAsDemo('admin');
                onNavigate('admin');
              }}
              className="p-2.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-orange-600" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-semibold text-orange-600 hover:underline"
          >
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
};
