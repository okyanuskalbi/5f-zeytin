import React, { useState } from 'react';
import { Product } from '../data/products';
import { X, Check, ShieldCheck, MapPin, Calendar, Award } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FAF8F5] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#DCD5C7] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-[#38432A] rounded-full transition-colors cursor-pointer shadow-sm"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Gallery / Image Column */}
          <div className="md:col-span-5 bg-[#EFE9DF] p-6 flex flex-col justify-center items-center relative">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-[#DDD5C7]">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-4 w-full bg-white/80 rounded-xl p-3 border border-[#E2DBD0] text-xs text-[#5D6652] space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#3B4A2C] shrink-0" />
                <span className="font-medium">Menşei:</span> {product.region}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#3B4A2C] shrink-0" />
                <span className="font-medium">Hasat Yılı:</span> {product.harvestYear}
              </div>
              {product.acidity && (
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#3B4A2C] shrink-0" />
                  <span className="font-medium">Oleik Asit:</span> {product.acidity}
                </div>
              )}
            </div>
          </div>

          {/* Purchase Module Column */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-[#717B65] font-semibold uppercase tracking-wider mb-2">
                <span>{product.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{product.volumeOrWeight}</span>
              </div>

              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#222B18] leading-tight mb-3">
                {product.name}
              </h2>

              <p className="text-sm text-[#555E4C] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Tasting Notes */}
              {product.tastingNotes && product.tastingNotes.length > 0 && (
                <div className="mb-6 bg-white p-4 rounded-xl border border-[#E5DFD4]">
                  <p className="text-xs font-semibold text-[#3B4A2C] uppercase tracking-wider mb-2">
                    Duyusal Tadım Profili
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.tastingNotes.map((note, index) => (
                      <span
                        key={index}
                        className="text-xs text-[#454E3A] bg-[#F2EEE7] px-2.5 py-1 rounded"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Feature Checklist */}
              <div className="mb-6 space-y-2">
                <p className="text-xs font-semibold text-[#3B4A2C] uppercase tracking-wider">
                  Ürün Özellikleri & Doğallık Taahhüdü
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#525B48]">
                      <ShieldCheck className="w-4 h-4 text-[#495B36] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Contiguous Purchase Module */}
            <div className="pt-6 border-t border-[#E8E2D7] space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#7A836F] block">Toplam Tutar</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono tabular-nums text-3xl font-bold text-[#222B18]">
                      {(product.price * quantity).toLocaleString('tr-TR')} ₺
                    </span>
                    {product.originalPrice && (
                      <span className="font-mono tabular-nums text-sm text-[#9CA393] line-through">
                        {(product.originalPrice * quantity).toLocaleString('tr-TR')} ₺
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#CEC5B4] rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-sm text-[#46503B] hover:bg-[#F2ECE2] disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-mono font-medium text-[#222B18] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-sm text-[#46503B] hover:bg-[#F2ECE2] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAdd}
                disabled={justAdded}
                className={`w-full py-3.5 px-6 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] ${
                  justAdded
                    ? 'bg-[#3A5D2A] text-white'
                    : 'bg-[#3B4A2C] text-[#FAF8F5] hover:bg-[#2C3820]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Sepete Eklendi!</span>
                  </>
                ) : (
                  <span>Sepete Ekle · {(product.price * quantity).toLocaleString('tr-TR')} ₺</span>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
