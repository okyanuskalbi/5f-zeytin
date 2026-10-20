import type { JSX } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroMotion } from "@/components/landing/HeroMotion";
import { ScrollFrameSequence } from "@/components/media/ScrollFrameSequence";
import styles from "./Hero.module.css";

// Adapted from the existing 21st Editorial Hero; Task 086 keeps the approved composition.
export function Hero(): JSX.Element {
  return (
    <section aria-labelledby="hero-title" className={`${styles.hero} bg-background`}>
      <ScrollFrameSequence
        src="/frames/hero-zeytin/manifest.json"
        poster={{
          src: "/images/hero/zeytinlik-2400.webp",
          srcSet: "/images/hero/zeytinlik-1200.webp 1200w, /images/hero/zeytinlik-2400.webp 2400w",
          width: 2400,
          height: 1350,
        }}
        scrollLength={300}
        positionX={1}
        mediaClassName={styles.media}
        label=""
      >
        <div aria-hidden="true" className={styles.readability} />
        <div className="page-wrap relative flex h-full items-end py-6 sm:py-10 lg:items-center lg:py-14">
          <div className="flex w-full max-w-md flex-col items-start gap-4 lg:max-w-[26rem] lg:gap-5">
            <div className="space-y-2">
              <h1 id="hero-title">Afina Zeytin</h1>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-foreground sm:text-base">
              Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.
            </p>
            <HeroMotion className="space-y-3 lg:space-y-5">
              <p className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Kökü toprakta. Yeri sofrada.
              </p>
              <p className="max-w-xs font-serif text-lg font-normal italic leading-relaxed text-foreground">
                Toprağın sunduğu lezzet, Afina’nın özeniyle.
              </p>
            </HeroMotion>
            <div className="flex w-full flex-col items-stretch gap-2 sm:items-start">
              <Button asChild size="lg">
                <a href="#urunler">Ürünlerimizi Keşfedin <ArrowDown aria-hidden="true" /></a>
              </Button>
              <Button asChild variant="link" className="justify-start px-0 text-left">
                <a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin <ArrowUpRight aria-hidden="true" /></a>
              </Button>
            </div>
          </div>
        </div>
      </ScrollFrameSequence>
    </section>
  );
}
