import type { JSX } from "react";
import { ArrowRight } from "lucide-react";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import type { ProductVariant } from "@/types/catalog";
import { Faq } from "./Faq";
import { QuoteComposer } from "./QuoteComposer";
import styles from "./ClassicHome.module.css";

/** The existing validated, multi-product email draft remains unchanged. */
export function QuoteSection({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  return <section id="toptan" aria-labelledby="toptan-title" className={styles.quote}>
    <span id="teklif" className={styles.anchor} aria-hidden="true" />
    <span id="toptan-iletisim" className={styles.anchor} aria-hidden="true" />
    <div className={styles.formContainer}>
      <header className={styles.sectionHeading}><p className={styles.eyebrow}>TOPTAN SATIŞ</p><h2 id="toptan-title">Birlikte planlayalım</h2><p>Ürünleri ve adetleri seçin, işletmeniz için teklif taslağını hazırlayın.</p></header>
      <QuoteComposer products={products} />
    </div>
  </section>;
}

export function TrustAndContact(): JSX.Element {
  const phone = siteContact.phone.trim();
  const email = siteContact.email.trim();
  return <>
    <div className={`${styles.container} ${styles.faq}`}><Faq /></div>
    <section id="iletisim" aria-labelledby="iletisim-title" className={styles.contact}>
      <div className={`${styles.container} ${styles.contactGrid}`}>
        <div><p className={styles.eyebrow}>İLETİŞİM</p><h2 id="iletisim-title">Sofrada görüşürüz.</h2><p>Kökü toprakta. Yeri sofrada.</p><a href="#urunler" className={styles.textLink}>Ürünlere dön<ArrowRight size={18} aria-hidden="true" /></a></div>
        <div><h3>AFİNA ZEYTİN</h3><address>{seller.address}</address>
          {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          <a href="https://www.google.com/maps/search/?api=1&query=Afina+Zeytin+Ellek+D%C3%BCzi%C3%A7i+Osmaniye" target="_blank" rel="noopener noreferrer">Yol tarifi alın</a>
          <a href="https://afina.com.tr/#iletisim" target="_blank" rel="noopener noreferrer">AFİNA Şirketler Topluluğu iletişim bilgileri</a>
          <nav aria-label="Alışveriş ve destek bilgileri"><a href="/siparis-takip">Sipariş takibi</a><a href="/iade">Teslimat ve iade bilgileri</a><a href="/mesafeli-satis">Satış koşulları</a></nav>
        </div>
      </div>
    </section>
  </>;
}
