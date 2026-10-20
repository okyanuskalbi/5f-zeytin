import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

// Existing brand/navigation structure, stripped of the v1 paper ornaments.
const links = [
  { label: "Ürünlerimizi Keşfedin", href: "/#urunler" },
  { label: "Tesisimiz", href: "/#tesisimiz" },
  { label: "Toptan Satış İçin İletişime Geçin", href: "/#toptan-iletisim" },
];
const legalLinks = [
  { label: "KVKK", href: "/kvkk" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis" },
  { label: "İade ve İptal", href: "/iade" },
];

export function Footer(): JSX.Element {
  return (
    <footer data-surface="dark" className={styles.footer}>
      <div data-reading-safe="">
        <div className={styles.columns}>
          <div className={styles.message}>
            <Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.home}>
              <Image src="/brand/afina-zeytin-dark.svg" alt="Afina Zeytin" width={104} height={80} sizes="104px" className={styles.logo} />
            </Link>
            <p className={styles.signature}>Kökü toprakta.<br /> Yeri sofrada.</p>
            <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
          </div>
          <div className={styles.destination}>
            <address>Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye</address>
            <nav aria-label="Keşfedin">
              <ul>{links.map(link => <li key={link.href}><a className={styles.link} href={link.href}>{link.label}</a></li>)}</ul>
            </nav>
          </div>
        </div>
        <div className={styles.imprint}>
          <p>AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SAN. VE TİC. LTD. ŞTİ. · Düziçi VD · VKN 0091520061</p>
          <div className={styles.bottom}>
            <nav aria-label="Yasal bilgiler"><ul>{legalLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul></nav>
            <a href="https://afina.com.tr" className={styles.community} aria-label="AFİNA Şirketler Topluluğu">
              <Image src="/brand/afina-topluluk-dark.svg" alt="AFİNA Şirketler Topluluğu" width={381} height={225} sizes="(max-width: 767px) 88px, 112px" loading="lazy" unoptimized />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
