import { Suspense } from 'react';
import Link from 'next/link';
import { Factory, Hand, Handshake, Leaf, Mail, MapPin, Package, PackageCheck, Phone, Sprout } from 'lucide-react';
import { V3Picture } from '@/components/media/V3Picture';
import { blogCover } from '@/lib/blog/cover';
import { blogPosts } from '@/lib/blog/posts';
import { businessTypes, dealershipLimits, outletCountLabels, outletCounts } from '@/lib/dealership/application';
import customerMedia from '@/lib/media/customer-home.json';
import { corporateContact } from '@/lib/site/corporate-contact';
import { seller } from '@/lib/site/seller';
import type { ProductFamily } from '@/types/catalog';
import { StoreFaq } from './content/StoreFaq';
import { HeroVideo } from './HeroVideo';
import { HERO_POSTER_SIZES } from './hero-poster';
import { BusinessTabs } from './home/BusinessTabs';
import { DeferredDealershipForm } from './home/DeferredDealershipForm';
import { ProductShowcase } from './home/ProductShowcase';
import { SearchSync } from './home/SearchSync';
import { SectionReveal } from './home/SectionReveal';
import { homeMedia } from './home-media';
import { ProductTile } from './ProductTile';
import { QuoteComposer } from './quote/QuoteComposer';
import { QuoteJourneyProvider } from './quote/QuoteJourneyProvider';
import { QuoteQuerySelection } from './quote/QuoteQuerySelection';
import { Medallion } from './ui/Medallion';
import { OliveBranch } from './ui/OliveBranch';
import { PillButton } from './ui/PillButton';
import { SectionHeading } from './ui/SectionHeading';
import { Stamp } from './ui/Stamp';
import styles from './StoreHome.module.css';

const BLOG_CARD_COUNT = 3;
const NATURAL_CLAIM = '%100 Doğal ve Katkısız';
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Afina+Zeytin+Ellek+D%C3%BCzi%C3%A7i+Osmaniye';
const PRODUCT_IMAGE_SIZES = '(max-width: 359px) 80vw, (max-width: 1099px) 44vw, 380px';
// Phone frames are 112 px squares cut from a 16:9 cover: the rendition must be as wide as the picture, not the frame.
const POST_IMAGE_SIZES = '(max-width: 767px) 200px, (max-width: 1375px) 31vw, 410px';

const facilityPhotos = [
  { title: 'Tesisimiz', image: homeMedia.factory },
  { title: 'Her Tanede Aynı Özen', image: homeMedia.care },
  { title: 'Ellek zeytinlikleri', image: homeMedia.harvest },
];
const harvestSteps = [
  { icon: Hand, title: 'Elle Hasat' },
  { icon: Leaf, title: 'Doğal Dinlendirme' },
  { icon: PackageCheck, title: 'Özenli Paketleme' },
];
const dealershipSteps = [
  { title: 'Formu doldurun', description: 'Firma ve bölge bilgilerinizi girin. Hazırlanan taslağı e-posta uygulamanızdan gönderin.' },
  { title: 'Size dönüş yapalım', description: 'Başvurunuzu inceledikten sonra sizinle iletişime geçeriz.' },
  { title: 'Koşulları birlikte belirleyelim', description: 'Ürün, miktar ve sevkiyat planını birlikte netleştiririz.' },
];
const dealershipConfiguration = { businessTypes, outletCounts, outletCountLabels, dealershipLimits };

