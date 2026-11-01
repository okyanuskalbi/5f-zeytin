import type { JSX } from "react";
import { Building2Icon, HotelIcon, StoreIcon } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { cinematicPoster } from "@/lib/media/cinematic-poster";
import facility from "@/lib/media/renewal-assets.json";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import type { ProductVariant } from "@/types/catalog";
import { Faq } from "./Faq";
import { SectionReveal } from "./SectionReveal";
import { ScrollStage, ParallaxPhoto } from "./ScrollStage";
import { HorizontalProductGallery } from "./HorizontalProductGallery";
import { BusinessSegmentChoice } from "./QuoteJourneyProvider";
import { QuoteComposer } from "./QuoteComposer";
import styles from "./RenewalLanding.module.css";

/** Retained for existing consumers; the v9 route opens directly into the gallery. */
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

/** 21st 20023 Parallax Image: real photograph, bounded Motion transform and
 * a short sticky reading column. No imported listener or foreign scroll engine. */
export function ProductionFacility(): JSX.Element {
  return <ScrollStage id="tesisimiz" device="parallax" sourceId={20023} labelledBy="tesisimiz-title" className={styles.facility}>
    <div className={`${styles.container} ${styles.facilityGrid}`}>
      <div id="kurumsal" className={styles.facilityCopy}>
        <h2 id="tesisimiz-title">Üretimin adresi:<br />Ellek.</h2>
        <p className={styles.location}>Ellek / Düziçi / Osmaniye</p>
        <p>Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin ve zeytinyağını perakende ve toptan kanallarda müşterileriyle buluşturuyor.</p>
        <address>{seller.address}</address>
        <a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Bir AFİNA Şirketler Topluluğu markası</a>
      </div>
      <figure className={styles.facilityFigure}>
        <div className={styles.facilityFrame}>
          <ParallaxPhoto className={styles.facilityImage}>
            <V3Picture image={facility} sizes="(max-width: 900px) calc(100vw - 40px), (max-width: 1504px) 60vw, 840px" />
          </ParallaxPhoto>
        </div>
        <figcaption>AFİNA ZEYTİN Osmaniye üretim tesisi</figcaption>
      </figure>
    </div>
  </ScrollStage>;
}

