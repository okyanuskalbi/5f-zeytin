import type { JSX } from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { PaymentLogos } from "./PaymentLogos";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import styles from "./ClassicFooter.module.css";

const corporate = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Toptan Satış", href: "/toptan-satis" },
  { label: "Bayilik", href: "/bayilik" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/#iletisim" },
];
const categories = [
  { label: "Zeytinyağı", href: "/urunler/zeytinyagi" },
  { label: "Zeytin", href: "/urunler/zeytin" },
  { label: "Siyah Zeytin", href: "/urunler/siyah-zeytin" },
  { label: "Yeşil Zeytin", href: "/urunler/yesil-zeytin" },
  { label: "Kırma Zeytin", href: "/urunler/kirma-zeytin" },
];

/** Public contact channels remain conditional until customer-service details are approved. */
export function Footer(): JSX.Element {
  return <footer className={styles.footer}>
    <div className={styles.top}>
      <div className={styles.identity}>
        <Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <BrandLogo tone="light" loading="lazy" className={styles.logo} />
        </Link>
        <p>Kökü toprakta. Yeri sofrada.</p>
        <p>Ellek zeytinliklerinden sofranıza, kendi tesisimizde hazırlanan zeytin ve zeytinyağı.</p>
        <p className={styles.locality}>Ellek, Düziçi / Osmaniye</p>
        <a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.community}>AFİNA Şirketler Topluluğu markasıdır.</a>
      </div>
      <div><h2>Kurumsal</h2><nav aria-label="Alt menü" className={styles.links}>{corporate.map(link => <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>)}</nav></div>
      <div><h2>Kategoriler</h2><nav aria-label="Kategoriler" className={styles.links}>{categories.map(link => <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>)}</nav></div>
      <div><h2>Müşteri Hizmetleri</h2><nav aria-label="Müşteri hizmetleri" className={styles.links}>
        <Link href="/hesabim" className={styles.link}>Hesabım</Link><Link href="/siparis-takip" className={styles.link}>Sipariş Takip</Link><Link href="/sepet" className={styles.link}>Sepetim</Link>
      </nav><h2>Yasal</h2><nav aria-label="Yasal bilgiler" className={styles.legal}>
        <Link href="/kvkk" className={styles.link}>KVKK</Link><Link href="/mesafeli-satis" className={styles.link}>Mesafeli Satış Sözleşmesi</Link><Link href="/iade" className={styles.link}>İade ve İptal</Link>
      </nav></div>
    </div>
    <div className={styles.contact}>
      <address>{seller.address}</address>
      {siteContact.phone.trim() && <a className={styles.link} href={`tel:${siteContact.phone.replace(/\s/g, "")}`}>{siteContact.phone}</a>}
      {siteContact.email.trim() && <a className={styles.link} href={`mailto:${siteContact.email.trim()}`}>{siteContact.email.trim()}</a>}
      {siteContact.whatsapp.replace(/\D/g, "") && <a className={styles.link} href={`https://wa.me/${siteContact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
      <a href="https://afina.com.tr/#iletisim" target="_blank" rel="noopener noreferrer" className={styles.link}>AFİNA Şirketler Topluluğu iletişim bilgileri</a>
    </div>
    <div className={styles.bottom}>
      <p>© {new Date().getFullYear()} AFİNA ZEYTİN. Tüm hakları saklıdır.</p>
      <div role="group" aria-label="Güvenli ödeme" className={styles.payment}>
        <p>Güvenli Ödeme</p><PaymentLogos tone="dark" brands={["paytr"]} className={styles.paymentLogo} />
        <ul aria-label="Kabul edilen kartlar"><PaymentLogos tone="dark" brands={["visa", "mastercard", "troy"]} asListItems className={styles.paymentLogo} /></ul>
      </div>
    </div>
  </footer>;
}
