import React from 'react';
import { ShieldCheck, Sparkles, Leaf, Apple, Cookie, Truck } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Intro Hero */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">The ShopLite Harvest Story</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
          Nourishment from honest soil, delivered without compromise.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          ShopLite was started with a simple belief: daily fruits, snacks, and pantry staples should come from real farms, free from artificial waxes, industrial palm oils, or prolonged cold-storage degradation.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-xs">
        <div className="space-y-4">
          <h3 className="font-extrabold text-xl font-['Space_Grotesk'] text-stone-900">
            Regenerative Farm Sourcing
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We work directly with generational growers across Himachal Pradesh, Karnataka, and Uttarakhand. Our apples are tree-ripened and wax-free; our potato crisps are cooked in small batches with cold-pressed virgin oils; and our raw forest honey remains unheated to preserve live enzymes and pollen.
          </p>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            By cutting down middlemen, our harvest reaches your kitchen within 24 to 48 hours of picking.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 border border-stone-200 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80"
            alt="Organic harvest fruits"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-stone-900">100% Wax-Free</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Apples and stone fruits are never coated in shellac or petroleum waxes. Pure, wash-and-eat produce.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Cookie className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-stone-900">Clean Label Snacks</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Gourmet crisps and nuts roasted with zero refined palm oils, zero artificial flavorings, and rock salt.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-stone-900">Insulated Logistics</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Delivered in breathable, recycled thermal sleeves ensuring temperature stability and zero bruising.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-6">
        <button
          onClick={() => onNavigate('products', { category: 'all' })}
          className="px-8 py-3.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-transform hover:scale-105 shadow-md"
        >
          Explore Fresh Produce & Snacks
        </button>
      </div>
    </div>
  );
};