export function RenewalProducts({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  return <HorizontalProductGallery products={products} />;
}

/** 21st 1197 Bento Grid: one large photographic stage and two supporting
 * cards, populated only with AFİNA's existing land/facility/presentation story. */
export function ProductionJourney(): JSX.Element {
  return <ScrollStage id="uretim-yolculugu" device="reveal" sourceId={1197} labelledBy="yolculuk-title" className={styles.journey}>
    <div className={styles.container}>
      <div className={styles.sectionHeading}>
        <h2 id="yolculuk-title">Topraktan sofraya</h2>
        <p>Zeytinin yetiştiği yerden, sofranıza uygun sunuma.</p>
      </div>
      <div className={styles.storyGrid}>
        <article className={`${styles.storyCard} ${styles.storyLand}`}>
          <picture className={styles.storyMedia}>
            <source type="image/avif" srcSet={cinematicPoster.desktopSrcSet} sizes="(max-width: 767px) calc(100vw - 40px), 60vw" />
            <img src={cinematicPoster.src} srcSet={cinematicPoster.desktopWebpSrcSet} sizes="(max-width: 767px) calc(100vw - 40px), 60vw" width={cinematicPoster.width} height={cinematicPoster.height} alt="Zeytinlikte ağaç ve zeytin dalları" loading="lazy" decoding="async" />
          </picture>
          <div className={styles.storyText}><h3>Toprağımız</h3><p>Osmaniye’nin zeytin kültürü, AFİNA’nın hikâyesinin başlangıç noktası.</p></div>
        </article>
        <article className={`${styles.storyCard} ${styles.storyFacility}`}>
          <V3Picture image={facility} className={styles.storyMedia} sizes="(max-width: 767px) calc(100vw - 40px), 35vw" />
          <div className={styles.storyText}><h3>Tesisimiz</h3><p>Ellek’te zeytinin seçimi, hazırlanması ve dolumu.</p></div>
        </article>
        <article className={`${styles.storyCard} ${styles.storyPresentation}`}>
          <V3Picture image={v3Image("04-naturel-sizma-zeytinyagi-1l-sahne")} className={styles.storyMedia} sizes="(max-width: 767px) calc(100vw - 40px), 35vw" />
          <div className={styles.storyText}><h3>Sunumumuz</h3><p>Perakende alışveriş ve işletme talepleri için mevcut ambalaj çeşitleri.</p></div>
        </article>
      </div>
    </div>
  </ScrollStage>;
}

/** 21st 7262 three peer cards. These are real customer segments, not pricing
 * tiers; the existing quote journey carries a chosen segment to the form. */
export function BusinessSection(): JSX.Element {
  return <ScrollStage id="toptan-iletisim" device="flow" sourceId={7262} labelledBy="toptan-title" className={styles.business}>
    <div className={styles.container}>
      <div className={styles.sectionHeading}>
        <h2 id="toptan-title">İşletmeniz için AFİNA.</h2>
        <p>Menünüz, rafınız ve müşterileriniz için ürün, ambalaj ve tüketim ihtiyacınızı paylaşın.</p>
      </div>
      <div className={styles.segmentGrid}>
        <article className={styles.segmentCard}>
          <HotelIcon size={32} strokeWidth={1.5} aria-hidden="true" />
          <h3>Otel &amp; restoran</h3><p>Kahvaltıdan profesyonel mutfağa.</p>
          <BusinessSegmentChoice segment="hospitality" className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: Otel ve restoran</span></BusinessSegmentChoice>
        </article>
        <article className={styles.segmentCard}>
          <StoreIcon size={32} strokeWidth={1.5} aria-hidden="true" />
          <h3>Market &amp; bayi</h3><p>Rafınıza ve bölgenize uygun ürün talebi.</p>
          <BusinessSegmentChoice segment="retail" className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: Market ve bayi</span></BusinessSegmentChoice>
        </article>
        <article className={styles.segmentCard}>
          <Building2Icon size={32} strokeWidth={1.5} aria-hidden="true" />
          <h3>Toplu tüketim</h3><p>İşletmenize uygun miktar planlaması.</p>
          <BusinessSegmentChoice segment="bulk" className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: Toplu tüketim</span></BusinessSegmentChoice>
        </article>
      </div>
      <p className={styles.businessNote}>Ambalaj, minimum sipariş ve teslimat koşulları teklif aşamasında netleştirilir.</p>
    </div>
  </ScrollStage>;
}

/** 21st 35258: the actual form/validation and email-draft response are owned by
 * QuoteComposer. This section never reports automatic delivery or WhatsApp. */
export function QuoteSection({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  return <ScrollStage id="teklif" device="flow" sourceId={35258} labelledBy="teklif-title" className={styles.quote}>
    <div className={styles.container}>
      <div className={styles.quoteHeading}>
        <h2 id="teklif-title">İhtiyacınızı<br />birlikte planlayalım.</h2>
        <p>Form, talebinizin e-posta taslağını hazırlar. Gönderimi e-posta uygulamanızda siz tamamlarsınız.</p>
      </div>
      <QuoteComposer products={products} />
    </div>
  </ScrollStage>;
}

/** 21st 31986 accordion/support composition, retaining the native AFİNA
 * disclosures and FAQPage schema. Actual footer source 21474 remains separate. */
export function TrustAndContact(): JSX.Element {
  const phone = siteContact.phone.trim();
  const email = siteContact.email.trim();
  return <ScrollStage id="iletisim" device="reveal" sourceId={31986} labelledBy="sss-title" className={styles.support}>
    <div className={styles.container}>
      <Faq embedded />
      <div role="region" aria-labelledby="iletisim-title" className={styles.contactGrid}>
        <div><h2 id="iletisim-title">Ellek’te buluşalım</h2><a href="#urunler" className={styles.textLink}>Ürünlere dön</a></div>
        <div><h3>AFİNA ZEYTİN</h3><address>{seller.address}</address>
          {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          <a href="https://www.google.com/maps/search/?api=1&query=Afina+Zeytin+Ellek+D%C3%BCzi%C3%A7i+Osmaniye" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Yol tarifi alın</a>
          <a href="https://afina.com.tr/#iletisim" target="_blank" rel="noopener noreferrer" className={styles.textLink}>AFİNA Şirketler Topluluğu iletişim bilgileri</a>
          <nav aria-label="Alışveriş ve destek bilgileri" className={styles.supportLinks}><a href="/siparis-takip">Sipariş takibi</a><a href="/iade">Teslimat ve iade bilgileri</a><a href="/mesafeli-satis">Satış koşulları</a></nav>
        </div>
      </div>
    </div>
  </ScrollStage>;
}
