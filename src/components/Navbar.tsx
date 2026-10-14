import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Phone, Heart, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCategory } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onNavigateSection: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onNavigateSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Banner */}
      <div className="bg-lime-900 text-lime-100 text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-lime-400" />
          <span>2025/2026 Erken Hasat Soğuk Sıkım Satışta!</span>
        </span>
        <span className="hidden md:inline text-lime-400/60">•</span>
        <span className="hidden sm:inline">500 TL Üzeri Ücretsiz Hızlı Kargo</span>
        <span className="hidden md:inline text-lime-400/60">•</span>
        <a 
          href="https://wa.me/905555555555?text=Merhaba,%205F%20Zeytin%20hakkında%20bilgi%20almak%20istiyorum." 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-white flex items-center gap-1"
        >
          <Phone className="w-3 h-3" /> WhatsApp Destek
        </a>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            onClick={() => onNavigateSection('hero')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-lime-900 via-lime-800 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-xl tracking-tighter">5F</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-bold text-2xl tracking-tight text-stone-900 group-hover:text-lime-900 transition-colors">
                  5F ZEYTİN
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-lime-100 text-lime-900">
                  Körfez
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-wide">
                Doğal & Soğuk Sıkım Kaz Dağları Çiftliği
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
            <button
              onClick={() => onNavigateSection('products')}
              className="hover:text-lime-800 transition-colors cursor-pointer"
            >
              Ürünlerimiz
            </button>
            <button
              onClick={() => onNavigateSection('philosophy')}
              className="hover:text-lime-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Award className="w-4 h-4 text-lime-700" /> 5F Felsefesi
            </button>
            <button
              onClick={() => onNavigateSection('advisor')}
              className="hover:text-lime-800 transition-colors cursor-pointer text-lime-800 font-semibold"
            >
              Yağ Danışmanı ✨
            </button>
            <button
              onClick={() => onNavigateSection('harvest')}
              className="hover:text-lime-800 transition-colors cursor-pointer"
            >
              Hasat Süreci
            </button>
            <button
              onClick={() => onNavigateSection('faqs')}
              className="hover:text-lime-800 transition-colors cursor-pointer"
            >
              Sıkça Sorulanlar
            </button>
            <button
              onClick={() => onNavigateSection('contact')}
              className="hover:text-lime-800 transition-colors cursor-pointer"
            >
              İletişim & Çiftlik
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Search Input toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-white border border-stone-300 rounded-full pl-3 pr-2 py-1 shadow-sm w-48 sm:w-64 transition-all">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Zeytinyağı, zeytin ara..."
                    className="w-full text-xs bg-transparent border-none outline-none px-2 text-stone-800"
                    autoFocus
                  />
                  <button 
                    onClick={() => { setSearchOpen(false); onSearchChange(''); }}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full hover:bg-stone-200/70 text-stone-700 transition-colors"
                  title="Ürün Ara"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-lime-900 text-white hover:bg-lime-800 transition-all flex items-center gap-2 shadow-sm"
              aria-label="Sepetim"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold pr-1">Sepet</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-900 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#faf8f5]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-stone-700 hover:bg-stone-200/70 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white/95 px-5 py-4 space-y-3 shadow-lg">
          <div className="pb-3 border-b border-stone-100">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ürün adı, gramaj veya lezzet ara..."
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 outline-none focus:border-lime-700"
            />
          </div>
          <button
            onClick={() => { onNavigateSection('products'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-lime-800"
          >
            Tüm Ürünler
          </button>
          <button
            onClick={() => { onNavigateSection('philosophy'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-lime-800"
          >
            5F Felsefemiz
          </button>
          <button
            onClick={() => { onNavigateSection('advisor'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-lime-800 font-semibold"
          >
            Zeytinyağı Danışmanı ✨
          </button>
          <button
            onClick={() => { onNavigateSection('harvest'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-lime-800"
          >
            Hasat & Üretim Süreci
          </button>
          <button
            onClick={() => { onNavigateSection('faqs'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-lime-800"
          >
            Sıkça Sorulan Sorular
          </button>
          <button
            onClick={() => { onNavigateSection('contact'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-lime-800"
          >
            İletişim & Çiftlik Ziyareti
          </button>
        </div>
      )}
    </header>
  );
};
