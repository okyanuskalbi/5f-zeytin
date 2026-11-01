import type { JSX } from "react";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductCard } from "@/components/catalog/ProductCard";
import { v3Image } from "@/lib/media/v3-assets";
import facility from "@/lib/media/renewal-assets.json";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import type { ProductVariant } from "@/types/catalog";
import { BusinessEnquiry } from "./BusinessEnquiry";
import { Faq } from "./Faq";
import { SectionReveal } from "./SectionReveal";
import styles from "./RenewalLanding.module.css";

export function BrandIntroduction(): JSX.Element {
  return <section id="kurumsal" data-producer-statement="" aria-labelledby="kurumsal-title" className={styles.introduction}>
    <div className={`${styles.container} ${styles.introGrid}`}>
      <SectionReveal><h2 id="kurumsal-title">Ellek’ten sofralara</h2></SectionReveal>
      <SectionReveal className={styles.introText}>
        <p>Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin ve zeytinyağını perakende ve toptan kanallarda müşterileriyle buluşturuyor.</p>
        <a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Bir AFİNA Şirketler Topluluğu markası</a>
      </SectionReveal>
    </div>
  </section>;
}

/** One real photograph is the proof. The panorama geometry is adapted from
 * taste's intro-heading-captions-panorama, with AFİNA's sourced locality. */
export function ProductionFacility(): JSX.Element {
  return <section id="tesisimiz" data-factory-panorama="" aria-labelledby="tesisimiz-title" className={styles.facility}>
    <div className={styles.container}>
      <SectionReveal className={styles.sectionHeading}>
        <h2 id="tesisimiz-title">Üretimin adresi: Ellek.</h2>
        <p className={styles.location}>Ellek / Düziçi / Osmaniye</p>
      </SectionReveal>
      <SectionReveal><figure className={styles.facilityFigure}>
        <V3Picture image={facility} sizes="(max-width: 767px) calc(100vw - 40px), calc(100vw - 64px)" />
        <figcaption>AFİNA ZEYTİN Osmaniye üretim tesisi</figcaption>
      </figure></SectionReveal>
      <a href="#uretim-yolculugu" className={styles.textLink}>Topraktan sofraya</a>
    </div>
  </section>;
}

