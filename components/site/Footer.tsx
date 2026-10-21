import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { seller } from "@/lib/site/seller";
import { hasSiteContact, siteContact } from "@/lib/site/contact";
import styles from "./Footer.module.css";

// Column grouping adapted from 21st.dev/shadcnspace/footer-01 (Task 117).
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
              <Image src="/brand/afina-zeytin-dark.svg" alt="Afina Zeytin" width={104} height={80} sizes="104px" className={styles.logo} />
            </Link>
            <p className={styles.signature}>Kökü toprakta.<br /> Yeri sofrada.</p>
            <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
            <div className={styles.groupBrand}>
              <p>Bir AFİNA Şirketler Topluluğu markası</p>
              <a href="https://afina.com.tr" target="_blank" rel="noopener" className={styles.community} aria-label="AFİNA Şirketler Topluluğu">
                <Image src="/brand/afina-topluluk-dark.svg" alt="AFİNA Şirketler Topluluğu" width={381} height={225} sizes="88px" loading="lazy" unoptimized />
              </a>
            </div>
          </div>
          <nav aria-labelledby="footer-shopping-title">
            <h2 id="footer-shopping-title" className={styles.heading}>Alışveriş</h2>
            <ul>
              {shoppingLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}
              {hasSiteContact(siteContact) && <li><Link className={styles.link} href="/#toptan-iletisim">Toptan Satış İçin İletişime Geçin</Link></li>}
            </ul>
          </nav>
          <nav aria-labelledby="footer-help-title">
            <h2 id="footer-help-title" className={styles.heading}>Yardım</h2>
            <ul>{helpLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul>
          </nav>
          <div className={styles.destination} aria-labelledby="footer-contact-title">
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
            <p>Güvenli ödeme</p>
            <Image src="/images/payment/paytr.svg" alt="PayTR" width={180} height={32} className={styles.paymentLogo} loading="lazy" unoptimized />
          </div>
          <ul className={styles.cards} aria-label="Kabul edilen kartlar">
            {cardLogos.map(logo => <li key={logo.name}><Image src={`/images/payment/${logo.name.toLowerCase()}.svg`} alt={logo.name} width={logo.width} height={logo.height} className={styles.paymentLogo} loading="lazy" unoptimized /></li>)}
          </ul>
        </div>
        <div className={styles.imprint}>
          <p>{seller.name} · {seller.taxOffice} VD · VKN {seller.taxId}</p>
          <div className={styles.bottom}>
            <nav aria-label="Yasal bilgiler"><ul>{legalLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul></nav>
          </div>
          <div className={styles.notice}>
            <p>© 2026 AFİNA ZEYTİN</p>
            <p>Önizleme: fiyatlar ve görseller temsilidir.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
