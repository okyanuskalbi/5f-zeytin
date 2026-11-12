import Link from "next/link";
import type { JSX } from "react";
import { BrandLogo } from "@/components/site/BrandLogo";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { productGroups } from "@/lib/catalog/groups";
import { OliveBranch } from "./ui/OliveBranch";
import styles from "./Navigation.module.css";

const corporateLinks = [
  { label: "Hikâyemiz", href: "/#hikayemiz" },
  { label: "Toptan Satış", href: "/?sekme=toptan#toptan-bayilik" },
  { label: "Bayilik", href: "/?sekme=bayilik#toptan-bayilik" },
  { label: "Blog", href: "/#blog" },
  { label: "İletişim", href: "/#iletisim" },
] as const;

/** 21st Minimal Footer's grouped links, rewritten around AFİNA's actual routes. */
export function StoreFooter(): JSX.Element {
  return <footer data-surface="dark" className={styles.footer}>
    <div className={styles.footerRule} aria-hidden="true"><span /><OliveBranch tone="gold" className={styles.footerBranch} /><span /></div>
    <div className={styles.footerInner}>
      <div className={styles.footerIdentity}>
        <Link prefetch={false} href="/" aria-label="Afina Zeytin ana sayfa" className={styles.footerLogoLink}><BrandLogo tone="dark" loading="lazy" className={styles.footerLogo} /></Link>
        <p className={styles.footerSlogan}>Kökü toprakta.<br />Yeri sofrada.</p>
        <p className={styles.community}><a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer">AFİNA Şirketler Topluluğu</a> markasıdır.</p>
      </div>
      <div className={styles.footerGroups} data-footer-links>
        <section><h2>Ürünler</h2><nav aria-label="Kategoriler">{productGroups.map(group => <Link prefetch={false} key={group.id} href={`/?kategori=${group.id}#urunler`}>{group.name}</Link>)}</nav></section>
        <section><h2>Kurumsal</h2><nav aria-label="Alt menü">{corporateLinks.map(link => <Link prefetch={false} key={link.href} href={link.href}>{link.label}</Link>)}</nav></section>
        <section><h2>Yardım</h2><nav aria-label="Müşteri ve yasal bilgiler"><Link href="/hesabim" prefetch={false}>Hesabım</Link><Link href="/siparis-takip" prefetch={false}>Sipariş takibi</Link><Link prefetch={false} href="/iade">İade ve iptal</Link><Link prefetch={false} href="/kvkk">KVKK</Link><Link prefetch={false} href="/mesafeli-satis">Mesafeli satış sözleşmesi</Link></nav></section>
      </div>
      <div className={styles.footerBottom}><p>© {new Date().getFullYear()} AFİNA ZEYTİN</p><div role="group" aria-label="Güvenli ödeme" className={styles.payments}><PaymentLogos tone="dark" className={styles.paymentLogo} /></div></div>
    </div>
  </footer>;
}
