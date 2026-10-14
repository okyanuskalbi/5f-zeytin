import React, { useState } from 'react';
import { Product } from '../types';
import { X, Star, ShoppingBag, Droplets, ShieldCheck, Truck, Check, Share2, Sparkles, MessageCircle } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 900);
  };

  const whatsappMessage = encodeURIComponent(
    `Merhaba! 5F Zeytin'den "${product.name}" (${product.volumeOrWeight}) hakkında bilgi almak istiyorum.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center shadow-md transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative bg-stone-100 aspect-square md:aspect-auto h-72 md:h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-lime-900 text-lime-100 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
                {product.badge}
              </span>
            )}
            {product.acidity && (
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-lime-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                <Droplets className="w-4 h-4 text-lime-400" />
                <span>{product.acidity}</span>
              </div>
            )}
          </div>

          {/* Right: Details & Purchase */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Category & Harvest */}
              <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold uppercase tracking-wider">
                <span className="text-lime-800 bg-lime-100 px-2 py-0.5 rounded">
                  {product.volumeOrWeight}
                </span>
                <span>•</span>
                <span>{product.harvestYear} Hasadı</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-800">{product.rating}</span>
                <span className="text-stone-400">({product.reviewCount} Değerlendirme)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-extrabold text-lime-950">
                  {product.price} <span className="text-base font-sans font-medium text-stone-600">TL</span>
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {product.originalPrice} TL
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-stone-600 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Lab & Production Stats */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-700">
                {product.oliveType && (
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Zeytin Türü</span>
                    <span className="font-medium text-stone-900">{product.oliveType}</span>
                  </div>
                )}
                {product.pressType && (
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Sıkım Metodu</span>
                    <span className="font-medium text-stone-900">{product.pressType}</span>
                  </div>
                )}
                {product.polyphenol && (
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Polifenol Değeri</span>
                    <span className="font-medium text-lime-900 font-bold">{product.polyphenol}</span>
                  </div>
                )}
                {product.acidity && (
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Asitlik Oranı</span>
                    <span className="font-medium text-stone-900">{product.acidity}</span>
                  </div>
                )}
              </div>

              {/* Tasting Notes */}
              {product.tastingNotes && product.tastingNotes.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-lime-700" /> Tadım & Duyu Notaları
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tastingNotes.map((note) => (
                      <span
                        key={note}
                        className="text-[11px] bg-lime-50 text-lime-900 font-medium px-2.5 py-1 rounded-full border border-lime-200"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Recommendation */}
              {product.usageRecommendation && (
                <div className="text-xs text-stone-600 bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl">
                  <strong className="text-amber-900 font-semibold block mb-0.5">Önerilen Kullanım:</strong>
                  {product.usageRecommendation}
                </div>
              )}
            </div>

            {/* Actions: Quantity + Add to Cart */}
            <div className="pt-6 mt-6 border-t border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity picker */}
                <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-stone-800 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    addedAnimation
                      ? 'bg-emerald-700 text-white'
                      : product.inStock
                      ? 'bg-lime-900 text-white hover:bg-lime-800 shadow-lime-900/20 active:scale-98'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-5 h-5 animate-bounce" />
                      <span>Sepete Eklendi!</span>
                    </>
                  ) : product.inStock ? (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{(product.price * quantity).toLocaleString('tr-TR')} TL • Sepete Ekle</span>
                    </>
                  ) : (
                    <span>Tükendi</span>
                  )}
                </button>
              </div>

              {/* WhatsApp quick consult */}
              <a
                href={`https://wa.me/905555555555?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Bu Ürün İçin WhatsApp'tan Soru Sor</span>
              </a>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-lime-800 shrink-0" />
                  Kırılmaya Karşı Güvenli Kargo
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-800 shrink-0" />
                  %100 İade ve Değişim Garantisi
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
