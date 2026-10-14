import React from 'react';
import { PHILOSOPHY_ITEMS } from '../data/products';
import { Sprout, ShieldAlert, HeartPulse, Wind, Scale } from 'lucide-react';

const ICONS = [Sprout, Scale, HeartPulse, Wind, ShieldAlert];

export const Philosophy5F: React.FC = () => {
  return (
    <section id="philosophy" className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-lime-900/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-900/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-lime-400">
            Neden "5F Zeytin"?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            5F Felsefesi: Topraktan Şişeye 5 Temel İlkemiz
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Biz yalnızca zeytin sıkmıyoruz; toprağın asaletini, sağlığı ve geleneksel dürüstlüğü her bir damlaya işliyoruz.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {PHILOSOPHY_ITEMS.map((item, index) => {
            const Icon = ICONS[index] || Sprout;
            return (
              <div 
                key={item.title}
                className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 hover:border-lime-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-lime-950/80 border border-lime-500/30 text-lime-300 flex items-center justify-center font-serif font-black text-xl group-hover:scale-110 transition-transform">
                      {item.letter}
                    </span>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-stone-700/60 text-stone-300">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-lime-400" />
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-lime-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-700/50 flex items-center justify-between text-[11px] text-stone-400">
                  <span>5F Standardı</span>
                  <span className="text-lime-400 font-medium">Doğrulandı ✓</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner callout */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-lime-950 to-stone-900 border border-lime-900/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
              Her Şişenin Arkasında Bağımsız Laboratuvar Analiz Raporu
            </h4>
            <p className="text-xs sm:text-sm text-stone-300">
              Serbest yağ asitliği, peroksit ve polifenol değerlerimizi her hasat partisinde akredite laboratuvarlarda test ettiriyoruz.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-lime-500/20 text-lime-300 text-xs font-bold border border-lime-500/40">
              Akredite Analizli
            </span>
            <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              İyi Tarım Sertifikalı
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
