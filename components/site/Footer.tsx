import type { JSX } from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { PaymentLogos } from "./PaymentLogos";
import styles from "./ClassicFooter.module.css";

const links = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkımızda", href: "/#hakkimizda" },
  { label: "Üretim Tesisimiz", href: "/#tesisimiz" },
  { label: "Ürünler", href: "/#urunler" },
  { label: "Toptan Satış", href: "/#toptan" },
  { label: "Bayilik", href: "/bayilik" },
  { label: "İletişim", href: "/#iletisim" },
];

/** C footer keeps the original artwork and existing legal/payment destinations. */
export function Footer(): JSX.Element {
  return <footer data-surface="dark" className={styles.footer}>
    <div className={styles.top}>
      <Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.home}>
        <BrandLogo tone="dark" loading="lazy" className={styles.logo} />
      </Link>
      <p className={styles.locality}>Ellek, Düziçi / Osmaniye</p>
      <nav aria-label="Alt menü" className={styles.links}>{links.map(link => <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>)}</nav>
      <a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.community}>AFİNA Şirketler Topluluğu markasıdır.</a>
    </div>
    <div className={styles.bottom}>
      <nav aria-label="Yasal bilgiler" className={styles.legal}>
        <Link href="/kvkk" className={styles.link}>KVKK</Link>
        <Link href="/mesafeli-satis" className={styles.link}>Mesafeli Satış Sözleşmesi</Link>
        <Link href="/iade" className={styles.link}>İade ve İptal</Link>
      </nav>
      <div role="group" aria-label="Güvenli ödeme" className={styles.payment}>
        <p>Güvenli Ödeme</p><PaymentLogos tone="light" brands={["paytr"]} className={styles.paymentLogo} />
        <ul aria-label="Kabul edilen kartlar"><PaymentLogos tone="light" brands={["visa", "mastercard", "troy"]} asListItems className={styles.paymentLogo} /></ul>
      </div>
    </div>
  </footer>;
}
