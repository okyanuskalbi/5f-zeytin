import type { JSX } from "react";
import Link from "next/link";
import { ArrowRight, Factory, Leaf, PackageCheck, ShieldCheck, Sprout } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductCard } from "@/components/catalog/ProductCard";
import { v3Image, type V3Image } from "@/lib/media/v3-assets";
import photos from "@/lib/media/classic-photos.json";
import media from "@/lib/media/customer-home.json";
import { blogPosts } from "@/lib/blog/posts";
import type { ProductVariant } from "@/types/catalog";
import styles from "./CustomerHome.module.css";
import classic from "./ClassicHome.module.css";

// The two pending customer images have one approved, replaceable fallback each.
const storyImage = photos.assets.zeytinlik;
const oilImage = photos.assets.zeytinyagi;
const values = [
  { icon: Sprout, title: "Geleneksel Üretim", text: "Nesilden nesile aktarılan bilgi ve tecrübe" },
  { icon: Leaf, title: "%100 Doğal", text: "Katkı maddesi içermez" },
  { icon: Factory, title: "Kendi Tesisimizde", text: "Ayıklama, salamura ve paketleme tek çatı altında" },
];

export function HomeCategories(): JSX.Element {
  const items: { title: string; label: string; href: string; image: V3Image }[] = [
    { title: "Zeytinyağı", label: "Ürünleri İnceleyin", href: "/urunler/zeytinyagi", image: oilImage },
    { title: "Zeytin", label: "Ürünleri İnceleyin", href: "/urunler/zeytin", image: photos.assets["siyah-zeytin"] },
    { title: "Tesisimiz", label: "Hakkında Bilgi Alın", href: "/hakkimizda", image: media.assets.fabrika },
    { title: "Bayilik", label: "Hakkında Bilgi Alın", href: "/bayilik", image: photos.assets["zeytin-dali"] },
  ];
  return <section data-home-section="categories" data-home-categories aria-label="AFİNA'yı keşfedin" className={`${styles.container} ${styles.categories}`}>
    <span id="kiler" className={classic.anchor} aria-hidden="true" />
    {items.map(item => <Link key={item.title} href={item.href} className={styles.category} data-group-photo-link data-home-category={item.href.split("/").at(-1)}>
      <V3Picture image={item.image} sizes="(max-width: 767px) 42vw, 240px" decorative />
      <h2>{item.title}</h2><span>{item.label}<ArrowRight size={16} aria-hidden="true" /></span>
    </Link>)}
  </section>;
}

