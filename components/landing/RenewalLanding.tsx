import type { JSX } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import facility from "@/lib/media/renewal-assets.json";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import { quoteDeliveryExplanation } from "@/lib/site/public-content";
import type { ProductVariant } from "@/types/catalog";
import { Faq } from "./Faq";
import { SectionReveal } from "./SectionReveal";
import { ScrollStage, ParallaxPhoto } from "./ScrollStage";
import { HorizontalProductGallery } from "./HorizontalProductGallery";
import { BusinessSegmentChoice } from "./QuoteJourneyProvider";
import { QuoteComposer } from "./QuoteComposer";
import { ProductionStory } from "./ProductionStory";
import { BlurText } from "@/components/animation/react-bits/BlurText";
import styles from "./ScrollingSections.module.css";

/** Retained for existing consumers; the active route uses the producer story. */
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

/** The current story replaces Task161's bento with the 21st 18041 scene. */
export function ProductionJourney(): JSX.Element {
  return <ProductionStory />;
}

/** 21st 7262 three peer cards. These are real customer segments, not pricing
 * tiers; the existing quote journey carries a chosen segment to the form. */
export function BusinessSection(): JSX.Element {
  return <ScrollStage id="toptan-iletisim" device="flow" sourceId={7262} labelledBy="toptan-title" className={styles.business}>
    <div className={styles.container}>
      <div className={styles.sectionHeading}>
        <h2 id="toptan-title"><BlurText text="İşletmeniz için AFİNA." /></h2>
        <p>Menünüz, rafınız ve müşterileriniz için ürün, ambalaj ve tüketim ihtiyacınızı paylaşın.</p>
      </div>
      <div className={styles.segmentGrid}>
        <article className={styles.segmentCard}>
          <h3>Otel &amp; restoran</h3><p>Kahvaltıdan profesyonel mutfağa.</p>
          <BusinessSegmentChoice segment="hospitality" className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: Otel ve restoran</span><ArrowUpRightIcon aria-hidden="true" size={24} /></BusinessSegmentChoice>
        </article>
        <article className={styles.segmentCard}>
          <h3>Market &amp; bayi</h3><p>Rafınıza ve bölgenize uygun ürün talebi.</p>
          <BusinessSegmentChoice segment="retail" className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: Market ve bayi</span><ArrowUpRightIcon aria-hidden="true" size={24} /></BusinessSegmentChoice>
        </article>
        <article className={styles.segmentCard}>
          <h3>Toplu tüketim</h3><p>İşletmenize uygun miktar planlaması.</p>
          <BusinessSegmentChoice segment="bulk" className={styles.segmentAction}>Teklif hazırlayın<span className="sr-only">: Toplu tüketim</span><ArrowUpRightIcon aria-hidden="true" size={24} /></BusinessSegmentChoice>
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
        <p>{quoteDeliveryExplanation}</p>
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
        <div><h2 id="iletisim-title"><BlurText text="Sofrada görüşürüz." /></h2><p className={styles.closingCopy}>Kökü toprakta. Yeri sofrada.</p><a href="#urunler" className={styles.textLink}>Ürünlere dön <ArrowUpRightIcon size={20} aria-hidden="true" /></a></div>
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
