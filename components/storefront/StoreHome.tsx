import Link from 'next/link';
import { Factory, Hand, Leaf, PackageCheck, Sprout } from 'lucide-react';
import { V3Picture } from '@/components/media/V3Picture';
import { blogPosts } from '@/lib/blog/posts';
import customerMedia from '@/lib/media/customer-home.json';
import photos from '@/lib/media/classic-photos.json';
import type { ProductVariant } from '@/types/catalog';
import { HeroVideo } from './HeroVideo';
import { ProductTile } from './ProductTile';
import { QuietMotion } from './ui/QuietMotion';
import { homeMedia } from './home-media';
import styles from './StoreHome.module.css';

const categories = [
  { title: 'Zeytinyağı', href: '/urunler/zeytinyagi', label: 'Ürünleri İnceleyin', image: homeMedia.oil },
  { title: 'Zeytin', href: '/urunler/zeytin', label: 'Ürünleri İnceleyin', image: homeMedia.olive },
  { title: 'Tesisimiz', href: '/hakkimizda', label: 'Hakkında Bilgi Alın', image: homeMedia.factory },
  { title: 'Bayilik', href: '/bayilik', label: 'Hakkında Bilgi Alın', image: homeMedia.branch },
];

function ProductShelf({ products, featured = false }: { products: readonly ProductVariant[]; featured?: boolean }) {
  const chosen = (featured ? [...products].reverse() : products).slice(0, 4);
  return <section id={featured ? 'one-cikanlar' : 'urunler'} data-home-section={featured ? 'featured' : 'products'} data-product-layout={featured ? 'paired' : 'shelf'} className={`${styles.container} ${styles.products} ${featured ? styles.featured : ''}`} aria-labelledby={featured ? 'featured-title' : 'products-title'}>
    <div className={styles.productIntro}><h2 id={featured ? 'featured-title' : 'products-title'}>{featured ? 'Öne Çıkan Ürünler' : 'Sofranıza AFİNA'}</h2><p>{featured ? 'Kavanozdan tenekeye, sofranıza uygun boyu seçin.' : 'Kendi tesisimizde hazırlanan zeytin ve zeytinyağlarımız.'}</p></div>
    <div className={styles.shelf}>{chosen.map(product => <ProductTile key={product.id} product={product} />)}</div>
    {chosen.length === 0 && <p role="status">Görüntülenecek ürün bulunmuyor.</p>}
    <Link href="/urunler" className={styles.textLink}>Tüm Ürünler</Link>
    {!featured && <p className={styles.note}>Ürün görselleri temsili görseldir.</p>}
  </section>;
}

