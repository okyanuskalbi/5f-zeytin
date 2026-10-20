import type { JSX, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import styles from "./WholesaleContact.module.css";

export function WholesaleContact({ children }: { children?: ReactNode }): JSX.Element {
  return (
    <section id="toptan-iletisim" data-scene="wholesale" data-surface="dark" aria-labelledby="toptan-title" tabIndex={-1} className={styles.section}>
      <div data-reading-safe="" data-scene-reveal="" data-wholesale-scope="" className={styles.scope}>
        <h2 id="toptan-title" className={styles.statement}>Toptan satış</h2>
        <p>Sofralık zeytin · Salamura zeytin · Zeytinyağı</p>
        <p>Perakende + toptan</p>
        <address className={styles.address}>Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye</address>
        <Button asChild variant="link" className={styles.cta}><a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin</a></Button>
      </div>
      {children}
    </section>
  );
}
