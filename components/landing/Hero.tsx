import type { JSX } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroMotion } from "@/components/landing/HeroMotion";

// Adapted from 21st Editorial Hero (felipemenezes098/hero-05).
// Content stays server-rendered; scene media needs approval.
export function Hero(): JSX.Element {
  return (
    <section aria-labelledby="hero-title" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col items-start gap-5 lg:col-span-4 lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-widest text-gold-ink">
                OSMANİYE / ÜRETİM TESİSİ
              </p>
              <h1 id="hero-title" className="text-3xl sm:text-4xl">Afina Zeytin</h1>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.
            </p>
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-6 lg:col-start-7">
            <HeroMotion className="space-y-6">
              <p className="max-w-xl font-serif text-4xl leading-[1.15] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Kökü toprakta. Yeri sofrada.
              </p>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                Toprağın sunduğu lezzet, Afina’nın özeniyle.
              </p>
            </HeroMotion>
            <div className="flex flex-col items-stretch gap-3 sm:items-start">
              <Button asChild size="lg">
                <a href="#urunler">
                  Ürünlerimizi Keşfedin <ArrowDown aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="link" className="px-0 text-left sm:justify-start">
                <a href="#toptan-iletisim">
                  Toptan Satış İçin İletişime Geçin <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <HeroMotion effect="parallax" className="mt-10 sm:mt-14">
          <figure
            aria-label="Hero görseli"
            className="flex min-h-48 flex-col justify-between gap-8 border border-border bg-muted p-6 sm:min-h-64 sm:p-8 lg:min-h-80"
          >
            <span aria-hidden="true" className="h-px w-12 bg-gold-ink" />
            <figcaption className="space-y-2">
              <p className="text-xs font-medium tracking-widest text-gold-ink">HERO GÖRSELİ</p>
              <p className="text-sm text-muted-foreground">Onaylı sahne görseli bekleniyor.</p>
            </figcaption>
          </figure>
        </HeroMotion>
      </div>
    </section>
  );
}
