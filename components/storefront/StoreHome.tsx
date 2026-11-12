import Link from 'next/link';
import { ArrowRight, Factory, Hand, Handshake, Leaf, Package, PackageCheck, Sprout } from 'lucide-react';
import { V3Picture } from '@/components/media/V3Picture';
import { blogCover } from '@/lib/blog/cover';
import { blogPosts } from '@/lib/blog/posts';
import customerMedia from '@/lib/media/customer-home.json';
import type { ProductVariant } from '@/types/catalog';
import { HeroVideo } from './HeroVideo';
import { HERO_POSTER_SIZES } from './hero-poster';
import { ProductTile } from './ProductTile';
import { Medallion } from './ui/Medallion';
import { OliveBranch } from './ui/OliveBranch';
import { PillButton } from './ui/PillButton';
import { QuietMotion } from './ui/QuietMotion';
import { SectionHeading } from './ui/SectionHeading';
import { Stamp } from './ui/Stamp';
import { homeMedia } from './home-media';
import styles from './StoreHome.module.css';

const SHELF_SIZE = 4;
const HARVEST_CLAIM = '%100 Doğal ve Katkısız';
// Square frames crop a 16:9 cover to its height: the rendition must be as wide as the picture, not the frame.
const POST_THUMBNAIL_SIZES = '(max-width: 767px) 200px, 288px';

const categories = [
  { title: 'Zeytinyağı', href: '/urunler/zeytinyagi', label: 'Ürünleri İnceleyin', image: homeMedia.oil },
  { title: 'Zeytin', href: '/urunler/zeytin', label: 'Ürünleri İnceleyin', image: homeMedia.olive },
  { title: 'Tesisimiz', href: '/hakkimizda', label: 'Hakkında Bilgi Alın', image: homeMedia.factory },
  { title: 'Bayilik', href: '/bayilik', label: 'Hakkında Bilgi Alın', image: homeMedia.branch },
];
const storyValues = [
  { icon: Sprout, label: 'Geleneksel Üretim' },
  { icon: Leaf, label: '%100 Doğal' },
  { icon: Factory, label: 'Kendi Tesisimizde' },
];
const banners = [
  { title: 'Tesisimiz', href: '/hakkimizda', image: homeMedia.factory },
  { title: 'Her Tanede Aynı Özen', href: '/urunler/zeytin', image: homeMedia.care },
  { title: 'Zeytinyağı', href: '/urunler/zeytinyagi', image: homeMedia.oil },
];
const harvestSteps = [
  { icon: Hand, title: 'Elle Hasat' },
  { icon: Leaf, title: 'Doğal Dinlendirme' },
  { icon: PackageCheck, title: 'Özenli Paketleme' },
];

function Coin({ className }: { className: string }) {
  return <span className={className} aria-hidden="true"><ArrowRight strokeWidth={1.8} /></span>;
}

function EmptyShelf() {
  return <p role="status" className={styles.empty}>Görüntülenecek ürün bulunmuyor.</p>;
}