export function StoreHome({ products }: { products: readonly ProductVariant[] }) {
  return <>
    <link rel="preload" as="image" href={customerMedia.hero.posters.outputs.find(image => image.format === 'avif')?.file} type="image/avif" imageSrcSet={customerMedia.hero.posters.outputs.filter(image => image.format === 'avif').map(image => `${image.file} ${image.width}w`).join(', ')} imageSizes="100vw" fetchPriority="high" />
    <section id="baslangic" data-home-section="hero" className={styles.hero} aria-labelledby="hero-title">
      <HeroVideo />
      <QuietMotion entrance className={styles.heroCopy}><h1 id="hero-title">Kökü toprakta. Yeri sofrada.</h1><Link className={styles.primary} href="/urunler">Ürünleri İnceleyin</Link></QuietMotion>
      <p className={styles.origin}>Ellek, Düziçi / Osmaniye</p>
    </section>
    <section data-home-section="categories" data-home-categories data-category-layout="portals" className={`${styles.container} ${styles.categories}`} aria-label="Ürünler ve AFİNA">
      <span id="kiler" className={styles.anchor} />
      {categories.map(({title,href,label,image},i)=><Link href={href} key={title} className={`${styles.category} ${i > 1 ? styles.categorySmall : ''}`} data-group-photo-link data-home-category={href.split('/').at(-1)}>
        <V3Picture image={image} sizes={i > 1 ? '(max-width: 767px) 96px, 160px' : '(max-width: 767px) 90vw, 44vw'} decorative />
        <div><h2>{title}</h2><span>{label}</span></div>
      </Link>)}
    </section>
    <ProductShelf products={products} />
    <section id="hakkimizda" data-home-section="story" className={styles.story} aria-labelledby="story-title">
      <span id="kurumsal" className={styles.anchor} />
      <QuietMotion className={styles.container}>
        <div className={styles.storyIntro}><div><h2 id="story-title">Nesillerin Emeği,<br />Toprağın Bereketi</h2></div><div><p>AFİNA ZEYTİN, Osmaniye Düziçi&apos;nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisinde hazırlayıp sofralara ulaştırır.</p><Link href="/hakkimizda" className={`${styles.primary} ${styles.secondary}`}>Hakkımızda</Link></div></div>
        <V3Picture image={homeMedia.story} sizes="(max-width: 1439px) 94vw, 1312px" className={styles.storyPhoto} />
        <ul className={styles.values} data-story-values>{[{icon:Sprout,label:'Geleneksel Üretim'},{icon:Leaf,label:'%100 Doğal'},{icon:Factory,label:'Kendi Tesisimizde'}].map(({icon:Icon,label})=><li key={label}><Icon aria-hidden="true" strokeWidth={1.4}/><strong>{label}</strong></li>)}</ul>
      </QuietMotion>
    </section>
    <ProductShelf products={products} featured />
    <section id="tesisimiz" data-home-section="banners" data-banner-layout="triptych" className={styles.container} aria-label="AFİNA'da üretim">
      <span id="uretim-yolculugu" className={styles.anchor} />
      <QuietMotion className={styles.banners}>{[{title:'Tesisimiz',href:'/hakkimizda',image:homeMedia.factory},{title:'Her Tanede Aynı Özen',href:'/urunler/zeytin',image:homeMedia.care},{title:'Zeytinyağı',href:'/urunler/zeytinyagi',image:homeMedia.oil}].map(item=><Link href={item.href} className={styles.banner} key={item.title}><V3Picture image={item.image} sizes="(max-width: 767px) 90vw, 40vw" decorative /><h2>{item.title}</h2></Link>)}</QuietMotion>
    </section>
    <section data-home-section="harvest" className={`${styles.container} ${styles.harvest}`} aria-labelledby="harvest-title"><div><h2 id="harvest-title">Bereketin <br />Hasat Vakti</h2><p>Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.</p><ul className={styles.steps} data-harvest-ledger>{[{icon:Hand,title:'Elle Hasat'},{icon:Leaf,title:'Doğal Dinlendirme'},{icon:PackageCheck,title:'Özenli Paketleme'},{icon:Sprout,title:'%100 Doğal ve Katkısız'}].map(({icon:Icon,title})=><li key={title}><Icon aria-hidden="true" strokeWidth={1.4}/><span>{title}</span></li>)}</ul><Link href="/hakkimizda" className={styles.primary}>Hikayemizi Keşfet</Link></div><V3Picture image={homeMedia.harvest} sizes="(max-width: 767px) 90vw, 42vw" className={styles.harvestPhoto}/></section>
    <section data-home-section="business" aria-label="Toptan satış ve bayilik" className={`${styles.container} ${styles.business}`}><article><h2>Toptan Satış</h2><p>Otel, restoran, market ve toplu tüketim için koli bazında teklif.</p><Link href="/toptan-satis" className={styles.textLink}>Teklif iste</Link></article><article><h2>Bayilik Başvurusu</h2><p>AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p><Link href="/bayilik" className={styles.textLink}>Bayilik Başvurusu</Link></article></section>
    <section data-home-section="blog" className={`${styles.container} ${styles.blog}`} aria-labelledby="blog-title"><div className={styles.blogIntro}><h2 id="blog-title">Zeytin Defteri</h2><Link href="/blog" className={styles.textLink}>Tüm yazılar</Link></div><div className={styles.posts}>{blogPosts.map(post=><Link href={`/blog/${post.slug}`} key={post.slug} className={styles.post}><V3Picture image={photos.assets[post.imageKey]} sizes="(max-width: 767px) 90vw, (max-width: 1100px) 44vw, 300px" decorative/><h3>{post.title}</h3><p>{post.excerpt}</p><span>Yazıyı oku</span></Link>)}</div></section>
  </>;
}
