import type { JSX } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/types/catalog";
import styles from "./ProductShowcase.module.css";

export function ProductShowcase({ products }: { products: readonly Product[] }): JSX.Element {
  return <section id="urunler" data-scene="products" aria-labelledby="urunler-title"
    tabIndex={-1} className={styles.showcase}>
    <div data-showcase-copy="" className={styles.intro}>
      <h2 id="urunler-title" data-scene-reveal="">Ürünlerimiz</h2>
      <p data-scene-reveal="">Sofralık zeytin, salamura zeytin ve zeytinyağı; perakende ve toptan.</p>
    </div>
    {products.length === 0 ? <p role="status" className={styles.empty}>Görüntülenecek ürün bulunmuyor.</p> :
      <div role="region" aria-label="Ürün listesi" tabIndex={0} className={styles.scroller}>
        <ul className={styles.row}>
          {products.slice(0, 6).map((product) => <li key={product.id} className={styles.item}>
            <ProductCard product={product} />
          </li>)}
        </ul>
      </div>}
  </section>;
}
