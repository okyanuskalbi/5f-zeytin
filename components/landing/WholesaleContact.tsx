import type { JSX, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import styles from "./WholesaleContact.module.css";

export function WholesaleContact({ children }: { children?: ReactNode }): JSX.Element {
  return (
    <section id="toptan-iletisim" data-scene="wholesale" aria-labelledby="toptan-title" tabIndex={-1} className={styles.section}>
      {/* 093 candidates remain unapproved: use the prescribed olive field. */}
      <div data-reading-safe="" className={styles.card}>
        <h2 id="toptan-title" data-scene-reveal="">Toptan satış</h2>
        <address>Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye</address>
        <Button asChild className={styles.cta}><a href="#toptan-iletisim">Toptan Satış İçin İletişime Geçin</a></Button>
      </div>
      {children}
    </section>
  );
}
