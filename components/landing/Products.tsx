import type { JSX } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductVariant } from "@/types/catalog";
import styles from "./Products.module.css";

export function Products({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  // Approved image slots 01–06 preserve the D proof's display order;
  // the catalog remains the authority for IDs, prices and stock.
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  return <section id="urunler" aria-labelledby="urunler-title" className={styles.products}>
    <div id="kiler" className={styles.wrap}>
      <div className={styles.heading}>
        <h2 id="urunler-title">Sofranız için<br />{" "}altı ürün.</h2>
        <p>Az ama gerçek. Hepsi Ellek&apos;teki tesisimizde seçilir ve dolum yapılır. Kışlık stok için teneke, günlük sofra için kavanoz ve şişe.</p>
      </div>
      {ordered.length ? <div className={styles.grid}>
        {ordered.map((product, index) => {
          const scene = product.galleryKeys.find(key => key.endsWith("-sahne"));
          return <ProductCard key={product.id} product={product} index={index} image={v3Image(product.imageKey)} scene={scene ? v3Image(scene) : undefined} />;
        })}
      </div> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    </div>
  </section>;
}
