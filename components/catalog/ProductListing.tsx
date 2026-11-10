import Link from "next/link";
import type { JSX } from "react";
import { ArrowRight } from "lucide-react";
import { CatalogGridMotion } from "./CatalogGridMotion";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailProvider } from "@/components/catalog/ProductDetailProvider";
import { v3Image } from "@/lib/media/v3-assets";
import type { ProductVariant } from "@/types/catalog";
import styles from "@/app/urunler/page.module.css";

/** Full catalogue and category pages share the same cards, detail and quote contracts. */
export function ProductListing({ products, category = false, routeKey = "/urunler" }: { products: readonly ProductVariant[]; category?: boolean; routeKey?: string }): JSX.Element {
  return <ProductDetailProvider products={products}>
    <CatalogGridMotion routeKey={routeKey} className={styles.productGrid}>
      {products.map(product => <ProductCard key={product.id} product={product} image={v3Image(product.imageKey)} featured={false} staticPresentation
        imageSizes="(max-width: 359px) 90vw, (max-width: 1023px) 45vw, (max-width: 1304px) 30vw, 390px"
        quoteAction={<Link href={`/?teklif=${encodeURIComponent(product.id)}#toptan`} className={styles.quoteButton}
          aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}><ArrowRight size={18} aria-hidden="true" />Teklife ekle</Link>} />)}
    </CatalogGridMotion>
    {!products.length && <>
      <p role="status">{category ? "Bu grupta şu an ürün bulunmuyor." : "Görüntülenecek ürün bulunmuyor."}</p>
      {category && <Link href="/urunler">Tüm ürünler</Link>}
    </>}
  </ProductDetailProvider>;
}
