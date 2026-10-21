import type { JSX } from "react";
import { V3Picture } from "@/components/media/V3Picture";
import { WholesaleContact } from "./WholesaleContact";
import { v3Image } from "@/lib/media/v3-assets";
import styles from "./V3Foundation.module.css";

export function Facility(): JSX.Element {
  return <section id="tesisimiz" tabIndex={-1} aria-labelledby="tesisimiz-title" className={styles.facility}>
    <div className={styles.facilityLayout}>
      <div className={styles.facilityCopy}>
        <h2 id="tesisimiz-title">Osmaniye’de, kendi tesisimizde.</h2>
        <p>Ellek · Düziçi · 2021’den bu yana.</p>
        <p>Sofralık zeytin, salamura zeytin ve zeytinyağını perakende ve toptan alıcılarla buluşturuyoruz.</p>
      </div>
      <V3Picture image={v3Image("tesis-osmaniye")} sizes="(max-width: 767px) 100vw, 50vw" className={styles.facilityPhoto} />
    </div>
    <WholesaleContact />
  </section>;
}
