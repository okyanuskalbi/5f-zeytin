import type { Metadata } from "next";
import type { JSX } from "react";
import { ProductListing } from "@/components/storefront/catalog/ProductListing";
import { readProductFamilies } from "@/lib/catalog/read";
import { productsForGroup } from "@/lib/catalog/groups";
import { siteIdentity } from "@/lib/site/identity";

export const dynamic = "force-static";
export const revalidate = 300;

const title = "Ürünler | AFİNA ZEYTİN";
const description = "AFİNA ZEYTİN zeytin ve zeytinyağı ürünlerini inceleyin. Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/urunler" },
  robots: { index: false, follow: true },
  openGraph: { title, description, url: "/urunler", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { "@type": "ListItem", position: 2, name: "Ürünler", item: `${siteIdentity.origin}/urunler` },
  ],
};

export default async function Page(): Promise<JSX.Element> {
  const products = productsForGroup(await readProductFamilies());
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <ProductListing products={products} />
  </>;
}
