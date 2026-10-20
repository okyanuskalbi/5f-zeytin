import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

// Two-column brand/navigation structure adapted from 21st Footer17 (ln-dev7,
// demo 26908). AFİNA's label back replaces the default copy, border and styling.
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
    <footer className={styles.footer}>
      <svg className={styles.scallops} viewBox="0 0 1200 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {Array.from({ length: 12 }, (_, index) => <path key={index} data-footer-scallop="" d={`M ${index * 100} 32 Q ${index * 100 + 50} -32 ${index * 100 + 100} 32 Z`} />)}
      </svg>
      <div data-reading-safe="" className={styles.paper}>
        <div className={styles.columns}>
          <div className={styles.message}>
            <p className={styles.signature}>Kökü toprakta.<br /> Yeri sofrada.</p>
            <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
            <p>Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır.</p>
          </div>
          <div className={styles.destination}>
            <div data-footer-stamp="" className={styles.stamp}>
              <Image src="/images/hero/zeytinlik-1200.webp" alt="" width={88} height={117} unoptimized />
            </div>
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
              <Image src="/brand/afina-topluluk.svg" alt="AFİNA Şirketler Topluluğu" width={381} height={225} unoptimized />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
