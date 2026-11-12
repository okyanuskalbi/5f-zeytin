import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import type { JSX } from "react";
import { QuoteComposer } from "@/components/storefront/quote/QuoteComposer";
import { QuoteQuerySelection } from "@/components/storefront/quote/QuoteQuerySelection";
import { QuoteJourneyProvider } from "@/components/storefront/quote/QuoteJourneyProvider";
import { readProductFamilies } from "@/lib/catalog/read";
import { siteIdentity } from "@/lib/site/identity";
import { PageBand, PagePath } from "@/components/storefront/ui/PageBand";
import classic from "@/lib/media/classic-photos.json";
import styles from "./page.module.css";

export const dynamic = "force-static";
export const revalidate = 300;
const title = "Toptan Satış | AFİNA ZEYTİN";
const description = "Otel, restoran, market ve toplu tüketim için AFİNA ZEYTİN ürünlerini seçin. Koli bazında teklif için e-posta taslağınızı hazırlayın.";
export const metadata: Metadata = completeMetadata({
  title, description, alternates: { canonical: "/toptan-satis" }, robots: { index: true, follow: true },
  openGraph: { title, description, url: "/toptan-satis", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
});
const breadcrumb = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { "@type": "ListItem", position: 2, name: "Toptan Satış", item: `${siteIdentity.origin}/toptan-satis` },
  ],
};

/** The same private email draft composer now has its own public destination. */
export default async function Page(): Promise<JSX.Element> {
  const products = (await readProductFamilies()).flatMap(family => family.variants);
  return <QuoteJourneyProvider><main className={styles.root}>
    <QuoteQuerySelection products={products} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <div className={styles.opening}>
      <PagePath steps={[{ name: "Ana Sayfa", href: "/" }, { name: "Toptan Satış" }]} />
      <PageBand title="Toptan Satış" lead="Otel, restoran, market ve toplu tüketim için zeytin ve zeytinyağı seçeneklerimizi birlikte planlayalım." image={classic.assets.depo}>
        <p>Koli bazında teklif için ürünleri ve adetleri seçin. E-posta taslağını hazırladıktan sonra gönderimi e-posta uygulamanızda tamamlayabilirsiniz.</p>
      </PageBand>
    </div>
    <section id="toptan" aria-label="Teklif hazırlayın" className={styles.form}><span id="teklif" aria-hidden="true" /><QuoteComposer products={products} /></section>
  </main></QuoteJourneyProvider>;
}
