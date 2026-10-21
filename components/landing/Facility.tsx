import type { JSX } from "react";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import styles from "./V3Foundation.module.css";

export function Facility(): JSX.Element {
  return <section id="tesisimiz" aria-labelledby="tesisimiz-title" className={styles.facility}>
    <div>
      <h2 id="tesisimiz-title">Osmaniye’de, kendi tesisimizde.</h2>
      <p>Ellek, Düziçi · 2021’den bu yana · Sofralık zeytin, salamura zeytin, zeytinyağı.</p>
      <p>Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor. Ürünün özüne duyduğu saygıyı yalın ve özenli bir sunumla birleştiriyor.</p>
    </div>
    <V3Picture image={v3Image("tesis-osmaniye")} sizes="(max-width: 767px) 100vw, 50vw" />
    <div id="toptan-iletisim" tabIndex={-1} className={styles.wholesale}>
      <h3>Toptan alım</h3>
      <p>Toptan zeytin ve zeytinyağı için bize yazın.</p>
      <p>İletişim bilgileri yakında burada paylaşılacak.</p>
    </div>
  </section>;
}
