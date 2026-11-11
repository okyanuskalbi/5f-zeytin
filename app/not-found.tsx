import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/storefront/content/Content.module.css";

export const metadata: Metadata = { title: "Sayfa bulunamadı | Afina Zeytin" };

export default function NotFound() {
  return <main className={styles.page}><div className={styles.paper}>
    <h1>Sayfa bulunamadı</h1>
    <p>Bu adres artık kullanılmıyor ya da yanlış yazılmış olabilir. Ürünleri inceleyebilir veya ana sayfaya dönebilirsiniz.</p>
    <div className={styles.actions}><Link prefetch={false} href="/urunler">Ürünleri İnceleyin</Link><Link prefetch={false} href="/">Ana sayfaya dön</Link></div>
  </div></main>;
}
