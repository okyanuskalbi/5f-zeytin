import type { JSX } from "react";
import { PantryFamily } from "./PantryFamily";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductFamily } from "@/types/catalog";
import styles from "./V3Foundation.module.css";

export function Pantry({ families }: { families: readonly ProductFamily[] }): JSX.Element {
  return <section id="kiler" data-nav-light="" aria-labelledby="kiler-title" className={styles.pantry}>
    <div id="urunler" className={styles.pantryHeading}>
      <h2 id="kiler-title">Kışlık kiler</h2>
      <p>Yıllık zeytin ve yağınızı tek seferde alın.</p>
    </div>
    {families.length ? <div className={styles.products}>
      {families.map(family => <PantryFamily key={family.id} family={family} images={family.variants.map(variant => v3Image(variant.imageKey))} />)}
    </div> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
  </section>;
}
