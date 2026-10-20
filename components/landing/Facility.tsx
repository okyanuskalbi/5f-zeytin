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
    <section id="tesisimiz" aria-label="Tesisimiz" tabIndex={-1} className={styles.facility}>
      <FacilityMotion>
        <div className={styles.tiles}>
          <div data-facility-enter="" data-facility-typography="" data-facility-safe="" className={styles.editorial}>
            <h2 id="tesisimiz-title" className={styles.title}><span>Osmaniye’de,</span> <span>kendi tesisimizde.</span></h2>
            <p data-facility-lead="" className={styles.lead}>Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor. Ürünün özüne duyduğu saygıyı yalın ve özenli bir sunumla birleştiriyor.</p>
            <dl className={styles.facts}>
              {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            <div className={styles.actions}>
              <Button asChild><a href="#urunler">Ürünlerimizi Keşfedin <ArrowDown aria-hidden="true" /></a></Button>
              <Button asChild variant="link" className={styles.wholesale}><a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin <ArrowUpRight aria-hidden="true" /></a></Button>
            </div>
          </div>
          <div data-facility-safe="" className={styles.region}>
            {/* No facility photo is user-approved in docs/gorsel-onay.md.
                Keep the real province boundary and town marker as the fallback. */}
            <div data-facility-enter="" className={styles.mapTile}>
              <OsmaniyeMap className={styles.map} />
              <p className={styles.mapLabel}>Osmaniye <span>Düziçi</span></p>
            </div>
            <a className={styles.credit} href="/maps/osmaniye-license.txt">Harita: geoBoundaries / © OpenStreetMap</a>
          </div>
        </div>
      </FacilityMotion>
    </section>
  );
}
