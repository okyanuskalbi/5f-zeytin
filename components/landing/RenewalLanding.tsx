import type { JSX } from "react";
import { ArrowUpRightIcon, MapPinIcon } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductCard } from "@/components/catalog/ProductCard";
import { v3Image } from "@/lib/media/v3-assets";
import facility from "@/lib/media/renewal-assets.json";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import type { ProductVariant } from "@/types/catalog";
import { BusinessEnquiry } from "./BusinessEnquiry";
import { Faq } from "./Faq";
import styles from "./RenewalLanding.module.css";

export function BrandIntroduction(): JSX.Element {
  return <section id="kurumsal" aria-labelledby="kurumsal-title" className={styles.introduction}>
    <div className={styles.container}>
      <p className={styles.eyebrow}>TOPRAĞIMIZDAN ALDIĞIMIZ GÜÇLE</p>
      <div className={styles.introGrid}>
        <h2 id="kurumsal-title">Bir yörenin lezzeti.<br /><em>Ortak bir özen.</em></h2>
        <div className={styles.introText}>
          <p>Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin ve zeytinyağını doğallığına önem veren bir anlayışla sunuyor; ürünlerini toptan ve perakende kanallarda müşterileriyle buluşturuyor.</p>
          <a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Bir AFİNA Şirketler Topluluğu markası <ArrowUpRightIcon size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <dl className={styles.brandFacts}>
        <div><dt>Köklerimiz</dt><dd>Ellek, Düziçi<br /><span>Osmaniye</span></dd></div>
        <div><dt>Üretimimiz</dt><dd>Zeytin &amp; zeytinyağı<br /><span>Kendi tesisimizde</span></dd></div>
        <div><dt>Buluştuğumuz yer</dt><dd>Sofralar &amp; işletmeler<br /><span>Perakende ve toptan</span></dd></div>
      </dl>
    </div>
  </section>;
}

// 21st About Bento (25310): a large editorial panel and smaller supporting
// panels, adapted to one real customer photograph and sourced brand facts.
export function ProductionFacility(): JSX.Element {
  return <section id="tesisimiz" aria-labelledby="tesisimiz-title" className={styles.facility}>
    <div className={styles.container}>
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>ÜRETİM TESİSİMİZ</p><h2 id="tesisimiz-title">Güvenin somut bir yeri var.</h2></div>
        <span className={styles.location}><MapPinIcon size={17} aria-hidden="true" /> Ellek / Düziçi / Osmaniye</span>
      </div>
      <figure className={styles.facilityFigure}>
        <V3Picture image={facility} sizes="(max-width: 800px) 100vw, 1280px" />
        <figcaption>AFİNA ZEYTİN<span>Osmaniye üretim tesisi</span></figcaption>
      </figure>
      <div className={styles.facilityDetails}>
        <div><p className={styles.eyebrow}>ÜRÜNÜN ÖZÜNE SAYGIYLA</p><h3>Ellek’te üretim.<br />Her sofraya aynı özen.</h3></div>
        <p>Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin, salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor. Ürünün özüne duyduğu saygıyı yalın ve özenli bir sunumla birleştiriyor.</p>
        <a href="#uretim-yolculugu" className={styles.roundLink} aria-label="Üretim yolculuğumuzu keşfedin"><ArrowUpRightIcon size={28} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}

