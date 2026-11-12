"use client";

import { useSyncExternalStore, type JSX } from "react";
import { CatalogGridMotion } from "@/components/catalog/CatalogGridMotion";
import { ProductTile } from "@/components/storefront/ProductTile";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { sortProducts } from "@/lib/catalog/groups";
import type { ProductVariant } from "@/types/catalog";
import styles from "@/components/storefront/catalog/Catalog.module.css";

function subscribeSearch(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  return () => window.removeEventListener("popstate", notify);
}
const browserSearch = () => window.location.search;
const serverSearch = () => "";

/** Static first render; sorting changes only the visible cards and the shareable address. */
export function ProductListing({ products, category = false, routeKey = "/urunler" }: { products: readonly ProductVariant[]; category?: boolean; routeKey?: string }): JSX.Element {
  const query = useSyncExternalStore(subscribeSearch, browserSearch, serverSearch);
  const requested = new URLSearchParams(query).get("sirala");
  const order = requested === "fiyat-artan" || requested === "fiyat-azalan" ? requested : "onerilen";
  const sorted = sortProducts(products, order);
  return <>
    <div className={styles.listingTools}>
      <p aria-live="polite">{products.length} ürün</p>
      <label className={styles.sortLabel} htmlFor="catalog-sort">Sıralama
        <select id="catalog-sort" name="sirala" value={order} onChange={event => {
          const url = new URL(window.location.href);
          url.searchParams.set("sirala", event.target.value);
          window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}>
          <option value="onerilen">Önerilen</option><option value="fiyat-artan">Fiyat artan</option><option value="fiyat-azalan">Fiyat azalan</option>
        </select>
      </label>
    </div>
    <CatalogGridMotion routeKey={routeKey} className={styles.productGrid}>
      {sorted.map(product => <ProductTile key={product.id} product={product} imageSizes="(max-width: 1023px) 44vw, 320px" />)}
    </CatalogGridMotion>
    {!products.length && <div className={styles.emptyState}>
      <p role="status">{category ? "Bu grupta şu an ürün bulunmuyor." : "Görüntülenecek ürün bulunmuyor."}</p>
      {category && <PillButton variant="outline" href="/urunler">Tüm Ürünler</PillButton>}
    </div>}
  </>;
}
