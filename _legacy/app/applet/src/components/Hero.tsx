import React from 'react';
import { ArrowRight, ShieldCheck, Droplet, Sun, Package } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onReadStory: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onReadStory }) => {
  return (
    <section className="relative pt-6 pb-16 lg:pt-10 lg:pb-24 border-b border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Unboxed Metadata Kicker (Anti-slop zero pill) */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#6B7560] tracking-wide mb-4">
              <span>Kaz Dağları & Edremit Körfezi</span>
              <span aria-hidden="true">·</span>
              <span>2026/2027 Erken Hasadı</span>
              <span aria-hidden="true">·</span>
              <span>Maks %0.2 Asit</span>
            </div>

            <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#222B18] leading-[1.12] mb-6 text-balance">
              Kadim zeytin ağaçlarından sofranıza saf bereket.
            </h1>

            <p className="text-base sm:text-lg text-[#525A49] leading-relaxed mb-8 max-w-xl">
              5F Zeytin, Kuzey Ege’nin asırlık bahçelerinden el ile toplanan yeşil zeytinleri, 
              hasadın ilk 4 saatinde 24°C altında soğuk sıkarak şişeler. Katkısız, filtrelenmemiş ve yüksek polifenollü.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-[#3B4A2C] text-[#FAF8F5] rounded-lg font-medium hover:bg-[#2B371F] transition-all flex items-center gap-2.5 shadow-sm active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                <span>Ürünleri İncele</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onReadStory}
                className="px-6 py-3.5 border border-[#C5BCAB] text-[#333C29] rounded-lg font-medium hover:bg-[#F3EFE8] transition-colors cursor-pointer whitespace-nowrap"
              >
                Hasat Hikayemiz
              </button>
            </div>

            {/* Micro Trust Stats */}
            <div className="mt-10 pt-8 border-t border-[#E8E2D7] grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold text-[#2D3820] font-mono tabular-nums">%0.2</p>
                <p className="text-xs text-[#6B7560] mt-0.5">Asitlik Değeri</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2D3820] font-mono tabular-nums">420+</p>
                <p className="text-xs text-[#6B7560] mt-0.5">Polifenol (mg/kg)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2D3820] font-mono tabular-nums">24°C</p>
                <p className="text-xs text-[#6B7560] mt-0.5">Soğuk Sıkım Limiti</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden bg-[#ECE6DC] border border-[#DDD5C7] shadow-sm aspect-[16/10] lg:aspect-[4/3]">
              <img
                src="/src/assets/images/hero_olive_grove_harvest_1791969420210.jpg"
                alt="5F Zeytin asırlık zeytinliklerinde geleneksel hasat"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs font-medium tracking-wide uppercase text-white/80">Hasat Günlüğü</p>
                <p className="font-serif-heading text-lg font-semibold text-white">
                  Edremit Körfezi & Asırlık Zeytin Ağaçları
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Feature Strip */}
        <div className="mt-16 pt-10 border-t border-[#E8E2D7] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-[#ECE6DC] text-[#3B4A2C] rounded-lg shrink-0">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#242A1B]">Gerçek Soğuk Sıkım</h3>
              <p className="text-xs text-[#636C57] mt-1 leading-relaxed">
                27°C'yi aşmayan sıcaklıkta, besin ve antioksidan değerleri kaybolmadan sıkım.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-[#ECE6DC] text-[#3B4A2C] rounded-lg shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#242A1B]">Katkısız Doğal Fermantasyon</h3>
              <p className="text-xs text-[#636C57] mt-1 leading-relaxed">
                Sofralık zeytinlerimizde kimyasal karartıcı veya hızlandırıcı kullanılmaz.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-[#ECE6DC] text-[#3B4A2C] rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#242A1B]">Laboratuvar Onaylı</h3>
              <p className="text-xs text-[#636C57] mt-1 leading-relaxed">
                Her hasat partisi bağımsız akredite laboratuvarlarda asitlik ve saflık testinden geçer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-[#ECE6DC] text-[#3B4A2C] rounded-lg shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#242A1B]">Korumalı Güvenli Kargo</h3>
              <p className="text-xs text-[#636C57] mt-1 leading-relaxed">
                Özel darbe emici hava kanallı ambalajlarda kırılma garantili adrese teslim.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
