import type { JSX } from "react";
import Link from "next/link";
import { ArrowRight, Factory, Leaf, Package, Store, Truck, Warehouse } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import classic from "@/components/landing/ClassicHome.module.css";
import photos from "@/lib/media/classic-photos.json";
import { v3Image } from "@/lib/media/v3-assets";
import { DealershipForm } from "./DealershipForm";
import styles from "./DealershipPage.module.css";

const businessProfiles = [
  { icon: Store, title: "Market ve şarküteriler", description: "Rafında yöresel zeytin ve zeytinyağı bulundurmak isteyen işletmeler." },
  { icon: Warehouse, title: "Kuruyemiş ve yöresel ürün dükkânları", description: "Ambalajlı zeytin ve zeytinyağı satan dükkânlar." },
  { icon: Truck, title: "Toptancı ve distribütörler", description: "Bölgesindeki satış noktalarına ürün ulaştıran firmalar." },
];

const steps = [
  { title: "Formu doldurun", description: "Firma ve bölge bilgilerinizi bize iletin." },
  { title: "Size dönüş yapalım", description: "Başvurunuzu inceledikten sonra sizinle iletişime geçeriz." },
  { title: "Koşulları birlikte belirleyelim", description: "Ürün, miktar ve sevkiyat planını birlikte netleştiririz." },
];

const packaging = [
  { image: "urun-01-kirma-10kg", name: "Doğal Kırma Yeşil Zeytin", size: "3 L teneke", sizes: "(max-width: 767px) 45vw, (max-width: 1100px) 25vw, 260px" },
  { image: "urun-02-kirma-1kg", name: "Doğal Kırma Yeşil Zeytin", size: "1 kg kavanoz", sizes: "(max-width: 767px) 28vw, (max-width: 1280px) 15vw, 180px" },
  { image: "urun-04-yag-1l", name: "Natürel Sızma Zeytinyağı", size: "1 L şişe", sizes: "(max-width: 767px) 28vw, (max-width: 1280px) 15vw, 180px" },
];

export function DealershipPage(): JSX.Element {
  return <main className={`${classic.root} ${styles.root}`}>
    <section aria-labelledby="bayilik-title" className={`${classic.hero} ${styles.hero}`} data-surface="dark" data-storefront-hero>
      <V3Picture image={photos.assets.zeytinlik} mobile={photos.assets["zeytin-dali"]} sizes="(max-width: 767px) 100vw, (max-width: 1100px) 1280px, 100vw" eager className={classic.heroPhoto} data-hero-photo />
      <div className={`${classic.container} ${styles.heroContent}`}>
        <div className={classic.heroCopy}>
          <p className={classic.eyebrow} data-hero-enter="eyebrow">BAYİLİK</p>
          <h1 id="bayilik-title" data-hero-enter="title">Bayimiz Olun</h1>
          <p data-hero-enter="description">AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p>
          <div className={classic.actions} data-hero-enter="actions">
            <a href="#basvuru" className={classic.goldButton}>Başvuru Formu<ArrowRight size={18} aria-hidden="true" /></a>
            <Link href="/#urunler" className={classic.outlineButton}>Ürünleri İncele<ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="bayilik-kimler-title" className={`${classic.container} ${styles.section}`}>
      <div className={styles.heading}>
        <p className={classic.eyebrow}>İŞ BİRLİĞİMİZ</p>
        <h2 id="bayilik-kimler-title">Kimler başvurabilir?</h2>
      </div>
      <div className={styles.profileGrid}>
        {businessProfiles.map(({ icon: Icon, title, description }) => <article key={title} className={styles.profile}>
          <Icon className={styles.icon} strokeWidth={1.25} aria-hidden="true" />
          <h3>{title}</h3>
          <p>{description}</p>
        </article>)}
      </div>
    </section>

    <section aria-labelledby="bayilik-neden-title" className={styles.facts}>
      <div className={`${classic.container} ${styles.factsGrid}`}>
        <div>
          <p className={classic.eyebrow}>ÜRETİMDEN İŞLETMENİZE</p>
          <h2 id="bayilik-neden-title">Neden AFİNA ZEYTİN?</h2>
          <ul className={styles.factList}>
            <li><Factory className={styles.icon} strokeWidth={1.25} aria-hidden="true" /><div><h3>Kendi tesisimizde hazırlanır</h3><p>Osmaniye Düziçi</p></div></li>
            <li><Leaf className={styles.icon} strokeWidth={1.25} aria-hidden="true" /><h3>Ellek zeytini, geleneksel doğal kırma</h3></li>
            <li><Package className={styles.icon} strokeWidth={1.25} aria-hidden="true" /><h3>3 L teneke, 1 kg kavanoz ve zeytinyağı seçenekleri</h3></li>
            <li><Truck className={styles.icon} strokeWidth={1.25} aria-hidden="true" /><h3>Koli bazında sipariş</h3></li>
          </ul>
        </div>
        <div className={styles.packaging}>
          {packaging.map(({ image, name, size, sizes }) => <figure key={image}>
            <V3Picture image={v3Image(image)} sizes={sizes} />
            <figcaption><span>{name}</span><strong>{size}</strong></figcaption>
          </figure>)}
        </div>
      </div>
    </section>

    <section aria-labelledby="bayilik-surec-title" className={`${classic.container} ${styles.section}`}>
      <div className={styles.heading}>
        <p className={classic.eyebrow}>BAŞVURUDAN İŞ BİRLİĞİNE</p>
        <h2 id="bayilik-surec-title">Başvuru nasıl ilerler?</h2>
      </div>
      <ol className={styles.steps}>
        {steps.map(({ title, description }, index) => <li key={title}>
          <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
          <div><h3>{title}</h3><p>{description}</p></div>
        </li>)}
      </ol>
    </section>

    <section id="basvuru" aria-labelledby="basvuru-title" className={styles.application}>
      <div className={styles.formContainer}>
        <div className={styles.heading}>
          <p className={classic.eyebrow}>BİZE YAZIN</p>
          <h2 id="basvuru-title">Bayilik Başvuru Formu</h2>
          <p>Bilgilerinizle bir e-posta taslağı hazırlayın. Başvurunuzu e-posta uygulamanızdan gönderebilirsiniz.</p>
        </div>
        <DealershipForm />
      </div>
    </section>
  </main>;
}
