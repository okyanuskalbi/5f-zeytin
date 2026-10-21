import type { JSX } from "react";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import styles from "./V3Foundation.module.css";

/** Task 112 owns the measured hero composition and motion. */
export function Hero(): JSX.Element {
  return <section data-hero-intro="" aria-labelledby="hero-title" className={styles.hero}>
    <V3Picture image={v3Image("hero-masaustu")} mobile={v3Image("hero-mobil")} sizes="100vw" className={styles.heroImage} eager decorative />
    <div className={styles.heroCopy}>
      <h1 id="hero-title">Düziçi’nden<br /> sofranıza.</h1>
      <p>Doğal Kırma Yeşil Zeytin, kendi tesisimizde.</p>
      <a href="#kiler" className={styles.heroLink}>Ürünleri gör</a>
    </div>
  </section>;
}
