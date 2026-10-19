import React, { useState } from 'react';
import { CartItem, CustomerOrder } from '../types';
import { X, CheckCircle2, CreditCard, Banknote, Building2, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  onOrderSuccess: (order: CustomerOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  shipping,
  total,
  onOrderSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('Kadıköy');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'bank-transfer' | 'cash-on-delivery'>('credit-card');

  // Card state
  const [cardNumber, setCardNumber] = useState('4543 •••• •••• 1289');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('892');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('Lütfen gerekli iletişim ve adres alanlarını doldurunuz.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNumber = `5FZ-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: CustomerOrder = {
        orderId: orderNumber,
        fullName,
        email: email || 'musteri@5fzeytin.com',
        phone,
        city,
        district,
        address,
        paymentMethod,
        items,
        subtotal,
        discount,
        shipping,
        total,
        createdAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: 'Hazırlanıyor'
      };

      setCompletedOrder(newOrder);
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              {completedOrder ? 'Siparişiniz Alındı!' : 'Güvenli Sipariş Tamamlama'}
            </h3>
            <p className="text-xs text-stone-500">
              {completedOrder ? '5F Zeytin ailesine hoş geldiniz.' : 'Teslimat bilgilerinizi ve ödeme tercihinizi belirtin.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          /* Order Success State */
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-4 border-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Sipariş Numarası: {completedOrder.orderId}
              </span>
              <h4 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                Teşekkürler, Sayın {completedOrder.fullName}!
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
                Siparişiniz başarıyla oluşturuldu. Zeytinyağlarınız çiftliğimizin azot korumalı tanklarından taze olarak doldurulup yarın kargoya verilecektir.
              </p>
            </div>

            {/* Order Details summary */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Teslimat Adresi:</span>
                <span className="font-medium text-stone-800 text-right">
                  {completedOrder.district} / {completedOrder.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Ödeme Yöntemi:</span>
                <span className="font-medium text-stone-800">
                  {completedOrder.paymentMethod === 'credit-card'
                    ? 'Kredi Kartı'
                    : completedOrder.paymentMethod === 'bank-transfer'
                    ? 'Banka Havalesi / EFT'
                    : 'Kapıda Ödeme'}
                </span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-stone-900 text-sm">
                <span>Toplam Tutar:</span>
                <span className="font-serif text-lime-900">{completedOrder.total.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={`https://wa.me/905555555555?text=Merhaba,%20${completedOrder.orderId}%20numaralı%20siparişim%20hakkında%20bilgi%20almak%20istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>WhatsApp ile Sipariş Durumunu Takip Et</span>
              </a>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition-colors"
              >
                Alışverişe Devam Et
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-lime-800" />
                1. Teslimat ve İletişim Bilgileri
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız ve Soyadınız"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">E-Posta (İsteğe bağlı)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Şehir *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-1">Açık Teslimat Adresi *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mahalle, Cadde, Sokak, Bina No, Daire..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-1">Kurye & Sipariş Notu</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Zile basmayınız, güvenliğe bırakınız vb."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-lime-700"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-lime-800" />
                2. Ödeme Yöntemi
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit-card')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === 'credit-card'
                      ? 'border-lime-800 bg-lime-50 text-lime-900 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-lime-700" />
                  <span className="text-xs">Kredi / Banka Kartı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank-transfer')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === 'bank-transfer'
                      ? 'border-lime-800 bg-lime-50 text-lime-900 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span className="text-xs">Havale / EFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash-on-delivery')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                    paymentMethod === 'cash-on-delivery'
                      ? 'border-lime-800 bg-lime-50 text-lime-900 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs">Kapıda Nakit / Kart</span>
                </button>
              </div>

              {/* Conditional payment detail view */}
              {paymentMethod === 'credit-card' && (
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-stone-500 font-medium">
                    <span>Güvenli Kart Bilgileri</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" /> 3D Secure Korumalı
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Kart Numarası"
                    className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="AA/YY"
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVC/CVV"
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'bank-transfer' && (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-amber-900">5F Zeytin Ltd. Şti. Resmi Banka Hesabı</p>
                  <p className="font-mono text-[11px] text-stone-800">TR42 0006 2000 0001 2345 6789 01</p>
                  <p className="text-[10px] text-stone-500">
                    Açıklama alanına adınızı ve telefon numaranızı yazınız. Dekont WhatsApp hattımıza iletilebilir.
                  </p>
                </div>
              )}

              {paymentMethod === 'cash-on-delivery' && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-stone-700">
                  <p className="font-bold text-emerald-900">Kapıda Güvenli Ödeme</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Paketinizi teslim alırken kapıda nakit veya tüm banka/kredi kartları ile temassız ödeyebilirsiniz.
                  </p>
                </div>
              )}
            </div>

            {/* Summary & Submit */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-stone-900">
                <span>Ödenecek Toplam Tutar:</span>
                <span className="font-serif text-xl text-lime-900">
                  {total.toLocaleString('tr-TR')} TL
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-lime-900 hover:bg-lime-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-900/20 cursor-pointer active:scale-98 transition-all"
              >
                {isSubmitting ? (
                  <span>Siparişiniz Oluşturuluyor...</span>
                ) : (
                  <>
                    <span>Siparişi Onayla ve Tamamla</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