export function StoreHome({ products }: { products: readonly ProductVariant[] }) {
  const shelf = products.slice(0, SHELF_SIZE);
  const featured = [...products].reverse().slice(0, SHELF_SIZE);
  const [leadPost, ...otherPosts] = blogPosts;
  return <>
    <link rel="preload" as="image" href={customerMedia.hero.posters.outputs.find(image => image.format === 'avif')?.file} type="image/avif" imageSrcSet={customerMedia.hero.posters.outputs.filter(image => image.format === 'avif').map(image => `${image.file} ${image.width}w`).join(', ')} imageSizes={HERO_POSTER_SIZES} fetchPriority="high" />

    <section id="baslangic" data-home-section="hero" className={styles.hero} aria-labelledby="hero-title">
      <HeroVideo />
      <div className={styles.heroShade} aria-hidden="true" />
      <QuietMotion entrance className={styles.heroCopy} overlay>
        <h1 id="hero-title">Kökü toprakta. <em>Yeri sofrada.</em></h1>
        <p className={styles.heroLead}>Toprağın sunduğu lezzet, Afina&apos;nın özeniyle.</p>
        <PillButton href="/urunler" variant="gold">Ürünleri İnceleyin</PillButton>
      </QuietMotion>
    </section>

    <section data-home-section="categories" data-home-categories data-category-layout="portals" className={`${styles.container} ${styles.portals}`} aria-label="Ürünler ve AFİNA">
      <span id="kiler" className={styles.anchor} />
      {categories.map(({ title, href, label, image }) => <Link prefetch={false} href={href} key={title} className={styles.portal} data-group-photo-link data-home-category={href.split('/').at(-1)}>
        <V3Picture image={image} sizes="(max-width: 359px) 92vw, (max-width: 1099px) 46vw, (max-width: 1375px) 23vw, 302px" decorative />
        <div className={styles.portalCopy} data-overlay-ok><h2>{title}</h2><span data-card-action>{label}</span></div>
        <Coin className={styles.portalCoin} />
      </Link>)}
    </section>

    <section id="urunler" data-home-section="products" data-product-layout="shelf" className={styles.products} aria-label="Sofranıza AFİNA">
      <div className={`${styles.container} ${styles.shelfGrid}`}>
        <div className={styles.shelfHead}><SectionHeading title="Sofranıza AFİNA" lead="Kendi tesisimizde hazırlanan zeytin ve zeytinyağlarımız." /></div>
        <div className={styles.shelfAll}><PillButton href="/urunler" variant="outline">Tüm Ürünler</PillButton></div>
        <div className={styles.shelf}>{shelf.map(product => <ProductTile key={product.id} product={product} />)}</div>
        {shelf.length === 0 && <EmptyShelf />}
        <p className={styles.note}>Ürün görselleri temsili görseldir.</p>
      </div>
    </section>

    <section id="hakkimizda" data-home-section="story" className={styles.story} aria-label="Hikayemiz">
      <span id="kurumsal" className={styles.anchor} />
      <QuietMotion className={`${styles.container} ${styles.storyGrid}`}>
        <div className={styles.storyPhotos}>
          <V3Picture image={homeMedia.story} sizes="(max-width: 1023px) 92vw, 560px" className={styles.storyPhoto} />
          <V3Picture image={homeMedia.storyDetail} sizes="(max-width: 1023px) 40vw, 240px" className={styles.storyInset} decorative />
        </div>
        <div className={styles.storyCopy}>
          <SectionHeading eyebrow="Hikayemiz" title="Nesillerin Emeği, Toprağın Bereketi" lead="AFİNA ZEYTİN, Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri kendi tesisinde hazırlayıp sofralara ulaştırır." />
          <PillButton href="/hakkimizda" variant="outline">Hakkımızda</PillButton>
          <ul className={styles.values} data-story-values>{storyValues.map(({ icon, label }) => <li key={label}><Medallion icon={icon} /><strong>{label}</strong></li>)}</ul>
        </div>
      </QuietMotion>
    </section>

    <section id="one-cikanlar" data-home-section="featured" data-product-layout="paired" data-tone="dark" className={styles.featured} aria-label="Öne Çıkan Ürünler">
      <div className={styles.container}>
        <div className={styles.featuredHead}>
          <SectionHeading tone="dark" title="Öne Çıkan Ürünler" lead="Kavanozdan tenekeye, sofranıza uygun boyu seçin." />
          <PillButton href="/urunler" variant="gold">Tüm Ürünler</PillButton>
        </div>
        <div className={styles.pairs}>{featured.map(product => <ProductTile key={product.id} product={product} />)}</div>
        {featured.length === 0 && <EmptyShelf />}
      </div>
    </section>

    <section id="tesisimiz" data-home-section="banners" data-banner-layout="triptych" className={`${styles.container} ${styles.triptych}`} aria-label="AFİNA'da üretim">
      <span id="uretim-yolculugu" className={styles.anchor} />
      <QuietMotion className={styles.banners}>
        {banners.map(item => <Link prefetch={false} href={item.href} className={styles.banner} key={item.title}>
          <V3Picture image={item.image} sizes="(max-width: 767px) 92vw, (max-width: 1375px) 31vw, 410px" decorative />
          <h2 data-overlay-ok>{item.title}</h2>
          <Coin className={styles.bannerCoin} />
        </Link>)}
      </QuietMotion>
    </section>

    <section data-home-section="harvest" className={`${styles.container} ${styles.harvest}`} aria-label="Bereketin Hasat Vakti">
      <div className={styles.harvestCopy}>
        <SectionHeading eyebrow="Ellek zeytinlikleri" title="Bereketin Hasat Vakti" lead="Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür." />
        <ul className={styles.steps} data-harvest-ledger>
          {harvestSteps.map(({ icon, title }) => <li key={title}><Medallion icon={icon} /><span data-step-label>{title}</span></li>)}
          {/* The seal names the claim for assistive technology; the same words beside it stay visual. */}
          <li className={styles.sealed}><Stamp label={HARVEST_CLAIM} size={128} /><span data-step-label aria-hidden="true">{HARVEST_CLAIM}</span></li>
        </ul>
        <PillButton href="/hakkimizda">Hikayemizi Keşfet</PillButton>
      </div>
      <div className={styles.harvestArt}><V3Picture image={homeMedia.harvest} sizes="(max-width: 767px) 86vw, (max-width: 1375px) 40vw, 520px" className={styles.harvestPhoto} /></div>
    </section>

    <section data-home-section="business" aria-label="Toptan satış ve bayilik" className={styles.business}>
      <div className={`${styles.container} ${styles.businessGrid}`}>
        <OliveBranch className={styles.businessBranch} />
        <article>
          <Medallion icon={Package} />
          <h2>Toptan Satış</h2>
          <p>Otel, restoran, market ve toplu tüketim için koli bazında teklif.</p>
          <PillButton href="/toptan-satis">Teklif İste</PillButton>
        </article>
        <article>
          <Medallion icon={Handshake} />
          <h2>Bayilik Başvurusu</h2>
          <p>AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p>
          <PillButton href="/bayilik" variant="outline">Bayilik Başvurusu</PillButton>
        </article>
      </div>
    </section>

    <section data-home-section="blog" className={styles.blog} aria-label="Zeytin Defteri">
      <div className={styles.container}>
        <div className={styles.blogHead}><SectionHeading title="Zeytin Defteri" /><PillButton variant="quiet" href="/blog">Tüm yazılar</PillButton></div>
        <div className={styles.posts}>
          <Link prefetch={false} href={`/blog/${leadPost.slug}`} className={styles.leadPost}>
            <V3Picture image={blogCover(leadPost)} sizes="(max-width: 1023px) 92vw, 620px" decorative />
            <div><h3>{leadPost.title}</h3><p>{leadPost.excerpt}</p><span className={styles.readTime}>{leadPost.readingMinutes} dk okuma</span></div>
          </Link>
          <div className={styles.morePosts}>{otherPosts.map(post => <Link prefetch={false} href={`/blog/${post.slug}`} key={post.slug} className={styles.post}>
            <V3Picture image={blogCover(post)} sizes={POST_THUMBNAIL_SIZES} decorative />
            <div><h3>{post.title}</h3><span className={styles.readTime}>{post.readingMinutes} dk okuma</span></div>
          </Link>)}</div>
        </div>
      </div>
    </section>
  </>;
}