export function HomeProductGrid({ products, featured = false }: { products: readonly ProductVariant[]; featured?: boolean }): JSX.Element {
  const chosen = (featured ? [...products].reverse() : products).slice(0, 4);
  return <section id={featured ? "one-cikanlar" : "urunler"} data-home-section={featured ? "featured" : "products"} className={`${styles.container} ${styles.section}`} aria-labelledby={featured ? "featured-title" : "urunler-title"}>
    <header className={styles.sectionHeader}><div><p className={classic.eyebrow}>{featured ? "AFİNA SEÇKİSİ" : "ÜRÜNLERİMİZ"}</p><h2 id={featured ? "featured-title" : "urunler-title"}>{featured ? "Öne Çıkan Ürünler" : "Sofranız İçin Seçtiklerimiz"}</h2><p>Kendi tesisimizde hazırlanan zeytin ve zeytinyağlarımız.</p></div><Link href="/urunler" className={styles.outlineButton}>Tüm Ürünler<ArrowRight size={18} aria-hidden="true" /></Link></header>
    <div className={styles.productGrid}>{chosen.map((product, index) => <ProductCard key={product.id} product={product} image={v3Image(product.imageKey)} staticPresentation featured={false} index={index} imageSizes="(max-width: 359px) 85vw, (max-width: 767px) 42vw, (max-width: 1023px) 44vw, 280px" quoteAction={<Link href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`} className={styles.quoteLink} aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}>Teklife ekle<ArrowRight size={16} aria-hidden="true" /></Link>} />)}</div>
    {chosen.length === 0 && <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
  </section>;
}

export function HomeStory(): JSX.Element {
  return <section id="hakkimizda" data-home-section="story" className={styles.storySurface} aria-labelledby="hikayemiz-title"><div className={`${styles.container} ${styles.story}`}>
    <span id="kurumsal" className={classic.anchor} aria-hidden="true" />
    <V3Picture image={storyImage} sizes="(max-width: 767px) 90vw, 44vw" className={styles.storyPhoto} />
    <div className={styles.storyCopy}><p className={classic.eyebrow}>TOPRAKTAN SOFRAYA</p><h2 id="hikayemiz-title">Hikayemiz</h2><h3>Nesillerin Emeği,<br />Toprağın Bereketi</h3><p>AFİNA ZEYTİN, Osmaniye Düziçi&apos;nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisinde hazırlayıp sofralara ulaştırır.</p><Link href="/hakkimizda" className={styles.goldButton}>Hakkımızda<ArrowRight size={18} aria-hidden="true" /></Link>
      <ul className={styles.values}>{values.map(({ icon: Icon, title, text }) => <li key={title}><Icon size={32} strokeWidth={1.3} aria-hidden="true" /><div><strong>{title}</strong><p>{text}</p></div></li>)}</ul>
    </div>
  </div></section>;
}

export function HomeBanners(): JSX.Element {
  const items = [
    { title: "Tesisimiz", href: "/hakkimizda", image: media.assets.fabrika },
    { title: "Her Tanede Aynı Özen", href: "/urunler/zeytin", image: media.assets["her-tanede-ayni-ozen-el"] },
    { title: "Zeytinyağı", href: "/urunler/zeytinyagi", image: oilImage },
  ];
  return <section id="tesisimiz" data-home-section="banners" aria-label="Üretimden sofraya" className={`${styles.container} ${styles.banners}`}>
    <span id="uretim-yolculugu" className={classic.anchor} aria-hidden="true" />
    {items.map((item, index) => <Link key={item.title} href={item.href} className={styles.banner}><V3Picture image={item.image} sizes="(max-width: 767px) 90vw, 30vw" /><div><span className={styles.bannerNumber} aria-hidden="true">0{index + 1}</span><h2>{item.title}</h2><span className={styles.bannerAction}>Keşfedin<ArrowRight size={20} aria-hidden="true" /></span></div></Link>)}
  </section>;
}

export function HomeHarvest(): JSX.Element {
  const steps = [
    ["Elle Hasat", "Zeytinler olgunluk zamanında, dallar incitilmeden toplanır."],
    ["Doğal Dinlendirme", "Zeytinler salamurada acele edilmeden dinlendirilir."],
    ["Özenli Paketleme", "Kendi tesisimizde hijyenik koşullarda paketlenir."],
    ["%100 Doğal ve Katkısız", "Katkı maddesi eklenmez."],
  ];
  return <section data-home-section="harvest" className={`${styles.container} ${styles.harvest}`} aria-labelledby="hasat-title"><div><p className={classic.eyebrow}>TARLADAN SOFRAYA</p><h2 id="hasat-title">Bereketin Hasat Vakti</h2><p>Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.</p><ol className={styles.steps}>{steps.map(([title, text], index) => <li key={title}><span aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><Link href="/hakkimizda" className={styles.goldButton}>Hikayemizi Keşfet<ArrowRight size={18} aria-hidden="true" /></Link></div><V3Picture image={media.assets["bereketin-hasat-vakti"]} sizes="(max-width: 767px) 90vw, 42vw" className={styles.harvestPhoto} /></section>;
}

export function HomeBusiness(): JSX.Element {
  return <section data-home-section="business" aria-label="Toptan satış ve bayilik" className={`${styles.container} ${styles.business}`}>
    <article><Factory size={36} strokeWidth={1.25} aria-hidden="true" /><h2>Toptan Satış</h2><p>Otel, restoran, market ve toplu tüketim için koli bazında teklif.</p><Link href="/toptan-satis" className={styles.goldButton}>Toptan Teklif Al<ArrowRight size={18} aria-hidden="true" /></Link></article>
    <article><Sprout size={36} strokeWidth={1.25} aria-hidden="true" /><h2>Bayilik Başvurusu</h2><p>AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p><Link href="/bayilik" className={styles.outlineButton}>Bayilik Başvurusu<ArrowRight size={18} aria-hidden="true" /></Link></article>
  </section>;
}

export function HomeBlog(): JSX.Element {
  return <section data-home-section="blog" className={`${styles.container} ${styles.section}`} aria-labelledby="blog-title"><header className={styles.sectionHeader}><div><p className={classic.eyebrow}>BLOG</p><h2 id="blog-title">Zeytin Rehberi</h2><p>Zeytin ve zeytinyağını tanımak, sofranızda özenle saklamak için.</p></div><Link href="/blog" className={styles.outlineButton}>Tüm Yazıları Gör<ArrowRight size={18} aria-hidden="true" /></Link></header><div className={styles.blogGrid}>{blogPosts.slice(0, 3).map(post => <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.blogCard}><V3Picture image={photos.assets[post.imageKey]} sizes="(max-width: 767px) 90vw, 30vw" decorative /><div><span className={styles.blogMeta}>ZEYTİN REHBERİ</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className={styles.textLink}>Devamını oku<ArrowRight size={16} aria-hidden="true" /></span></div></Link>)}</div></section>;
}

export function HomeTrust(): JSX.Element {
  return <div data-home-section="trust" className={styles.trust}><ul className={styles.container}>{[{ icon: Factory, text: "Kendi Tesisimizde Üretim" }, { icon: PackageCheck, text: "Özenli Paketleme" }, { icon: ShieldCheck, text: "Güvenli Alışveriş" }].map(({ icon: Icon, text }) => <li key={text}><Icon size={28} strokeWidth={1.4} aria-hidden="true" /><span>{text}</span></li>)}</ul></div>;
}
