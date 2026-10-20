import type { JSX } from "react";
import { ArrowDown, ArrowUpRight, Factory } from "lucide-react";

import { Button } from "@/components/ui/button";

// Adapted from 21st About 3 (shadcnblockscom, demo 2202): paired media and
// editorial content, using AFİNA tokens and the official section 04 copy.
// Facility media remains a static placeholder until the Task 034 handoff.
export function Facility(): JSX.Element {
  return (
    <section
      id="tesisimiz"
      aria-labelledby="tesisimiz-title"
      tabIndex={-1}
      className="mt-12 scroll-mt-36 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:mt-16"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
        <figure className="min-w-0 border border-border bg-card">
          <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-muted px-6 text-center">
            <Factory aria-hidden="true" className="size-12 text-gold-ink" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">Tesis görseli yakında.</p>
          </div>
          <figcaption className="border-t border-border px-5 py-4 text-sm font-medium text-foreground">
            Osmaniye üretim tesisi
          </figcaption>
        </figure>

        <div className="min-w-0">
          <p className="mb-3 text-xs font-medium tracking-widest text-gold-ink">OSMANİYE / ÜRETİM TESİSİ</p>
          <h3 id="tesisimiz-title" className="text-2xl sm:text-3xl">Tesisimiz</h3>
          <div data-facility-story="" className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır. Afina Zeytin, bu köklü lezzeti doğallığına saygı duyan bir anlayışla sunuyor. Markanın odağında, zeytinin kendine özgü tadını ve sofralarımızdaki yerini korumak var.
            </p>
            <p>
              Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor. Ürünün özüne duyduğu saygıyı yalın ve özenli bir sunumla birleştiriyor.
            </p>
          </div>

          <ul aria-label="Faaliyet alanlarımız" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-sm font-medium text-gold-ink">
            <li>Sofralık zeytin</li>
            <li>Salamura zeytin</li>
            <li>Zeytinyağı</li>
            <li>Toptan satış</li>
            <li>Perakende satış</li>
          </ul>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
            <Button asChild>
              <a href="#urunler">Ürünlerimizi Keşfedin <ArrowDown aria-hidden="true" /></a>
            </Button>
            <Button asChild variant="link" className="justify-start px-0 text-left">
              <a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin <ArrowUpRight aria-hidden="true" /></a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
