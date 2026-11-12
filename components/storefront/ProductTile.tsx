import type { JSX } from "react";
import Link from "next/link";
import { V3Picture } from "@/components/media/V3Picture";
import { AddToCart } from "@/components/catalog/AddToCart";
import { productHref } from "@/lib/catalog/product-pages";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductVariant } from "@/types/catalog";
import { PillButton } from "./ui/PillButton";
import { Tag } from "./ui/Tag";
import styles from "./ProductTile.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });

/** Sage stage + paper card; square contain image and full-width action after 21st.dev Product Listing Card (#28227). */
export function ProductTile({ product, priority = false, imageSizes }: { product: ProductVariant; priority?: boolean; imageSizes?: string }): JSX.Element {
  const inStock = product.stock > 0;
  return <article className={styles.tile} data-product-id={product.id} data-category={product.category} data-size={product.weight}>
    <div className={styles.stage} data-tile-stage>
      <Link prefetch={false} href={productHref(product)} className={styles.image} aria-label={`${product.name}, ${product.weight} detayını aç`}>
        <V3Picture image={v3Image(product.imageKey)} sizes={imageSizes ?? "(max-width: 479px) 150px, 240px"} eager={priority} />
      </Link>
      <span className={styles.size} data-overlay-ok><Tag tone="sage">{product.weight}</Tag></span>
    </div>
    <div className={styles.content} data-tile-content>
      <h3><Link prefetch={false} href={productHref(product)}>{product.name}</Link></h3>
      <div className={styles.meta}>
        <p aria-label="Fiyat" className={styles.price}>{money.format(product.priceKurus / 100)}</p>
        <p className={styles.stock} data-in-stock={inStock}>{inStock ? "Stokta mevcut" : "Mevcut değil"}</p>
      </div>
      <div className={styles.buy}><AddToCart product={product} /></div>
      <div className={styles.quote}><PillButton variant="quiet" href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`}>Teklife ekle</PillButton></div>
    </div>
  </article>;
}
