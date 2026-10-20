import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import styles from "./WholesaleContact.module.css";

export function WholesaleContact(): JSX.Element {
  return (
    <section id="toptan-iletisim" data-scene="wholesale" aria-labelledby="toptan-title" tabIndex={-1} className={styles.section}>
      {/* 093 candidates remain unapproved: use the prescribed olive field.
          081 form / 082 delivery are not implemented; do not simulate submission. */}
      <div data-reading-safe="" className={styles.card}>
        <h2 id="toptan-title" data-scene-reveal="">Toptan satış</h2>
        <address>Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye</address>
        <Button disabled aria-describedby="toptan-availability" className={styles.cta}>Toptan Satış İçin İletişime Geçin</Button>
        <p id="toptan-availability">Toptan talep formu henüz kullanıma açık değil.</p>
      </div>
    </section>
  );
}
