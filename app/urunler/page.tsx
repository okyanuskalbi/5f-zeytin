import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailProvider } from "@/components/catalog/ProductDetailProvider";
import { readProductFamilies } from "@/lib/catalog/read";
import { v3Image } from "@/lib/media/v3-assets";
import { siteIdentity } from "@/lib/site/identity";
import styles from "./page.module.css";

export const dynamic = "force-static";
export const revalidate = 300;

const title = "Ürünler | AFİNA ZEYTİN";
const description = "AFİNA ZEYTİN zeytin ve zeytinyağı ürünlerini inceleyin. Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/urunler" },
  robots: { index: false, follow: true },
  openGraph: { title, description, url: "/urunler", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { "@type": "ListItem", position: 2, name: "Ürünler", item: `${siteIdentity.origin}/urunler` },
  ],
};

export default async function Page(): Promise<JSX.Element> {
  const families = await readProductFamilies();
  const products = families.flatMap(family => family.variants).sort((a, b) => a.imageKey.localeCompare(b.imageKey));

  return <ProductDetailProvider products={products}>
    <main className={styles.root}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <div className={styles.container}>
        <nav aria-label="İçerik yolu" className={styles.breadcrumb}>
          <ol><li><Link href="/">Ana Sayfa</Link></li><li><span aria-hidden="true">/</span><span aria-current="page">Ürünler</span></li></ol>
        </nav>
        <header className={styles.heading}>
          <h1>Tüm ürünler</h1>
          <p>Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.</p>
        </header>
        <div className={styles.productGrid}>
          {products.map(product => <ProductCard key={product.id} product={product} image={v3Image(product.imageKey)} featured={false} staticPresentation
            imageSizes="(max-width: 359px) 90vw, (max-width: 1023px) 45vw, (max-width: 1304px) 30vw, 390px"
            quoteAction={<Link href={`/?teklif=${encodeURIComponent(product.id)}#toptan`} className={styles.quoteButton}
              aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}><ArrowRight size={18} aria-hidden="true" />Teklife ekle</Link>} />)}
        </div>
        {!products.length && <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
      </div>
    </main>
  </ProductDetailProvider>;
}
