import type { JSX, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import styles from "./WholesaleContact.module.css";

export function WholesaleContact({ children }: { children?: ReactNode }): JSX.Element {
  return (
    <section id="toptan-iletisim" data-scene="wholesale" aria-labelledby="toptan-title" tabIndex={-1} className={styles.section}>
      {/* 093 candidates remain unapproved: use the prescribed olive field. */}
      <div data-reading-safe="" data-scene-reveal="" data-wholesale-scope="" className={styles.scope}>
        <h2 id="toptan-title" className={styles.statement}>Toptan satış</h2>
        <p>Sofralık zeytin · Salamura zeytin · Zeytinyağı</p>
        <p>Perakende + toptan</p>
      </div>
      <div data-reading-safe="" data-wholesale-card="" className={styles.card}>
        <address>Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye</address>
        <Button asChild className={styles.cta}><a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin</a></Button>
      </div>
      {children}
    </section>
  );
}
