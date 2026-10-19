import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  discountRate: number;
  promoCode: string;
  onApplyPromoCode: (code: string) => boolean;
}

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 69;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discountRate,
  promoCode,
  onApplyPromoCode
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * discountRate);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping || subtotal === 0 ? 0 : SHIPPING_COST;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const finalTotal = subtotal - discountAmount + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = onApplyPromoCode(promoInput.trim().toUpperCase());
    if (success) {
      setPromoMessage({ text: '%10 İndirim Kuponu Başarıyla Uygulandı!' });
    } else {
      setPromoMessage({ text: 'Geçersiz kupon kodu. "HOSGELDIN10" veya "5FZEYTIN" deneyin.', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-slide-left">
          
          {/* Top Header */}
          <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-lime-900" />
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Alışveriş Sepetim ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-lime-950 text-lime-100 px-5 py-3 text-xs">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 font-medium">
                <Truck className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Tebrikler! Ücretsiz Kargo avantajından yararlanıyorsunuz.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Ücretsiz Kargo için:</span>
                  <span className="font-bold text-lime-300">
                    {remainingForFreeShipping} TL daha ekleyin
                  </span>
                </div>
                <div className="w-full bg-lime-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-lime-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Item List Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif font-bold text-base text-stone-800">
                  Sepetiniz Henüz Boş
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  En taze soğuk sıkım zeytinyağlarımızdan ve doğal zeytinlerimizden sepetinize ekleyin.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-lime-900 text-white text-xs font-semibold hover:bg-lime-800 cursor-pointer"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3.5"
                >
                  {/* Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 block mb-1">
                      {item.product.volumeOrWeight}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-xs">
                        {(item.product.price * item.quantity).toLocaleString('tr-TR')} TL
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-stone-400">
                          ({item.product.price} TL / adet)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity and delete */}
                  <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Ürünü Çıkar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 hover:bg-stone-200 text-stone-600 font-bold flex items-center justify-center rounded-l"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-stone-800 text-[11px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 hover:bg-stone-200 text-stone-600 font-bold flex items-center justify-center rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer calculation & checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-4">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="İndirim Kodu (örn: HOSGELDIN10)"
                      className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Uygula
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] font-medium ${
                      promoMessage.error ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span className="font-medium text-stone-900">{subtotal.toLocaleString('tr-TR')} TL</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>İndirim ({promoCode})</span>
                    <span>-{discountAmount.toLocaleString('tr-TR')} TL</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : `${shipping} TL`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-100">
                  <span className="font-serif">Toplam Tutar</span>
                  <span className="font-serif">{finalTotal.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-lime-900 hover:bg-lime-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-900/20 active:scale-98 transition-all cursor-pointer"
              >
                <span>Siparişi Tamamla</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-700" />
                <span>256-Bit SSL Korumalı Güvenli Ödeme</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
