import type { JSX } from "react";
import Link from "next/link";
import { V3Picture } from "@/components/media/V3Picture";
import { AddToCart } from "@/components/catalog/AddToCart";
import { productHref } from "@/lib/catalog/product-pages";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductVariant } from "@/types/catalog";
import styles from "./ProductTile.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });

/** Image/content separation adapted from 21st.dev Product Card, demo 28200. */
export function ProductTile({ product, priority = false }: { product: ProductVariant; priority?: boolean }): JSX.Element {
  return <article className={styles.tile} data-product-id={product.id} data-category={product.category} data-size={product.weight}>
    <Link href={productHref(product)} className={styles.image} aria-label={`${product.name}, ${product.weight} detayını aç`}>
      <V3Picture image={v3Image(product.imageKey)} sizes="(max-width: 639px) 260px, (max-width: 1023px) 42vw, 300px" eager={priority} />
    </Link>
    <div className={styles.content}>
      <h3><Link href={productHref(product)}>{product.name}</Link></h3>
      <div className={styles.meta}><span>{product.weight}</span><p aria-label="Fiyat">{money.format(product.priceKurus / 100)}</p></div>
      <p className={styles.stock}>{product.stock > 0 ? "Stokta mevcut" : "Mevcut değil"}</p>
      <div className={styles.buy}><AddToCart product={product} /></div>
      <Link className={styles.quote} href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`}>Teklife ekle</Link>
    </div>
  </article>;
}
