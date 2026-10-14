import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag, Droplets, Award } from 'lucide-react';

interface OliveOilAdvisorProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
}

export const OliveOilAdvisor: React.FC<OliveOilAdvisorProps> = ({
  products,
  onAddToCart,
  onViewProduct
}) => {
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<string>('');
  const [flavorPreference, setFlavorPreference] = useState<string>('');
  const [preferredSize, setPreferredSize] = useState<string>('');

  const resetQuiz = () => {
    setStep(1);
    setPurpose('');
    setFlavorPreference('');
    setPreferredSize('');
  };

  // Determine recommendation based on answers
  const recommendedProduct: Product = React.useMemo(() => {
    const oils = products.filter((p) => p.category === 'oil');
    
    if (preferredSize === '5lt' || purpose === 'cooking') {
      return oils.find((p) => p.id.includes('teneke')) || oils[0];
    }
    if (flavorPreference === 'unfiltered' || purpose === 'gourmet') {
      return oils.find((p) => p.id.includes('filtresiz')) || oils[1];
    }
    // Default best match
    return oils.find((p) => p.id.includes('erken-hasat')) || oils[0];
  }, [products, purpose, flavorPreference, preferredSize]);

  return (
    <section id="advisor" className="py-20 bg-gradient-to-br from-amber-50/60 via-stone-50 to-lime-50/50 border-y border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-lime-700" />
            <span>5F Akıllı Yağ Danışmanı</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Damak Zevkinize En Uygun Zeytinyağını 30 Saniyede Keşfedin
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            Her hasat ve asit oranının karakteri farklıdır. Doğru kullanım için sizin sofranıza en çok yakışacak 5F lezzetini seçiyoruz.
          </p>
        </div>

        {/* Advisor Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 transition-all">
          
          {/* Progress Dots */}
          {step <= 3 && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-500">
                Adım {step} / 3
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === step
                        ? 'w-8 bg-lime-800'
                        : s < step
                        ? 'w-4 bg-lime-600'
                        : 'w-2 bg-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Purpose */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                1. Zeytinyağını öncelikli olarak nerede ve nasıl tüketeceksiniz?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'drinking',
                    title: 'Çiğ İçimlik & Kahvaltı',
                    desc: 'Sabahları 1 yemek kaşığı şifa niyetine içim, taze ekmek banmalık yüksek polifenollü.'
                  },
                  {
                    id: 'salads',
                    title: 'Salatalar, Mezeler & Soğuklar',
                    desc: 'Çiğ domates, roka, peynir ve mezelere meyvemsi taze çimen kokusu katacak lezzet.'
                  },
                  {
                    id: 'cooking',
                    title: 'Sıcak Yemekler & Fırın',
                    desc: 'Tüm zeytinyağlı tencere yemekleri, balık, sebze ve fırın tarifleri için hafiflik.'
                  },
                  {
                    id: 'gourmet',
                    title: 'Gurme & Tortulu Lezzetler',
                    desc: 'Filtre edilmemiş, koyu kıvamlı, zeytin meyvesinin taze partiküllerini hissettiren tat.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPurpose(opt.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      purpose === opt.id
                        ? 'border-lime-800 bg-lime-50/60 ring-2 ring-lime-800/20'
                        : 'border-stone-200 hover:border-lime-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="font-serif font-bold text-sm text-stone-900 block mb-1">
                      {opt.title}
                    </span>
                    <span className="text-xs text-stone-500 leading-relaxed block">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Flavor Preference */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                2. Damakta nasıl bir his ve acılık profili seversiniz?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'intense',
                    title: 'Yoğun & Boğaz Yakan',
                    tag: '0.2 Asit',
                    desc: 'Yeşil çağla badem ve enginar kokulu, dil arkasında ve genizde tatlı bir yakıcılık.'
                  },
                  {
                    id: 'balanced',
                    title: 'Dengeli & Meyvemsi',
                    tag: '0.3 - 0.5 Asit',
                    desc: 'Meyvemsi notalar belirgin ancak boğaz yakıcılığı daha yumuşak, ipeksi akış.'
                  },
                  {
                    id: 'unfiltered',
                    title: 'Tortulu & Taş Baskı',
                    tag: 'Filtresiz',
                    desc: 'Doğal klorofil yeşili, dinlenmiş ama süzülmemiş zengin köy değirmeni rayihası.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFlavorPreference(opt.id);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      flavorPreference === opt.id
                        ? 'border-lime-800 bg-lime-50/60 ring-2 ring-lime-800/20'
                        : 'border-stone-200 hover:border-lime-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {opt.title}
                      </span>
                      <span className="text-[10px] font-extrabold bg-lime-100 text-lime-900 px-2 py-0.5 rounded">
                        {opt.tag}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 leading-relaxed block">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  ← Önceki Adıma Dön
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preferred Size */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                3. Tüketim alışkanlığınıza göre hangi ambalajı tercih edersiniz?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: '500ml',
                    title: '500 ml Koyu Cam Şişe',
                    desc: 'Tek kişi veya çiftler için taze taze hızla bitirilen butik boy.'
                  },
                  {
                    id: '750ml',
                    title: '750 ml Cam Şişe',
                    desc: 'Sofranın baş köşesine yakışan ideal gurme sunum şişesi.'
                  },
                  {
                    id: '5lt',
                    title: '5 Litre Laklı Teneke',
                    desc: 'Geniş aileler ve bol zeytinyağı tüketenler için en ekonomik seçenek.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPreferredSize(opt.id);
                      setStep(4);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      preferredSize === opt.id
                        ? 'border-lime-800 bg-lime-50/60 ring-2 ring-lime-800/20'
                        : 'border-stone-200 hover:border-lime-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="font-serif font-bold text-sm text-stone-900 block mb-1">
                      {opt.title}
                    </span>
                    <span className="text-xs text-stone-500 leading-relaxed block">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  ← Önceki Adıma Dön
                </button>
              </div>
            </div>
          )}

          {/* RESULT STEP 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-lime-800 bg-lime-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Size Özel 5F Önerisi Belirlendi!
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                    {recommendedProduct.name}
                  </h3>
                </div>
                <button
                  onClick={resetQuiz}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Testi Baştan Çöz
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-4 aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                  <img
                    src={recommendedProduct.image}
                    alt={recommendedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="sm:col-span-8 space-y-3">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Seçtiğiniz tüketim tarzı ve damak zevkine göre en yüksek uyumu sağlayan ürünümüz budur. 
                    {recommendedProduct.tastingNotes && (
                      <span className="block mt-1 font-medium text-stone-800">
                        Belirgin tatlar: {recommendedProduct.tastingNotes.join(', ')}.
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {recommendedProduct.acidity && (
                      <span className="bg-lime-50 border border-lime-200 text-lime-900 px-2.5 py-1 rounded-md font-semibold">
                        {recommendedProduct.acidity}
                      </span>
                    )}
                    {recommendedProduct.polyphenol && (
                      <span className="bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-md font-semibold">
                        Polifenol: {recommendedProduct.polyphenol}
                      </span>
                    )}
                    <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md font-medium">
                      {recommendedProduct.volumeOrWeight}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <span className="font-serif text-2xl font-bold text-stone-900">
                      {recommendedProduct.price} TL
                    </span>
                    <button
                      onClick={() => onAddToCart(recommendedProduct, 1)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-lime-900 text-white font-semibold text-xs sm:text-sm hover:bg-lime-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-900/20 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Bu Yağı Sepete Ekle</span>
                    </button>
                    <button
                      onClick={() => onViewProduct(recommendedProduct)}
                      className="text-xs text-stone-600 hover:text-stone-900 underline"
                    >
                      Detayları Gör
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
