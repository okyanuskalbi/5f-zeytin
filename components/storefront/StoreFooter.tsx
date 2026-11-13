import Link from "next/link";
import type { JSX } from "react";
import { BrandLogo } from "@/components/site/BrandLogo";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { productGroups } from "@/lib/catalog/groups";
import { FooterGroups, type FooterGroup } from "./FooterGroups";
import { OliveBranch } from "./ui/OliveBranch";
import styles from "./Navigation.module.css";

const groups: readonly FooterGroup[] = [
  { id: "urunler", title: "Ürünler", label: "Kategoriler", links: productGroups.map(group => ({ label: group.name, href: `/?kategori=${group.id}#urunler` })) },
  { id: "kurumsal", title: "Kurumsal", label: "Alt menü", links: [
    { label: "Hikâyemiz", href: "/#hikayemiz" },
    { label: "Toptan Satış", href: "/?sekme=toptan#toptan-bayilik" },
    { label: "Bayilik", href: "/?sekme=bayilik#toptan-bayilik" },
    { label: "Blog", href: "/#blog" },
    { label: "İletişim", href: "/#iletisim" },
  ] },
  { id: "yardim", title: "Yardım", label: "Müşteri ve yasal bilgiler", links: [
    { label: "Hesabım", href: "/hesabim" },
    { label: "Sipariş takibi", href: "/siparis-takip" },
    { label: "İade ve iptal", href: "/iade" },
    { label: "KVKK", href: "/kvkk" },
    { label: "Mesafeli satış sözleşmesi", href: "/mesafeli-satis" },
  ] },
];
/** Without script a phone cannot unfold the groups, so they stay open. */
const NO_SCRIPT_GROUPS = "[data-footer-links] nav{display:grid!important}[data-footer-links] h2::after{display:none!important}";

/** 21st Minimal Footer's grouped links, rewritten around AFİNA's actual routes. */
export function StoreFooter(): JSX.Element {
  return <footer data-surface="dark" data-phone-screen="footer" className={styles.footer}>
    <div className={styles.footerRule} aria-hidden="true"><span /><OliveBranch tone="gold" className={styles.footerBranch} /><span /></div>
    <div className={styles.footerInner}>
      <div className={styles.footerIdentity}>
        <Link prefetch={false} href="/" aria-label="Afina Zeytin ana sayfa" className={styles.footerLogoLink}><BrandLogo tone="dark" loading="lazy" className={styles.footerLogo} /></Link>
        <p className={styles.footerSlogan}>Kökü toprakta.<br />Yeri sofrada.</p>
        <p className={styles.community}><a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer">AFİNA Şirketler Topluluğu</a> markasıdır.</p>
      </div>
      <FooterGroups groups={groups} />
      <div className={styles.footerBottom}><p>© {new Date().getFullYear()} AFİNA ZEYTİN</p><div role="group" aria-label="Güvenli ödeme" className={styles.payments}><PaymentLogos tone="dark" className={styles.paymentLogo} /></div></div>
    </div>
    <noscript><style>{NO_SCRIPT_GROUPS}</style></noscript>
  </footer>;
}
