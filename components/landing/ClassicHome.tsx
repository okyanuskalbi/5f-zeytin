import type { JSX } from "react";
import { ArrowRight, Factory, Handshake, Leaf, Truck } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import photos from "@/lib/media/classic-photos.json";
import styles from "./ClassicHome.module.css";

export function ClassicHero(): JSX.Element {
  return <section id="baslangic" aria-labelledby="baslangic-title" className={styles.hero} data-surface="dark" data-storefront-hero>
    <V3Picture image={photos.assets.hero} mobile={photos.assets["hero-mobile"]} sizes="100vw" eager className={styles.heroPhoto} data-hero-photo />
    <div className={`${styles.container} ${styles.heroContent}`}><div className={styles.heroCopy}>
      <p className={styles.eyebrow} data-hero-enter="eyebrow">KENDİ ÜRETİMİMİZ</p>
      <h1 id="baslangic-title" data-hero-enter="title">Doğal, Lezzetli,{" "}<br />Güvenilir Zeytin</h1>
      <p data-hero-enter="description">Osmaniye Düziçi&apos;nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisimizde hazırlayıp sofranıza ulaştırıyoruz.</p>
      <div className={styles.actions} data-hero-enter="actions">
        <a href="#urunler" className={styles.goldButton}>Ürünlerimizi İncele<ArrowRight size={18} aria-hidden="true" /></a>
        <a href="#toptan" className={styles.outlineButton}>Toptan Teklif Al<ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </div></div>
  </section>;
}

export function TrustStrip(): JSX.Element {
  const items = [
    { icon: Factory, text: "Kendi Üretim Tesisimiz ile Kontrollü Üretim" },
    { icon: Leaf, text: "Geleneksel Usul Doğal Kırma" },
    { icon: Truck, text: "Online Sipariş ve Toptan Satış" },
    { icon: Handshake, text: "Otel, Restoran, Market ve Bayilik İş Birlikleri" },
  ];
  return <div className={styles.trust} data-surface="dark"><ul className={styles.container} aria-label="Üretim ve iş birliklerimiz">
    {items.map(({ icon: Icon, text }) => <li key={text}><Icon aria-hidden="true" strokeWidth={1.25} /><span>{text}</span></li>)}
  </ul></div>;
}

export function ClassicFacility(): JSX.Element {
  return <section id="tesisimiz" className={`${styles.container} ${styles.facility}`} aria-labelledby="tesisimiz-title">
    <span id="uretim-yolculugu" className={styles.anchor} aria-hidden="true" />
    <picture className={styles.facilityPhoto}>
      <img src="/images/tesis/tesis-osmaniye-v4-1200.webp" srcSet="/images/tesis/tesis-osmaniye-v4-1200.webp 1200w, /images/tesis/tesis-osmaniye-v4-2400.webp 2400w" sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 50vw, 610px" width={1200} height={750} alt="AFİNA ZEYTİN üretim tesisi, Ellek, Düziçi, Osmaniye" loading="lazy" decoding="async" />
    </picture>
    <div className={styles.facilityCopy}>
      <Leaf className={styles.branch} strokeWidth={.7} aria-hidden="true" />
      <p className={styles.eyebrow}>ÜRETİCİ GÜCÜMÜZ</p>
      <h2 id="tesisimiz-title">Modern Üretim Tesisimiz</h2>
      <p>Zeytin ayıklama, salamura, paketleme ve depolama süreçlerini Osmaniye Düziçi&apos;ndeki kendi tesisimizde gerçekleştiriyoruz.</p>
      <a href="#hakkimizda" className={styles.darkGoldButton}>Tesisimizi Keşfedin<ArrowRight size={18} aria-hidden="true" /></a>
    </div>
  </section>;
}

export function ClassicBusiness(): JSX.Element {
  return <section aria-label="Toptan satış ve bayilik" className={styles.business}>
    <V3Picture image={photos.assets.zeytinlik} sizes="100vw" decorative className={styles.businessBackground} />
    <div className={`${styles.container} ${styles.businessGrid}`}>
      <article className={styles.businessCard} data-surface="dark">
        <V3Picture image={photos.assets.depo} sizes="(max-width: 767px) calc(100vw - 40px), 260px" className={styles.businessPhoto} />
        <div><h2>Toptan Satış</h2><p>Otel, restoran, market ve toplu tüketim için koli bazında teklif.</p><a href="#toptan" className={styles.goldButton}>Toptan Teklif Al<ArrowRight size={18} aria-hidden="true" /></a></div>
      </article>
      <article className={styles.businessCard} data-surface="dark">
        <V3Picture image={photos.assets["zeytin-dali"]} sizes="(max-width: 767px) calc(100vw - 40px), 260px" className={styles.businessPhoto} />
        <div><h2>Bayimiz Olun</h2><p>AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p><a href="/bayilik" className={styles.goldButton}>Bayilik Başvurusu<ArrowRight size={18} aria-hidden="true" /></a></div>
      </article>
    </div>
  </section>;
}

export function ClassicAbout(): JSX.Element {
  return <section id="hakkimizda" className={`${styles.container} ${styles.about}`} aria-labelledby="hakkimizda-title">
    <span id="kurumsal" className={styles.anchor} aria-hidden="true" />
    <p className={styles.eyebrow}>HAKKIMIZDA</p><h2 id="hakkimizda-title">Ellek&apos;ten sofranıza</h2>
    <p>AFİNA ZEYTİN, AFİNA Şirketler Topluluğu&apos;nun zeytin ve zeytinyağı markasıdır. Osmaniye&apos;nin Düziçi ilçesindeki Ellek&apos;te, kendi tesisimizde hazırladığımız ürünleri bireysel ve toptan alıcılarla buluşturuyoruz.</p>
    <p>Doğal kırma zeytinlerimizi geleneksel usulle hazırlıyoruz. Kendi tesisimizde ayıklamadan paketlemeye uzanan üretim sürecini takip ediyoruz.</p>
    <a className={styles.textLink} href="https://afina.com.tr" target="_blank" rel="noopener noreferrer">AFİNA Şirketler Topluluğu<ArrowRight size={18} aria-hidden="true" /></a>
  </section>;
}
