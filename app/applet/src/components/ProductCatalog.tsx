import React, { useState, useMemo } from 'react';
import { Product } from '../data/products';
import { Search, Plus, Eye, Check } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  const categories = [
    { id: 'all', label: 'Tüm Ürünler' },
    { id: 'zeytinyagi', label: 'Zeytinyağları' },
    { id: 'zeytin', label: 'Sofralık Zeytinler' },
    { id: 'ezme-gurme', label: 'Gurme Ezmeler' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section id="catalog" className="py-16 sm:py-20 border-b border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6A745F] uppercase tracking-wider mb-2">
              <span>Doğal Ürünlerimiz</span>
              <span aria-hidden="true">·</span>
              <span>Kuzey Ege Hasadı</span>
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#222B18]">
              Sofranıza Doğrudan 5F Koleksiyonu
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8C9384] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün veya bölge ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D5CDBD] rounded-lg text-sm text-[#222B18] placeholder-[#9CA294] focus:outline-none focus:ring-2 focus:ring-[#3B4A2C] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Category Filter Tabs (Functional segmented controls) */}
        <div className="flex items-center gap-2 p-1.5 bg-[#EDE8DE] rounded-xl max-w-fit mb-10 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#222B18] shadow-sm font-semibold'
                  : 'text-[#636C58] hover:text-[#222B18]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E2D7]">
            <p className="font-serif-heading text-xl text-[#2D3820] mb-2">Aradığınız kriterde ürün bulunamadı</p>
            <p className="text-sm text-[#737C69] mb-4">Lütfen farklı bir arama terimi veya kategori seçiniz.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-medium bg-[#3B4A2C] text-white rounded-lg hover:bg-[#2B371F] cursor-pointer"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const isAdded = !!addedIds[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white rounded-2xl border border-[#E4DDD0] overflow-hidden hover:border-[#B5AA96] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  {/* Image Container with Fallback */}
                  <div className="relative aspect-[4/3] bg-[#F2EDE4] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Quick View Overlay Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-[#384428] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer shadow-sm"
                      title="Detaylı İncele"
                      aria-label="Detaylı İncele"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Popularity or Stock note (Text kicker, no pill) */}
                    {product.isPopular && (
                      <div className="absolute bottom-3 left-3 bg-[#3B4A2C]/90 backdrop-blur-sm text-[#FAF8F5] text-[11px] font-medium px-2.5 py-1 rounded">
                        Çok Satan
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Unboxed Metadata Header */}
                      <div className="flex items-center gap-2 text-xs text-[#7B8570] font-medium mb-1.5">
                        <span>{product.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.volumeOrWeight}</span>
                        {product.acidity && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#3B4A2C] font-semibold">{product.acidity}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-serif-heading text-lg font-bold text-[#202717] leading-snug group-hover:text-[#3B4A2C] transition-colors mb-2">
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#616B56] line-clamp-2 leading-relaxed mb-4">
                        {product.subtitle}
                      </p>
                    </div>

                    {/* Bottom Pricing & Action Bar */}
                    <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono tabular-nums text-lg font-bold text-[#222B18]">
                            {product.price.toLocaleString('tr-TR')} ₺
                          </span>
                          {product.originalPrice && (
                            <span className="font-mono tabular-nums text-xs text-[#9DA594] line-through">
                              {product.originalPrice.toLocaleString('tr-TR')} ₺
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#7E8873]">KDV Dahil</span>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                          isAdded
                            ? 'bg-[#4B6834] text-white'
                            : 'bg-[#ECE5D9] text-[#2F3922] hover:bg-[#3B4A2C] hover:text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Eklendi</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Sepete Ekle</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
