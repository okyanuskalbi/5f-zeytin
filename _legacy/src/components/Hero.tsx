import React from 'react';
import { ArrowRight, Droplets, ShieldCheck, Sparkles, Sun, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreProducts: () => void;
  onOpenAdvisor: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProducts, onOpenAdvisor }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-[#faf8f5] to-stone-50 border-b border-stone-200">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-lime-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100 border border-lime-200 text-lime-900 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-lime-700" />
              <span>2025/2026 Sezonu • Erken Hasat Soğuk Sıkım</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.15] tracking-tight">
              Dalından Sofranıza <br />
              <span className="text-lime-900 italic font-serif">Saf Ege Mucizesi:</span> <br />
              5F Zeytin
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              Kaz Dağları ve Edremit Körfezi’nin asırlık zeytinliklerinden elle toplanan, 
              maksimum <strong className="text-stone-900 font-semibold">24°C</strong> soğuk sıkımla polifenolü ve taze çimen aroması korunan 
              doğal natürel sızma zeytinyağları ve geleneksel taş havuz zeytinleri.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-stone-700">
              <div className="flex items-center gap-2 bg-white/80 border border-stone-200/80 rounded-lg p-2.5 shadow-xs">
                <Droplets className="w-4 h-4 text-lime-700 shrink-0" />
                <span>0.2 - 0.4 Dizyem Asit</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 border border-stone-200/80 rounded-lg p-2.5 shadow-xs">
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                <span>4 Saatte Soğuk Sıkım</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 border border-stone-200/80 rounded-lg p-2.5 shadow-xs col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-lime-700 shrink-0" />
                <span>%100 Katkısız & İlaçsız</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onExploreProducts}
                className="px-7 py-4 rounded-xl bg-lime-900 text-white font-semibold text-sm hover:bg-lime-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-900/20 active:scale-[0.98]"
              >
                <span>Ürünlerimizi İnceleyin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onOpenAdvisor}
                className="px-6 py-4 rounded-xl bg-amber-500/15 border border-amber-300 text-stone-900 font-semibold text-sm hover:bg-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Sana Uygun Yağı Seç (Test)</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 pt-4 text-xs text-stone-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-lime-800 text-white flex items-center justify-center font-bold border-2 border-white text-xs">5F</div>
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold border-2 border-white text-xs">TR</div>
                <div className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold border-2 border-white text-xs">EGE</div>
              </div>
              <p>
                <strong className="text-stone-800 font-semibold">10.000+ sofraya</strong> ulaştırılan taze lezzet ve %99 müşteri memnuniyeti.
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-200 aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=85"
                  alt="5F Zeytinyağı Şişesi ve Zeytinler"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />
                
                {/* Floating badge top right */}
                <div className="absolute top-4 right-4 bg-lime-950/90 backdrop-blur-md text-lime-200 border border-lime-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                  <span>Laboratuvar Onaylı</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-5 left-5 right-5 text-white p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-lime-300 font-semibold">
                      Erken Hasat Butik Seri
                    </span>
                    <span className="text-xs bg-amber-500 text-stone-900 font-bold px-2 py-0.5 rounded">
                      0.2 Asit
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold">5F Erken Hasat Soğuk Sıkım</h3>
                  <p className="text-xs text-stone-300">
                    Ekim hasadı • Oksijensiz 24°C sıkım • 480 mg/kg Polifenol
                  </p>
                </div>
              </div>

              {/* Floating Stat Card Left */}
              <div className="absolute -left-6 top-1/4 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl p-4 shadow-xl hidden sm:block max-w-[200px] animate-fade-in">
                <p className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Polifenol Gücü</p>
                <p className="text-2xl font-serif font-black text-lime-900">480+ mg</p>
                <p className="text-[10px] text-stone-600 mt-0.5">Yüksek antioksidan ve E vitamini kaynağı</p>
              </div>

              {/* Floating Stat Card Right */}
              <div className="absolute -right-6 bottom-16 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl p-4 shadow-xl hidden sm:block max-w-[190px]">
                <p className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Doğallık Garantisi</p>
                <p className="text-xl font-bold text-amber-700">%100 Saf</p>
                <p className="text-[10px] text-stone-600 mt-0.5">Kostiksiz, renklendiricisiz geleneksel üretim</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
