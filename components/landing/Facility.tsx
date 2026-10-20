import type { JSX } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FacilityMotion } from "@/components/landing/FacilityMotion";
import { OsmaniyeMap } from "@/components/landing/OsmaniyeMap";
import styles from "./Facility.module.css";

const facts = [
  ["Konum", "Ellek, Düziçi / Osmaniye"],
  ["Ürünler", "Sofralık zeytin, salamura zeytin, zeytinyağı"],
  ["Satış", "Perakende + toptan"],
  ["Faaliyet", "2021’den bu yana"],
] as const;

export function Facility(): JSX.Element {
  return (
    <section id="tesisimiz" aria-labelledby="tesisimiz-title" tabIndex={-1} className={styles.facility}>
      <FacilityMotion>
        <h2 id="tesisimiz-title" data-facility-enter="" className={styles.title}>Tesisimiz</h2>
        <p data-facility-lead="" data-facility-enter="" className={styles.lead}>Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor. Ürünün özüne duyduğu saygıyı yalın ve özenli bir sunumla birleştiriyor.</p>
        <div className={styles.tiles}>
          {/* Task 093: official copy completes the tile until the user approves
              the locally redacted candidates. No empty media box. */}
          <div data-facility-enter="" data-facility-typography="" data-facility-safe="" className={styles.editorial}>
            <p className={styles.statement}>Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.</p>
            <p className={styles.story}>Afina Zeytin, bu köklü lezzeti doğallığına saygı duyan bir anlayışla sunuyor. Markanın odağında, zeytinin kendine özgü tadını ve sofralarımızdaki yerini korumak var.</p>
            <p data-facility-definition="" className={styles.definition}>Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin ve zeytinyağını doğallığına önem veren bir anlayışla sunuyor; ürünlerini toptan ve perakende kanallarda müşterileriyle buluşturuyor.</p>
            <div className={styles.actions}>
              <Button asChild><a href="#urunler">Ürünlerimizi Keşfedin <ArrowDown aria-hidden="true" /></a></Button>
              <Button asChild variant="link" className={styles.wholesale}><a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin <ArrowUpRight aria-hidden="true" /></a></Button>
            </div>
          </div>
          <div data-facility-safe="" className={styles.region}>
            <div data-facility-enter="" className={styles.mapTile}>
              <OsmaniyeMap className={styles.map} />
              <p className={styles.mapLabel}>Osmaniye <span>Düziçi</span></p>
            </div>
            <dl data-facility-enter="" className={styles.facts}>
              {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            <a className={styles.credit} href="/maps/osmaniye-license.txt">Harita: geoBoundaries / © OpenStreetMap</a>
          </div>
        </div>
      </FacilityMotion>
    </section>
  );
}
