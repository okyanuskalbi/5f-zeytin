import type { JSX } from "react";
import Link from "next/link";
import { ArrowRight, Factory, Hand, Leaf, PackageCheck, ShieldCheck, Sprout } from "lucide-react";
import { V3Picture } from "@/components/media/V3Picture";
import { ProductCard } from "@/components/catalog/ProductCard";
import { BrandLogo } from "@/components/site/BrandLogo";
import { v3Image, type V3Image } from "@/lib/media/v3-assets";
import photos from "@/lib/media/classic-photos.json";
import media from "@/lib/media/customer-home.json";
import { blogPosts } from "@/lib/blog/posts";
import type { ProductVariant } from "@/types/catalog";
import styles from "./CustomerHome.module.css";
import classic from "./ClassicHome.module.css";

const storyImage = photos.assets.zeytinlik;
const oilImage = photos.assets.zeytinyagi;
const values = [
  { icon: Sprout, title: "Geleneksel Üretim", text: "Nesilden nesile aktarılan bilgi ve tecrübe" },
  { icon: Leaf, title: "%100 Doğal", text: "Katkı maddesi içermez" },
  { icon: Factory, title: "Kendi Tesisimizde", text: "Ayıklama, salamura ve paketleme tek çatı altında" },
];

function BranchLine(): JSX.Element {
  return <span className={styles.branchLine} aria-hidden="true"><i /><b /></span>;
}

export function HomeCategories(): JSX.Element {
  const items: { title: string; label: string; href: string; image: V3Image }[] = [
    { title: "Zeytinyağı", label: "Ürünleri İnceleyin", href: "/urunler/zeytinyagi", image: oilImage },
    { title: "Zeytin", label: "Ürünleri İnceleyin", href: "/urunler/zeytin", image: photos.assets["siyah-zeytin"] },
    { title: "Tesisimiz", label: "Hakkında Bilgi Alın", href: "/hakkimizda", image: media.assets.fabrika },
    { title: "Bayilik", label: "Hakkında Bilgi Alın", href: "/bayilik", image: photos.assets["zeytin-dali"] },
  ];
  return <section data-home-section="categories" data-home-categories data-category-layout="index" aria-label="AFİNA'yı keşfedin" className={`${styles.container} ${styles.categories}`}>
    <span id="kiler" className={classic.anchor} aria-hidden="true" />
    {items.map(item => <Link key={item.title} href={item.href} className={styles.category} data-group-photo-link data-home-category={item.href.split("/").at(-1)}>
      <V3Picture image={item.image} sizes="(max-width: 767px) 112px, 160px" decorative />
      <div className={styles.categoryCopy}><h2>{item.title}</h2><span>{item.label}<ArrowRight size={17} aria-hidden="true" /></span></div>
      <BranchLine />
    </Link>)}
  </section>;
}

