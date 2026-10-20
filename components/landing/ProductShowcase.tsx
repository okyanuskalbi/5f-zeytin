import type { JSX } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/types/catalog";
import styles from "./ProductShowcase.module.css";

// Adapted from 21st shugar/Scroller (3927): an overflowing horizontal flex
// track. Native scrolling keeps touch, keyboard and no-JS browsing available;
// AFİNA's paper slips replace its sample boxes and edge fades.
export function ProductShowcase({ products }: { products: readonly Product[] }): JSX.Element {
  return <section id="urunler" data-scene="products" aria-labelledby="urunler-title"
    tabIndex={-1} className={styles.showcase}>
    <Image src="/images/hero/zeytinlik-2400.webp" alt="" fill sizes="100vw"
      className={styles.poster} />
    <div data-scene-reveal="" data-showcase-copy="" className={styles.intro}>
      <h2 id="urunler-title">Ürünlerimiz</h2>
      <p>Sofralık zeytin, salamura zeytin ve zeytinyağı; perakende ve toptan.</p>
    </div>
    {products.length === 0 ? <p role="status" className={styles.empty}>Görüntülenecek ürün bulunmuyor.</p> :
      <div role="region" aria-label="Ürün fişleri" tabIndex={0} className={styles.scroller}>
        <ul className={styles.row}>
          {products.slice(0, 6).map((product) => <li key={product.id} className={styles.item}>
            <ProductCard product={product} appearance="slip" />
          </li>)}
        </ul>
      </div>}
  </section>;
}
