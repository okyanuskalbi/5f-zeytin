import React, { useState } from 'react';
import { StoryScene, Product, ProductVariant } from '../types';
import { ScrollProductCard } from './ScrollProductCard';
import { ThreeOliveBottleViewer } from './ThreeOliveBottleViewer';
import { ArrowRight, ChevronDown, Sparkles, Compass, Eye, ShieldCheck } from 'lucide-react';

interface CinematicScrollExperienceProps {
  scenes: StoryScene[];
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onInspectProduct: (product: Product) => void;
  onSkipToCatalog: () => void;
}

export const CinematicScrollExperience: React.FC<CinematicScrollExperienceProps> = ({
  scenes,
  products,
  onAddToCart,
  onInspectProduct,
  onSkipToCatalog
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const activeScene = scenes[activeSceneIndex] || scenes[0];

  // Resolve linked product from catalog
  const linkedProduct = products.find((p) => p.id === activeScene.linkedProductId) || products[0];

  return (
    <section className="relative w-full bg-[#1C1C1C] text-[#F5F1E7] overflow-hidden">
      {/* Top Scene Controller Navigation Bar */}
      <div className="sticky top-20 z-30 bg-[#1C1C1C]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Slogan */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4B483] shrink-0" />
            <span className="font-serif italic text-xs sm:text-sm text-[#D4B483]">
              “Köklerinden aldığı güçle büyüyor.”
            </span>
          </div>

          {/* Scene Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {scenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4B483] text-[#1C1C1C] shadow-md font-bold'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{scene.sceneCode} • {scene.title.split('—')[1] || scene.title}</span>
                </button>
              );
            })}
          </div>

          {/* Fast Skip Link */}
          <button
            onClick={onSkipToCatalog}
            className="hidden lg:flex items-center gap-1.5 text-xs text-[#D4B483] hover:text-white transition-colors underline font-semibold shrink-0 cursor-pointer"
          >
            <span>Hikâyeyi Geç / Ürünlere Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Viewport Stage */}
      <div className="relative min-h-[82vh] lg:min-h-[88vh] flex items-center justify-center">
        
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeScene.desktopMedia}
            alt={activeScene.title}
            className="w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-65"
          />
          {/* Subtle gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C]/90 via-[#1C1C1C]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Scene Narrative */}
            <div className="lg:col-span-6 space-y-5 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#243A29]/90 border border-[#D4B483]/40 text-[#D4B483] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D4B483]" />
                <span>AFİNA Sinematik Sahne {activeScene.sceneCode}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                {activeScene.title}
              </h2>

              <p className="text-[#D4B483] font-serif text-lg sm:text-xl italic">
                {activeScene.subtitle}
              </p>

              {activeScene.quote && (
                <blockquote className="border-l-2 border-[#D4B483] pl-4 py-1 text-sm text-stone-300 italic">
                  {activeScene.quote}
                </blockquote>
              )}

              <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
                {activeScene.description}
              </p>

              {/* Navigation hint */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveSceneIndex((prev) => (prev + 1) % scenes.length)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F1E7] border border-white/20 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Sonraki Sahneye Geç</span>
                  <ArrowRight className="w-4 h-4 text-[#D4B483]" />
                </button>
                <button
                  onClick={onSkipToCatalog}
                  className="text-xs text-[#D4B483] hover:underline"
                >
                  Tüm Kataloğu İncele
                </button>
              </div>
            </div>

            {/* Right: Interactive 3D Tone Mapped Bottle (on Scene 01 and 05) OR Product Card */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-end justify-center">
              
              {activeScene.sceneCode === '05' || activeScene.sceneCode === '01' ? (
                /* Hybrid 3D Tone Mapped Bottle with Overlay Card */
                <div className="w-full max-w-md space-y-4">
                  <div className="h-96 w-full">
                    <ThreeOliveBottleViewer
                      config={activeScene.toneMapping}
                      interactiveControls={true}
                    />
                  </div>
                  <ScrollProductCard
                    product={linkedProduct}
                    selectedVariantId={activeScene.linkedVariantId}
                    onAddToCart={onAddToCart}
                    onInspect={onInspectProduct}
                    className="mx-auto"
                  />
                </div>
              ) : (
                /* Standard Scene Product Card */
                <div className="w-full max-w-md">
                  <ScrollProductCard
                    product={linkedProduct}
                    selectedVariantId={activeScene.linkedVariantId}
                    onAddToCart={onAddToCart}
                    onInspect={onInspectProduct}
                    className="mx-auto"
                  />
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Bottom subtle scene indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSceneIndex(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === activeSceneIndex ? 'w-8 bg-[#D4B483]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Sahne ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