export function RenewalProducts({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  return <section id="urunler" data-product-gallery="" aria-labelledby="urunler-title" className={styles.collection}>
    <div id="kiler" className={styles.container}>
      <SectionReveal className={styles.sectionHeading}>
        <h2 id="urunler-title">Zeytinin farklı halleri.</h2>
        <p className={styles.sectionLead}>Sofralık zeytin, salamura zeytin ve zeytinyağı. Günlük sofranızdan profesyonel mutfaklara.</p>
      </SectionReveal>
      <div className={styles.collectionChannels}>
        <p>Sofranız için kavanoz ve şişe, işletmeniz için miktar odaklı sunumlar.</p>
        <a href="#toptan-iletisim" className={styles.textLink}>İşletmeniz için teklif bilgileri</a>
      </div>
      {ordered.length ? <>
        <p id="urunler-gallery-help" className={styles.galleryHint}>Galeriyi yatay kaydırarak diğer ürünleri inceleyin.</p>
        <div data-gallery-rail="" role="region" aria-label="Ürün galerisi" aria-describedby="urunler-gallery-help" tabIndex={0} className={styles.productGrid}>
          {ordered.map((product, index) => <ProductCard key={product.id} product={product} index={index} image={v3Image(product.imageKey)} featured={false} />)}
        </div>
      </> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    </div>
  </section>;
}

export function ProductionJourney(): JSX.Element {
  return <section id="uretim-yolculugu" data-production-summary="" aria-labelledby="yolculuk-title" className={styles.journey}>
    <div className={`${styles.container} ${styles.journeyGrid}`}>
      <div className={styles.journeyCopy}>
        <h2 id="yolculuk-title">Topraktan sofraya</h2>
        <ol className={styles.steps}>
          <li><h3>Toprağımız</h3><p>Osmaniye’nin zeytin kültürü, AFİNA’nın hikâyesinin başlangıç noktası.</p></li>
          <li><h3>Tesisimiz</h3><p>Ellek’te zeytinin seçimi, hazırlanması ve dolumu.</p></li>
          <li><h3>Sunumumuz</h3><p>Perakende alışveriş ve işletme talepleri için mevcut ambalaj çeşitleri.</p></li>
        </ol>
        <a href="#urunler" className={styles.textLink}>Ürünleri Keşfet</a>
      </div>
      <SectionReveal><figure className={styles.journeyImage}>
        <V3Picture image={v3Image("04-naturel-sizma-zeytinyagi-1l-sahne")} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1504px) 35vw, 488px" />
        <figcaption>Toprakta başlayan, sofrada tamamlanan.</figcaption>
      </figure></SectionReveal>
    </div>
  </section>;
}

export function BusinessSection({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  return <section id="toptan-iletisim" data-business-branch="" aria-labelledby="toptan-title" className={styles.business}>
    <div className={`${styles.container} ${styles.businessGrid}`}>
      <div className={styles.businessCopy}>
        <h2 id="toptan-title">İşletmeniz için AFİNA.</h2>
        <p>Menünüz, rafınız ve müşterileriniz için ürün, ambalaj ve tüketim ihtiyacınızı paylaşın.</p>
        <ul className={styles.businessAudiences}>
          <li><span>Otel &amp; restoran</span><p>Kahvaltıdan profesyonel mutfağa.</p></li>
          <li><span>Market &amp; bayi</span><p>Rafınıza ve bölgenize uygun ürün talebi.</p></li>
          <li><span>Toplu tüketim</span><p>İşletmenize uygun miktar planlaması.</p></li>
        </ul>
        <p className={styles.businessNote}>Ambalaj, minimum sipariş ve teslimat koşulları teklif aşamasında netleştirilir.</p>
        <a href="#urunler" className={styles.textLink}>Ürünleri Keşfet</a>
      </div>
      <div className={styles.enquiryPanel}>
        <p className={styles.serviceStatus} role="note"><strong>Teklif formundan gönderim şu anda kapalı.</strong><span>İletişim kanalı açıldığında buradan talebinizi iletebilirsiniz.</span></p>
        <details data-enquiry-preparation="" className={styles.enquiryDetails}>
          <summary>Bilgileri hazırlayın</summary>
          <div className={styles.enquiryFields}>
            <h3>Kurumsal teklif talebi</h3>
            <p>İhtiyacınızı birkaç bilgiyle anlatın.</p>
            <BusinessEnquiry products={products} />
          </div>
        </details>
      </div>
    </div>
  </section>;
}

export function TrustAndContact(): JSX.Element {
  const phone = siteContact.phone.trim();
  const email = siteContact.email.trim();
  return <>
    <div className={styles.faqWrap}><Faq /></div>
    <section id="iletisim" aria-labelledby="iletisim-title" className={styles.contact}>
      <div className={`${styles.container} ${styles.contactGrid}`}>
        <div><h2 id="iletisim-title">Ellek’te buluşalım</h2><a href="#urunler" className={styles.textLink}>Ürünlere dön</a></div>
        <div><h3>AFİNA ZEYTİN</h3><address>{seller.address}</address>
          {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          <a href="https://www.google.com/maps/search/?api=1&query=Afina+Zeytin+Ellek+D%C3%BCzi%C3%A7i+Osmaniye" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Yol tarifi alın</a>
          <nav aria-label="Alışveriş ve destek bilgileri" className={styles.supportLinks}><a href="/siparis-takip">Sipariş takibi</a><a href="/iade">Teslimat ve iade bilgileri</a><a href="/mesafeli-satis">Satış koşulları</a></nav>
        </div>
      </div>
    </section>
  </>;
}