export function RenewalProducts({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  const ordered = [...products].sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  return <section id="urunler" aria-labelledby="urunler-title" className={styles.collection}>
    <div id="kiler" className={styles.container}>
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>AFİNA KOLEKSİYONU</p><h2 id="urunler-title">Sofraya da yakışır.<br /><em>İşinize de.</em></h2></div>
        <p className={styles.sectionLead}>Sofralık zeytin, salamura zeytin ve zeytinyağı.<br />Günlük sofranızdan profesyonel mutfaklara.</p>
      </div>
      <div className={styles.collectionChannels}>
        <div><span className={styles.channelName}>Afina <em>Select</em></span><p>Kavanoz ve şişe sunumlarıyla sofranız için.</p></div>
        <div><span className={styles.channelName}>Afina <em>Professional</em></span><p>İşletmeniz için ambalaj ve miktar odaklı tedarik.</p><a href="#toptan-iletisim" className={styles.textLink}>Toptan teklif alın <ArrowUpRightIcon size={16} aria-hidden="true" /></a></div>
      </div>
      {ordered.length ? <div className={styles.productGrid}>
        {ordered.map((product, index) => <ProductCard key={product.id} product={product} index={index} image={v3Image(product.imageKey)} featured={false} />)}
      </div> : <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    </div>
  </section>;
}

export function ProductionJourney(): JSX.Element {
  return <section id="uretim-yolculugu" aria-labelledby="yolculuk-title" className={styles.journey}>
    <div className={styles.container}>
      <div className={styles.journeyGrid}>
        <div className={styles.journeyImage}><V3Picture image={v3Image("04-naturel-sizma-zeytinyagi-1l-sahne")} sizes="(max-width: 767px) 100vw, 48vw" />
          <p>Toprakta başlayan,<br /><em>sofrada tamamlanan.</em></p>
        </div>
        <div className={styles.journeyCopy}>
          <p className={styles.eyebrow}>ÜRETİM YOLCULUĞU</p><h2 id="yolculuk-title">Lezzetin ardında<br />bir emek var.</h2>
          <ol className={styles.steps}>
            <li><span>01</span><div><h3>Toprağın sunduğu</h3><p>Osmaniye’nin zeytin kültürü, AFİNA’nın hikâyesinin başlangıç noktası.</p></div></li>
            <li><span>02</span><div><h3>Tesisimizdeki özen</h3><p>Zeytinin seçimi, hazırlanması ve dolumu. Her aşamada ürünün özüne saygı.</p></div></li>
            <li><span>03</span><div><h3>Sofranıza uygun sunum</h3><p>Perakende alışverişten işletme taleplerine, ihtiyaca uygun ambalaj ve miktar.</p></div></li>
          </ol>
          <a href="#urunler" className={styles.darkButton}>Koleksiyonu keşfedin <ArrowUpRightIcon size={17} aria-hidden="true" /></a>
        </div>
      </div>
    </div>
  </section>;
}

export function BusinessSection({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  return <section id="toptan-iletisim" aria-labelledby="toptan-title" className={styles.business}>
    <div className={`${styles.container} ${styles.businessGrid}`}>
      <div className={styles.businessCopy}><p className={styles.eyebrow}>AFİNA PROFESSIONAL</p>
        <h2 id="toptan-title">İşletmenizin<br />güvenilir zeytin<br /><em>tedarikçisi.</em></h2>
        <p>Menünüz, rafınız ve müşterileriniz için. Ürün, ambalaj ve tüketim ihtiyacınızı paylaşın; size uygun tedarik talebini birlikte oluşturalım.</p>
        <ul className={styles.businessAudiences}>
          <li><span>Otel &amp; restoran</span><p>Kahvaltıdan profesyonel mutfağa.</p></li>
          <li><span>Market &amp; bayi</span><p>Rafınıza ve bölgenize uygun ürün talebi.</p></li>
          <li><span>Toplu tüketim</span><p>Yurt ve işletmelere miktar odaklı planlama.</p></li>
        </ul>
        <p className={styles.businessNote}>Ambalaj, minimum sipariş ve teslimat koşulları teklif aşamasında netleştirilir.</p>
      </div>
      <div className={styles.enquiryPanel}><h3>Kurumsal teklif talebi</h3><p>İhtiyacınızı birkaç bilgiyle anlatın.</p><BusinessEnquiry products={products} /></div>
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
        <div><p className={styles.eyebrow}>TANIŞALIM</p><h2 id="iletisim-title">Sofralarımız ayrı.<br /><em>Toprağımız ortak.</em></h2></div>
        <div><h3>AFİNA ZEYTİN</h3><address>{seller.address}</address>
          {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          <a href="https://www.google.com/maps/search/?api=1&query=Afina+Zeytin+Ellek+D%C3%BCzi%C3%A7i+Osmaniye" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Yol tarifi alın <ArrowUpRightIcon size={16} aria-hidden="true" /></a>
          <nav aria-label="Alışveriş ve destek bilgileri" className={styles.supportLinks}><a href="/siparis-takip">Sipariş takibi</a><a href="/iade">Teslimat ve iade bilgileri</a><a href="/mesafeli-satis">Satış koşulları</a></nav>
        </div>
      </div>
    </section>
  </>;
}