/** The whole storefront on one page (docs/tasks/208): hero, products, story, wholesale and dealership, articles, questions and contact. */
export function StoreHome({ families }: { families: readonly ProductFamily[] }) {
  const products = families.flatMap(family => family.variants.map(product => ({ product, group: family.groupId })))
    .sort((a, b) => a.product.imageKey.localeCompare(b.product.imageKey));
  const items = products.map(({ product, group }) => ({ id: product.id, groups: [group], tile: <ProductTile product={product} imageSizes={PRODUCT_IMAGE_SIZES} /> }));
  const variants = products.map(entry => entry.product);
  return <>
    <link rel="preload" as="image" href={customerMedia.hero.posters.outputs.find(image => image.format === 'avif')?.file} type="image/avif" imageSrcSet={customerMedia.hero.posters.outputs.filter(image => image.format === 'avif').map(image => `${image.file} ${image.width}w`).join(', ')} imageSizes={HERO_POSTER_SIZES} fetchPriority="high" />
    <Suspense fallback={null}><SearchSync /></Suspense>
    <SectionReveal />

    <section id="baslangic" data-landing-section="" data-home-section="hero" className={styles.hero} aria-labelledby="hero-title">
      <HeroVideo />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroCopy} data-overlay-ok="">
        <h1 id="hero-title">Kökü toprakta. <em>Yeri sofrada.</em></h1>
        <p className={styles.heroLead}>Toprağın sunduğu lezzet, Afina&apos;nın özeniyle.</p>
        <PillButton href="/#urunler" variant="gold">Ürünleri İnceleyin</PillButton>
      </div>
    </section>

    <section id="urunler" data-landing-section="" data-home-section="products" className={styles.products} aria-labelledby="urunler-title">
      <div className={styles.container}>
        <SectionHeading id="urunler-title" title="Sofranıza AFİNA" lead="Kavanozdan tenekeye, sofranıza uygun boyu seçin." />
        <ProductShowcase items={items} />
        <p className={styles.note}>Ürün görselleri temsili görseldir.</p>
      </div>
    </section>

    <section id="hikayemiz" data-landing-section="" data-reveal="" data-home-section="story" className={styles.story} aria-labelledby="hikayemiz-title">
      <div className={styles.container}>
        <div className={styles.storyGrid}>
          <div className={styles.storyPhotos}>
            <V3Picture image={homeMedia.story} sizes="(max-width: 1023px) 92vw, 520px" className={styles.storyPhoto} />
            <V3Picture image={homeMedia.storyDetail} sizes="(max-width: 1023px) 36vw, 200px" className={styles.storyInset} decorative />
          </div>
          <div className={styles.storyCopy}>
            <SectionHeading id="hikayemiz-title" eyebrow="Hikayemiz" title="Nesillerin Emeği, Toprağın Bereketi" lead="AFİNA ZEYTİN, Osmaniye Düziçi'nin Ellek zeytinliklerinden gelen zeytinleri hazırlayıp sofralara ulaştırır." />
            <p className={styles.storyText}>Doğal kırma zeytinlerimizi geleneksel usulle hazırlıyoruz. Ayıklamadan paketlemeye uzanan üretim sürecini takip ediyoruz.</p>
            <ul className={styles.values} data-story-values="">
              <li><Medallion icon={Sprout} /><strong>Geleneksel Üretim</strong></li>
              {/* The page's one seal names the claim for assistive technology; the same words beside it stay visual. */}
              <li className={styles.sealed}><Stamp label={NATURAL_CLAIM} size={96} /><strong aria-hidden="true">{NATURAL_CLAIM}</strong></li>
              <li><Medallion icon={Factory} /><strong>Kendi Tesisimizde</strong></li>
            </ul>
          </div>
        </div>
        <div className={styles.facility} data-home-facility="">
          <div className={styles.facilityPhotos}>
            {facilityPhotos.map(item => <figure className={styles.facilityPhoto} key={item.title}>
              <V3Picture image={item.image} sizes="(max-width: 767px) 31vw, (max-width: 1375px) 20vw, 250px" decorative />
              <figcaption data-overlay-ok="">{item.title}</figcaption>
            </figure>)}
          </div>
          <div className={styles.harvest}>
            <h3>Bereketin Hasat Vakti</h3>
            <p>Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.</p>
            <ul className={styles.steps} data-harvest-ledger="">
              {harvestSteps.map(({ icon, title }) => <li key={title}><Medallion icon={icon} /><span data-step-label="">{title}</span></li>)}
            </ul>
          </div>
        </div>
        <OliveBranch className={styles.divider} />
      </div>
    </section>

    <section id="toptan-bayilik" data-landing-section="" data-reveal="" data-home-section="business" className={styles.business} aria-labelledby="toptan-bayilik-title">
      <div className={styles.container}>
        <QuoteJourneyProvider>
          <QuoteQuerySelection products={variants} />
          <BusinessTabs
            heading={<SectionHeading id="toptan-bayilik-title" title="Toptan & Bayilik" />}
            wholesale={<div className={styles.businessPanel}>
              <div className={styles.businessCard}>
                <Medallion icon={Package} />
                <p>Otel, restoran, market ve toplu tüketim için koli bazında teklif.</p>
              </div>
              <div id="toptan" className={styles.businessForm}><span id="teklif" aria-hidden="true" /><QuoteComposer products={variants} /></div>
            </div>}
            dealership={<div className={styles.businessPanel}>
              <div className={styles.businessCard}>
                <Medallion icon={Handshake} />
                <p>AFİNA ZEYTİN&apos;i bölgenizde birlikte büyütelim; bayilik için bize yazın.</p>
                <ol className={styles.businessSteps}>
                  {dealershipSteps.map(step => <li key={step.title}><strong>{step.title}</strong><span>{step.description}</span></li>)}
                </ol>
              </div>
              <div id="basvuru" className={`${styles.businessForm} ${styles.dealershipForm}`}><DeferredDealershipForm configuration={dealershipConfiguration} /></div>
            </div>}
          />
        </QuoteJourneyProvider>
      </div>
    </section>

    <section id="blog" data-landing-section="" data-reveal="" data-home-section="blog" className={styles.blog} aria-labelledby="blog-title">
      <div className={styles.container}>
        <SectionHeading id="blog-title" title="Zeytin Defteri" />
        <div className={styles.posts}>
          {blogPosts.slice(0, BLOG_CARD_COUNT).map(post => <Link prefetch={false} href={`/blog/${post.slug}`} key={post.slug} className={styles.post}>
            <V3Picture image={blogCover(post)} sizes={POST_IMAGE_SIZES} decorative />
            <div><h3>{post.title}</h3><span className={styles.readTime}>{post.readingMinutes} dk okuma</span></div>
          </Link>)}
        </div>
      </div>
    </section>

    <section id="iletisim" data-landing-section="" data-reveal="" data-home-section="contact" className={styles.contact} aria-label="Sık sorulanlar ve iletişim">
      <div className={`${styles.container} ${styles.contactGrid}`}>
        <StoreFaq canonicalPath="/" />
        <div className={styles.contactCard}>
          <h2 id="iletisim-title">İletişim</h2>
          <div className={styles.address}><MapPin size={22} strokeWidth={1.6} aria-hidden="true" /><address>{seller.address}</address></div>
          <div className={styles.contactActions}>
            <PillButton variant="quiet" icon="none" href={`tel:${corporateContact.phone}`}><Phone size={16} strokeWidth={1.8} aria-hidden="true" />{corporateContact.displayPhone}</PillButton>
            <PillButton variant="quiet" icon="none" href={`mailto:${corporateContact.email}`}><Mail size={16} strokeWidth={1.8} aria-hidden="true" />{corporateContact.email}</PillButton>
            <PillButton variant="quiet" href={MAP_URL} target="_blank" rel="noopener noreferrer">Yol tarifi</PillButton>
          </div>
        </div>
      </div>
    </section>
  </>;
}
