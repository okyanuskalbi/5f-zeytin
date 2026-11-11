import Link from "next/link";
import type { JSX } from "react";
import { BrandLogo } from "@/components/site/BrandLogo";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { productGroups } from "@/lib/catalog/groups";
import styles from "./Navigation.module.css";

/** 21st Minimal Footer's grouped links, rewritten around AFİNA's actual routes. */
export function StoreFooter(): JSX.Element {
  return <footer data-surface="dark" className={styles.footer}>
    <div className={styles.footerInner}>
      <div className={styles.footerIdentity}>
        <Link prefetch={false} href="/" aria-label="Afina Zeytin ana sayfa" className={styles.footerLogoLink}><BrandLogo tone="dark" loading="lazy" className={styles.footerLogo} /></Link>
        <p className={styles.footerSlogan}>Kökü toprakta.<br />Yeri sofrada.</p>
        <a className={styles.community} href="https://afina.com.tr" target="_blank" rel="noopener noreferrer">AFİNA Şirketler Topluluğu markasıdır.</a>
      </div>
      <div className={styles.footerGroups} data-footer-links>
        <section><h2>AFİNA</h2><nav aria-label="Alt menü"><Link prefetch={false} href="/hakkimizda">Hakkımızda</Link><Link prefetch={false} href="/toptan-satis">Toptan Satış</Link><Link prefetch={false} href="/bayilik">Bayilik</Link><Link prefetch={false} href="/blog">Blog</Link></nav></section>
        <section><h2>Ürünler</h2><nav aria-label="Kategoriler">{productGroups.map(group => <Link prefetch={false} key={group.id} href={`/urunler/${group.id}`}>{group.name}</Link>)}</nav></section>
        <section><h2>Yardım</h2><nav aria-label="Müşteri ve yasal bilgiler"><Link href="/hesabim" prefetch={false}>Hesabım</Link><Link href="/siparis-takip" prefetch={false}>Sipariş takibi</Link><Link prefetch={false} href="/iade">İade ve iptal</Link><Link prefetch={false} href="/kvkk">KVKK</Link><Link prefetch={false} href="/mesafeli-satis">Mesafeli satış sözleşmesi</Link></nav></section>
      </div>
      <address className={styles.contact}><span>Ellek Beldesi, Düziçi / Osmaniye</span><a href="tel:+903288827708">0 328 882 77 08</a><a href="mailto:info@afina.com.tr">info@afina.com.tr</a></address>
      <div className={styles.footerBottom}><p>© {new Date().getFullYear()} AFİNA ZEYTİN</p><div role="group" aria-label="Güvenli ödeme" className={styles.payments}><PaymentLogos tone="light" className={styles.paymentLogo} /></div></div>
    </div>
  </footer>;
}
