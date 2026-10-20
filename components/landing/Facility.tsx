import type { JSX } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// Adapted from 21st About 3 (shadcnblockscom, demo 2202): paired media and
// editorial content, using AFİNA tokens and the official section 04 copy.
// Until approved media arrives, official copy completes the section without a box.
export function Facility(): JSX.Element {
  return (
    <section
      id="tesisimiz"
      aria-labelledby="tesisimiz-title"
      tabIndex={-1}
      className="mt-12 scroll-mt-36 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:mt-16"
    >
      <div className="page-grid items-start">
        <div className="col-span-12 lg:col-span-4">
          <h3 id="tesisimiz-title" className="text-2xl sm:text-3xl">Tesisimiz</h3>
          <p className="mt-4 text-base">Osmaniye üretim tesisi</p>
        </div>
        <div className="col-span-12 min-w-0 lg:col-span-7 lg:col-start-6">
          <div data-facility-story="" className="space-y-5 text-base leading-relaxed text-body-ink">
            <p>
              Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır. Afina Zeytin, bu köklü lezzeti doğallığına saygı duyan bir anlayışla sunuyor. Markanın odağında, zeytinin kendine özgü tadını ve sofralarımızdaki yerini korumak var.
            </p>
            <p>
              Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor. Ürünün özüne duyduğu saygıyı yalın ve özenli bir sunumla birleştiriyor.
            </p>
          </div>

          <ul aria-label="Faaliyet alanlarımız" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 pt-5 text-sm font-medium text-foreground">
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
