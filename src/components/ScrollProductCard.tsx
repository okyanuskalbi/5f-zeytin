import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { ShoppingBag, Eye, Check, Droplets, AlertCircle } from 'lucide-react';

interface ScrollProductCardProps {
  product: Product;
  selectedVariantId?: string;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onInspect: (product: Product) => void;
  className?: string;
}

export const ScrollProductCard: React.FC<ScrollProductCardProps> = ({
  product,
  selectedVariantId,
  onAddToCart,
  onInspect,
  className = ''
}) => {
  // Find selected variant or default to first variant
  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0] || {
      id: 'default',
      title: product.volumeOrWeight,
      volumeOrWeight: product.volumeOrWeight,
      price: product.price,
      stock: product.stock,
      sku: product.sku
    };

  const [currentVariant, setCurrentVariant] = useState<ProductVariant>(activeVariant);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = currentVariant.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    onAddToCart(product, currentVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div
      className={`bg-white/95 backdrop-blur-md border border-[#D4B483]/60 rounded-3xl p-4 sm:p-5 shadow-2xl text-[#1C1C1C] transition-all duration-300 hover:shadow-[#243A29]/15 max-w-sm sm:max-w-md w-full ${className}`}
      role="region"
      aria-label={`${product.title} Ürün Kartı`}
    >
      <div className="flex gap-4 items-center">
        {/* Thumbnail with Acidity Pill */}
        <div 
          onClick={() => onInspect(product)}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer group"
        >
          <img
            src={product.media[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.acidity && (
            <div className="absolute bottom-1 left-1 bg-[#243A29]/90 text-[#D4B483] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
              <Droplets className="w-2.5 h-2.5" />
              <span>{product.acidity}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#243A29] mb-0.5">
            <span className="bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#D4B483]/40">
              {product.categoryTitle}
            </span>
            <span>•</span>
            <span className="text-stone-500">{product.harvestYear}</span>
          </div>

          <h3
            onClick={() => onInspect(product)}
            className="font-serif font-bold text-sm sm:text-base text-[#1C1C1C] hover:text-[#243A29] transition-colors truncate cursor-pointer"
          >
            {product.title}
          </h3>

          <p className="text-[11px] text-stone-500 line-clamp-1 mb-2">
            {product.subtitle}
          </p>

          {/* Price & Stock Display */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-extrabold text-[#243A29]">
              {currentVariant.price.toLocaleString('tr-TR')} <span className="text-xs font-sans font-normal text-stone-600">TL</span>
            </span>
            {currentVariant.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                {currentVariant.originalPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            <span className={`text-[10px] ml-auto font-bold px-2 py-0.5 rounded ${
              isOutOfStock
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-50 text-emerald-800'
            }`}>
              {isOutOfStock ? 'Tükendi' : `Stok: ${currentVariant.stock}`}
            </span>
          </div>
        </div>
      </div>

      {/* Variant Selector (if > 1 variant) */}
      {product.variants.length > 1 && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-stone-400 shrink-0">Hacim:</span>
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setCurrentVariant(v)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                currentVariant.id === v.id
                  ? 'bg-[#243A29] text-[#F5F1E7] shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {v.volumeOrWeight}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons: "Ürüne Bak" and "Sepete Ekle" */}
      <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-2">
        <button
          onClick={() => onInspect(product)}
          className="flex-1 py-2.5 px-3 rounded-xl border border-[#D4B483] text-[#243A29] hover:bg-[#FAF7F0] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#D4B483]" />
          <span>Ürüne Bak</span>
        </button>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex-[1.4] py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
            isAdded
              ? 'bg-emerald-700 text-white'
              : isOutOfStock
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-[#243A29] hover:bg-[#1a2b1e] text-[#F5F1E7] active:scale-98'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 animate-bounce" />
              <span>Eklendi ✓</span>
            </>
          ) : isOutOfStock ? (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Stokta Yok</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>Sepete Ekle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
