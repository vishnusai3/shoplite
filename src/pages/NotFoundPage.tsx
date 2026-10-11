import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">404 Error</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-['Space_Grotesk']">
          Coordinate not found
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto">
          The requested page or equipment spec is outside our mapped perimeter.
        </p>
      </div>
      <button
        onClick={() => onNavigate('home')}
        className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
      >
        <span>Return to Storefront</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
