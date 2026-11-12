import Link from "next/link";
import type { JSX } from "react";
import { Droplets, Factory, Leaf, ListChecks, MapPin, Package, Sprout, Warehouse } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { StoreFaq as Faq } from "./StoreFaq";
import media from "@/lib/media/customer-home.json";
import { seller } from "@/lib/site/seller";
import { siteContact } from "@/lib/site/contact";
import { Medallion } from "@/components/storefront/ui/Medallion";
import { PagePath } from "@/components/storefront/ui/PageBand";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { SectionHeading } from "@/components/storefront/ui/SectionHeading";
import { Stamp } from "@/components/storefront/ui/Stamp";
import { AboutStrip } from "./AboutStrip";
import styles from "./AboutPage.module.css";

const values = [
  { icon: Sprout, title: "Geleneksel Üretim", text: "Nesilden nesile aktarılan bilgi ve tecrübe" },
  { icon: Leaf, title: "Ellek zeytini", text: "Ürünün yetiştiği yerle bağımızı koruyoruz" },
  { icon: Factory, title: "Kendi Tesisimizde", text: "Ayıklama, salamura ve paketleme tek çatı altında" },
];

const stageIcons = [ListChecks, Droplets, Package, Warehouse] as const;

/** Public company details and approved customer images, with no new claims. */
export function AboutPage(): JSX.Element {
  const phone = siteContact.phone.trim();
  const email = siteContact.email.trim();
  return <main className={styles.root}>
    <header className={`${styles.container} ${styles.pageHeader}`}>
      <PagePath steps={[{ name: "Ana Sayfa", href: "/" }, { name: "Hakkımızda" }]} />
      <SectionHeading as="h1" title="Hakkımızda" lead="Kökü toprakta. Yeri sofrada." />
    </header>
    <section data-about-story className={`${styles.container} ${styles.story}`} aria-labelledby="hikayemiz-title">
      <div data-about-arch className={styles.archFrame}>
        <V3Picture image={media.assets.fabrika} sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1312px) 40vw, 520px" eager className={styles.arch} />
        {/* The page's one stamp (docs/DESIGN.md → Mühür): the customer's permitted claim, still. */}
        <div className={styles.stamp}><Stamp label="%100 Doğal ve Katkısız" size={112} /></div>
      </div>
      <div className={styles.storyCopy}><h2 id="hikayemiz-title">Ellek&apos;ten sofranıza</h2>
        <p>AFİNA ZEYTİN, AFİNA Şirketler Topluluğu&apos;nun zeytin ve zeytinyağı markasıdır. Osmaniye&apos;nin Düziçi ilçesindeki Ellek&apos;te, kendi tesisimizde hazırladığımız ürünleri bireysel ve toptan alıcılarla buluşturuyoruz.</p>
        <p>Doğal kırma zeytinlerimizi geleneksel usulle hazırlıyoruz. Kendi tesisimizde ayıklamadan paketlemeye uzanan üretim sürecini takip ediyoruz.</p>
        <div className={styles.actions}><PillButton href="/urunler">Ürünleri İnceleyin</PillButton><a href="https://afina.com.tr" target="_blank" rel="noopener noreferrer" className={styles.textLink}>AFİNA Şirketler Topluluğu</a></div>
      </div>
    </section>
    <AboutStrip />
    <section id="tesisimiz" data-about-facility className={styles.facility} aria-labelledby="tesisimiz-title"><div className={styles.container}>
      <h2 id="tesisimiz-title">Modern Üretim Tesisimiz</h2>
      <p className={styles.facilityIntro}>Zeytin ayıklama, salamura, paketleme ve depolama süreçlerini Osmaniye Düziçi&apos;ndeki kendi tesisimizde gerçekleştiriyoruz.</p>
      <ul className={styles.processes}>{[
        ["Ayıklama", "Zeytinler kendi tesisimizde ayıklanır."],
        ["Salamura", "Salamura zeytinler geleneksel usulle hazırlanır."],
        ["Paketleme", "Ürünler kendi tesisimizde paketlenir."],
        ["Depolama", "Depolama süreci kendi tesisimizde yürütülür."],
      ].map(([title, text], index) => <li key={title}><Medallion icon={stageIcons[index]} /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ul>
    </div></section>
    <section aria-label="Üretim anlayışımız" data-about-values className={`${styles.container} ${styles.values}`}><ul>{values.map(({ icon, title, text }) => <li key={title}><Medallion icon={icon} /><div><strong>{title}</strong><p>{text}</p></div></li>)}</ul></section>
    <div className={`${styles.container} ${styles.faq}`}><Faq canonicalPath="/hakkimizda" /></div>
    <section id="iletisim" aria-labelledby="iletisim-title" className={styles.contact}><div className={`${styles.container} ${styles.contactGrid}`}>
      <div><h2 id="iletisim-title">Sofrada görüşürüz.</h2><p>Kökü toprakta. Yeri sofrada.</p><PillButton variant="quiet" href="/urunler">Ürünlere dön</PillButton></div>
      <div><h3>AFİNA ZEYTİN</h3><div className={styles.address}><MapPin size={22} aria-hidden="true" /><address>{seller.address}</address></div>
        {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
        {email && <a href={`mailto:${email}`}>{email}</a>}
        <a href="https://www.google.com/maps/search/?api=1&query=Afina+Zeytin+Ellek+D%C3%BCzi%C3%A7i+Osmaniye" target="_blank" rel="noopener noreferrer">Yol tarifi alın</a>
        <a href="https://afina.com.tr/#iletisim" target="_blank" rel="noopener noreferrer">AFİNA Şirketler Topluluğu iletişim bilgileri</a>
        <nav aria-label="Alışveriş ve destek bilgileri"><Link prefetch={false} href="/siparis-takip">Sipariş takibi</Link><Link prefetch={false} href="/iade">Teslimat ve iade bilgileri</Link><Link prefetch={false} href="/mesafeli-satis">Satış koşulları</Link></nav>
      </div>
    </div></section>
  </main>;
}
