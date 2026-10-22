/* eslint-disable @next/next/no-img-element -- Approved local SVGs need no image optimizer or client image runtime. */
import type { JSX } from "react";
import Link from "next/link";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import styles from "./Footer.module.css";

// Agency Footer, 21st.dev/@shadcnspace/components/footer-01 (demo 21474).
// Compact four-column grid adapted to v4 tokens, native links and CSS Modules (Tasks 123/127).
const shoppingLinks = [
  { label: "Ürünler", href: "/#kiler" },
  { label: "Kışlık kiler", href: "/#urunler" },
  { label: "Sepetim", href: "/sepet" },
];
const helpLinks = [
  { label: "Sipariş takibi", href: "/siparis-takip" },
  { label: "Hesabım", href: "/hesabim" },
  { label: "Sık sorulan sorular", href: "/#sik-sorulanlar" },
  { label: "İade ve İptal", href: "/iade" },
];
const legalLinks = [
  { label: "KVKK", href: "/kvkk" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis" },
  { label: "İade ve İptal", href: "/iade" },
];
const cardLogos = [
  { name: "Visa", width: 82, height: 26 },
  { name: "Mastercard", width: 78, height: 48 },
  { name: "Troy", width: 109, height: 50 },
];

export function Footer(): JSX.Element {
  const [street, ...locality] = seller.address.split(", ");
  const phone = siteContact.phone.trim();
  const email = siteContact.email.trim();

  return (
    <footer data-surface="dark" className={styles.footer}>
      <div data-reading-safe="">
        <div className={styles.columns}>
          <div className={styles.message} aria-labelledby="footer-brand-title">
            <h2 id="footer-brand-title" className="sr-only">AFİNA ZEYTİN</h2>
            <Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.home}>
              <img src="/brand/afina-zeytin-dark.svg" alt="Afina Zeytin" width={104} height={80} loading="lazy" decoding="async" className={styles.logo} />
            </Link>
            <p className={styles.signature}>Kökü toprakta.<br /> Yeri sofrada.</p>
            <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
            <a href="https://afina.com.tr" target="_blank" rel="noopener" className={styles.community} aria-label="AFİNA Şirketler Topluluğu">
              <img src="/brand/afina-topluluk-dark.svg" alt="AFİNA Şirketler Topluluğu" width={381} height={225} loading="lazy" decoding="async" />
              <span>Bir AFİNA Şirketler Topluluğu markası</span>
            </a>
          </div>
          <nav className={styles.column} aria-labelledby="footer-shopping-title">
            <h2 id="footer-shopping-title" className={styles.heading}>Alışveriş</h2>
            <ul>
              {shoppingLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}
              <li><Link className={styles.link} href="/#toptan-iletisim">Toptan Satış İçin İletişime Geçin</Link></li>
            </ul>
          </nav>
          <nav className={styles.column} aria-labelledby="footer-help-title">
            <h2 id="footer-help-title" className={styles.heading}>Yardım</h2>
            <ul>{helpLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul>
          </nav>
          <div className={`${styles.column} ${styles.destination}`} aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className={styles.heading}>İletişim</h2>
            <address><span>{street}, </span><span>{locality.join(", ")}</span></address>
            <ul>
              {phone && <li><a className={styles.link} href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>}
              {email && <li><a className={styles.link} href={`mailto:${email}`}>{email}</a></li>}
              <li><Link className={styles.link} href="/#tesisimiz">Tesisimiz</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.payment} role="group" aria-label="Güvenli ödeme">
          <div className={styles.provider}>
            <p>Güvenli Ödeme</p>
            <img src="/images/payment/paytr.svg" alt="PayTR" width={180} height={32} className={styles.paymentLogo} loading="lazy" decoding="async" />
          </div>
          <ul className={styles.cards} aria-label="Kabul edilen kartlar">
            {cardLogos.map(logo => <li key={logo.name}><img src={`/images/payment/${logo.name.toLowerCase()}.svg`} alt={logo.name} width={logo.width} height={logo.height} className={styles.paymentLogo} loading="lazy" decoding="async" /></li>)}
          </ul>
        </div>
        <div className={styles.imprint}>
          <p>{seller.name} · {seller.taxOffice} VD · VKN {seller.taxId}</p>
          <nav aria-label="Yasal bilgiler"><ul>{legalLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul></nav>
          <div className={styles.notice}>
            <p>© 2026 AFİNA ZEYTİN</p>
            <p>Önizleme: fiyatlar ve görseller temsilidir.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