export function HomeProductGrid({ products, featured = false }: { products: readonly ProductVariant[]; featured?: boolean }): JSX.Element {
  const chosen = (featured ? [...products].reverse() : products).slice(0, 4);
  return <section id={featured ? "one-cikanlar" : "urunler"} data-home-section={featured ? "featured" : "products"} data-product-layout="asymmetric" className={`${styles.container} ${styles.section} ${styles.productSection} ${featured ? styles.featuredSection : ""}`} aria-labelledby={featured ? "featured-title" : "urunler-title"}>
    <header className={styles.sectionHeader}><div><h2 id={featured ? "featured-title" : "urunler-title"}>{featured ? "Öne Çıkan Ürünler" : "Sofranız İçin Seçtiklerimiz"}</h2><p>Kendi tesisimizde hazırlanan zeytin ve zeytinyağlarımız.</p></div><Link href="/urunler" className={styles.textButton}>Tüm Ürünler<ArrowRight size={18} aria-hidden="true" /></Link></header>
    <div className={styles.productGrid}>{chosen.map((product, index) => <ProductCard key={product.id} product={product} image={v3Image(product.imageKey)} staticPresentation featured={false} index={index} imageSizes="(max-width: 767px) 76vw, (max-width: 1023px) 44vw, 580px" quoteAction={<Link href={`/toptan-satis?teklif=${encodeURIComponent(product.id)}`} className={styles.quoteLink} aria-label={`Teklife ekle: ${product.name}, ${product.weight}`}>Teklife ekle<ArrowRight size={16} aria-hidden="true" /></Link>} />)}</div>
    {chosen.length === 0 && <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
  </section>;
}

export function HomeStory(): JSX.Element {
  return <section id="hakkimizda" data-home-section="story" className={styles.storySurface} aria-labelledby="hikayemiz-title"><div className={`${styles.container} ${styles.story}`}>
    <span id="kurumsal" className={classic.anchor} aria-hidden="true" />
    <div className={styles.storyCopy}><h2 id="hikayemiz-title">Hikayemiz</h2><h3>Nesillerin Emeği,<br />Toprağın Bereketi</h3><p>AFİNA ZEYTİN, Osmaniye Düziçi&apos;nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisinde hazırlayıp sofralara ulaştırır.</p><Link href="/hakkimizda" className={styles.goldButton}>Hikayemizi Keşfet<ArrowRight size={18} aria-hidden="true" /></Link></div>
    <V3Picture image={storyImage} sizes="(max-width: 767px) calc(100vw - 40px), 56vw" className={styles.storyPhoto} />
    <ul className={styles.values} data-story-values>{values.map(({ icon: Icon, title, text }) => <li key={title}><Icon size={29} strokeWidth={1.3} aria-hidden="true" /><div><strong>{title}</strong><p>{text}</p></div></li>)}</ul>
  </div></section>;
}

export function HomeBanners(): JSX.Element {
  const items = [
    { title: "Tesisimiz", href: "/hakkimizda", image: media.assets.fabrika },
    { title: "Her Tanede Aynı Özen", href: "/urunler/zeytin", image: media.assets["her-tanede-ayni-ozen-el"] },
    { title: "Zeytinyağı", href: "/urunler/zeytinyagi", image: oilImage },
  ];
  return <section id="tesisimiz" data-home-section="banners" data-banner-layout="mosaic" aria-label="Üretimden sofraya" className={`${styles.container} ${styles.banners}`}>
    <span id="uretim-yolculugu" className={classic.anchor} aria-hidden="true" />
    {items.map((item, index) => <Link key={item.title} href={item.href} data-banner-lead={index === 0 ? "" : undefined} className={`${styles.banner} ${index === 0 ? styles.bannerLead : ""}`}><V3Picture image={item.image} sizes="(max-width: 767px) 90vw, 56vw" /><div><h2>{item.title}</h2><span className={styles.bannerArrow}><ArrowRight size={22} aria-hidden="true" /></span></div></Link>)}
  </section>;
}

export function HomeHarvest(): JSX.Element {
  const steps = [
    { icon: Hand, title: "Elle Hasat", text: "Zeytinler olgunluk zamanında, dallar incitilmeden toplanır." },
    { icon: Leaf, title: "Doğal Dinlendirme", text: "Zeytinler salamurada acele edilmeden dinlendirilir." },
    { icon: PackageCheck, title: "Özenli Paketleme", text: "Kendi tesisimizde hijyenik koşullarda paketlenir." },
    { icon: ShieldCheck, title: "%100 Doğal ve Katkısız", text: "Katkı maddesi eklenmez." },
  ];
  return <section data-home-section="harvest" className={styles.harvestSurface} aria-labelledby="hasat-title"><div className={`${styles.container} ${styles.harvest}`}><div className={styles.harvestCopy}><BranchLine /><h2 id="hasat-title">Bereketin Hasat Vakti</h2><p>Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.</p><ul className={styles.steps} data-harvest-ledger>{steps.map(({ icon: Icon, title, text }) => <li key={title}><Icon size={27} strokeWidth={1.25} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ul><Link href="/hakkimizda" className={styles.goldButton}>Hikayemizi Keşfet<ArrowRight size={18} aria-hidden="true" /></Link></div><V3Picture image={media.assets["bereketin-hasat-vakti"]} sizes="(max-width: 767px) calc(100vw - 40px), 42vw" className={styles.harvestPhoto} /></div></section>;
}

export function HomeBusiness(): JSX.Element {
  return <section data-home-section="business" aria-label="Toptan satış ve bayilik" className={`${styles.container} ${styles.business}`}>
    <article><Factory size={34} strokeWidth={1.25} aria-hidden="true" /><div><h2>Toptan Satış</h2><p>Otel, restoran, market ve toplu tüketim için koli bazında teklif.</p></div><Link href="/toptan-satis" className={styles.textButton}>Toptan Teklif Al<ArrowRight size={18} aria-hidden="true" /></Link></article>
    <article><Sprout size={34} strokeWidth={1.25} aria-hidden="true" /><div><h2>Bayilik Başvurusu</h2><p>AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p></div><Link href="/bayilik" className={styles.textButton}>Bayilik Başvurusu<ArrowRight size={18} aria-hidden="true" /></Link></article>
  </section>;
}

export function HomeBlog(): JSX.Element {
  return <section data-home-section="blog" className={`${styles.container} ${styles.section} ${styles.blogSection}`} aria-labelledby="blog-title"><header className={styles.sectionHeader}><div><h2 id="blog-title">Zeytin Defteri</h2><p>Zeytin ve zeytinyağını tanımak, sofranızda özenle saklamak için.</p></div><Link href="/blog" className={styles.textButton}>Tüm Yazıları Gör<ArrowRight size={18} aria-hidden="true" /></Link></header><div className={styles.blogGrid}>{blogPosts.slice(0, 3).map(post => <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.blogCard}><V3Picture image={photos.assets[post.imageKey]} sizes="(max-width: 767px) 112px, 190px" decorative /><div><span className={styles.blogMeta}>Zeytin Defteri</span><h3>{post.title}</h3><p>{post.excerpt}</p></div><span className={styles.textLink}>Devamını oku<ArrowRight size={17} aria-hidden="true" /></span></Link>)}</div></section>;
}

export function HomeTrust(): JSX.Element {
  return <div data-home-section="trust" data-signature="dal-ve-etiket" className={styles.signature}><div className={styles.container}><BrandLogo tone="dark" loading="lazy" className={styles.signatureLogo} /><BranchLine /><p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p><span>Ellek, Düziçi / Osmaniye</span></div></div>;
}
