import type { Metadata } from "next";
import { OliveBranch } from "@/components/storefront/ui/OliveBranch";
import { PillButton } from "@/components/storefront/ui/PillButton";
import styles from "@/components/storefront/content/Content.module.css";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı | Afina Zeytin", description: "Bu adres bulunamadı. Ana sayfaya veya ürünlere dönebilirsiniz.", robots: { index: false, follow: false },
  openGraph: { title: "Sayfa bulunamadı | Afina Zeytin", description: "Bu adres bulunamadı. Ana sayfaya veya ürünlere dönebilirsiniz.", type: "website", images: ["/brand/og-zeytinyagi.webp"] },
  twitter: { card: "summary_large_image", title: "Sayfa bulunamadı | Afina Zeytin", description: "Bu adres bulunamadı. Ana sayfaya veya ürünlere dönebilirsiniz.", images: ["/brand/og-zeytinyagi.webp"] },
};

export default function NotFound() {
  return <main className={styles.page}><div className={styles.state}>
    <OliveBranch className={styles.stateBranch} />
    <h1>Sayfa bulunamadı</h1>
    <p>Bu adres artık kullanılmıyor ya da yanlış yazılmış olabilir. Ürünleri inceleyebilir veya ana sayfaya dönebilirsiniz.</p>
    <div className={styles.actions}><PillButton href="/">Ana sayfa</PillButton><PillButton variant="outline" href="/urunler">Ürünler</PillButton></div>
  </div></main>;
}
