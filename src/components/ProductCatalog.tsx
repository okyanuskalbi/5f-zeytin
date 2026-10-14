import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { Star, ShoppingBag, Eye, Sparkles, Filter, Check, Droplets } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
}

const CATEGORIES: { id: ProductCategory; label: string; countSuffix?: string }[] = [
  { id: 'all', label: 'Tüm Ürünler' },
  { id: 'oil', label: 'Soğuk Sıkım Zeytinyağı' },
  { id: 'olive', label: 'Sofralık Zeytinler' },
  { id: 'gourmet', label: 'Gurme & Şarküteri' },
  { id: 'natural-soap', label: 'Doğal Zeytinyağı Sabunları' }
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onAddToCart,
  onViewProduct
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSub = p.subtitle.toLowerCase().includes(q);
          const matchNotes = p.tastingNotes?.some((n) => n.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchSub && !matchNotes) return false;
        }
        // stock
        if (onlyInStock && !p.inStock) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // featured default
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, onlyInStock, sortBy]);

  return (
    <section id="products" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-lime-800">
            5F Butik Çiftlik Koleksiyonu
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Doğal & Katkısız Zeytin Ürünleri
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Sınırlı sayıda üretilen erken hasat yağlarımız, taş değirmen ezmelerimiz ve geleneksel siyah-yeşil sofralık zeytinlerimiz.
          </p>
        </div>

        {/* Sorting and stock filter */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 px-3 py-2 rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="accent-lime-800 rounded"
            />
            <span>Yalnızca Stokta Olanlar</span>
          </label>

          <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-stone-800 font-semibold cursor-pointer"
            >
              <option value="featured">Öne Çıkanlar</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">En Yüksek Puan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-lime-900 text-white shadow-md shadow-lime-900/20'
                  : 'bg-white text-stone-700 border border-stone-200/90 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active search banner if search query exists */}
      {searchQuery && (
        <div className="mb-6 bg-lime-50 border border-lime-200 text-lime-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <span>
            <strong>"{searchQuery}"</strong> araması için <strong>{filteredProducts.length}</strong> ürün listeleniyor.
          </span>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
          <Droplets className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-800">Aradığınız kriterlere uygun ürün bulunamadı</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Farklı bir arama terimi deneyebilir veya filtreleri temizleyerek tüm ürünlerimizi görüntüleyebilirsiniz.
          </p>
          <button
            onClick={() => { onSelectCategory('all'); setOnlyInStock(false); }}
            className="mt-4 px-4 py-2 rounded-xl bg-lime-900 text-white text-xs font-semibold hover:bg-lime-800"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountPercent = hasDiscount
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onViewProduct(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Badge top-left */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-lime-900 text-lime-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Discount badge top-right */}
                  {hasDiscount && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                      %{discountPercent} İndirim
                    </span>
                  )}

                  {/* Acidity / Key Stat Bottom Overlay */}
                  {product.acidity && (
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-lime-300 text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-lime-400" />
                      <span>{product.acidity}</span>
                    </div>
                  )}

                  {/* Quick View Floating Action */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white text-stone-900 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-3.5 h-3.5" /> İncele
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Volume & Harvest */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1.5">
                      <span className="font-semibold text-lime-800 bg-lime-50 px-2 py-0.5 rounded">
                        {product.volumeOrWeight}
                      </span>
                      <span>{product.harvestYear}</span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onViewProduct(product)}
                      className="font-serif font-bold text-base text-stone-900 hover:text-lime-900 transition-colors line-clamp-2 cursor-pointer mb-1 leading-snug"
                    >
                      {product.name}
                    </h3>

                    {/* Subtitle / Short description */}
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
                      {product.subtitle}
                    </p>
                  </div>

                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="font-bold text-stone-800">{product.rating}</span>
                      <span className="text-stone-400">({product.reviewCount})</span>
                    </div>

                    {/* Price and Cart Action */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        {hasDiscount && (
                          <span className="text-[11px] text-stone-400 line-through block">
                            {product.originalPrice} TL
                          </span>
                        )}
                        <span className="text-lg font-bold text-stone-950 font-serif">
                          {product.price} <span className="text-xs font-sans text-stone-600 font-normal">TL</span>
                        </span>
                      </div>

                      <button
                        onClick={() => onAddToCart(product, 1)}
                        className="px-3.5 py-2.5 rounded-xl bg-lime-900 hover:bg-lime-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        title="Sepete Ekle"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
