import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('hero')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-serif-heading text-2xl font-bold tracking-tight text-[#2D3820] hover:text-[#1F2716] transition-colors whitespace-nowrap shrink-0">
            5F Zeytin
          </span>
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5A6350]">
          <button
            onClick={() => onNavigate('catalog')}
            className="hover:text-[#2D3820] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Koleksiyon
          </button>
          <button
            onClick={() => onNavigate('story')}
            className="hover:text-[#2D3820] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Hasat Hikayesi
          </button>
          <button
            onClick={() => onNavigate('guide')}
            className="hover:text-[#2D3820] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Zeytinyağı Rehberi
          </button>
          <button
            onClick={() => onNavigate('quality')}
            className="hover:text-[#2D3820] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            5F Güvencesi
          </button>
        </nav>

        {/* Zone 3: 1 primary action (Cart drawer trigger) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onOpenCart}
            aria-label="Sepeti aç"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#3B4A2C] text-[#FAF8F5] rounded-lg hover:bg-[#2F3C23] active:scale-[0.98] transition-all text-sm font-medium cursor-pointer shadow-sm whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#3B4A2C] focus-visible:ring-offset-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sepet</span>
            <span className="tabular-nums font-mono text-xs bg-white/20 px-2 py-0.5 rounded">
              {cartCount}
            </span>
            {cartTotal > 0 && (
              <span className="hidden sm:inline border-l border-white/25 pl-2 tabular-nums text-xs">
                {cartTotal.toLocaleString('tr-TR')} ₺
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
