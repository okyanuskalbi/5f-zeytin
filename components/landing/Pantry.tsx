import type { JSX } from "react";
import { PantryFamily } from "./PantryFamily";
import { v3Image } from "@/lib/media/v3-assets";
import { V3Picture } from "@/components/media/V3Picture";
import type { ProductFamily } from "@/types/catalog";
import styles from "@/components/catalog/Pantry.module.css";

export function Pantry({ families }: { families: readonly ProductFamily[] }): JSX.Element {
  return <section id="kiler" data-nav-light="" aria-labelledby="kiler-title" className={styles.pantry}>
    <div id="urunler" className={styles.pantryHeading}>
      <h2 id="kiler-title">Kışlık kiler</h2>
      <p>Yıllık zeytin ve yağınızı tek seferde alın.</p>
    </div>
    {families.length ? <div className={styles.products}>
      {families.map((family, index) => <PantryFamily key={family.id} index={index} family={family} images={family.variants.map(variant => v3Image(variant.imageKey))} galleries={family.variants.map(variant => variant.galleryKeys.map(v3Image))} />)}
      <div className={styles.parcel} data-pantry-parcel=""><V3Picture image={v3Image("kargo-kolisi")} sizes="(max-width: 767px) 70vw, 400px" /></div>
    </div> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
  </section>;
}
