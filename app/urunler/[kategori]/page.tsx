import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { ProductListing } from "@/components/storefront/catalog/ProductListing";
import { getGroupTrail, getProductGroup, productGroups, productsForGroup } from "@/lib/catalog/groups";
import { readProductFamilies } from "@/lib/catalog/read";
import { siteIdentity } from "@/lib/site/identity";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 300;

type Props = { params: Promise<{ kategori: string }> };

export function generateStaticParams() {
  return productGroups.map(group => ({ kategori: group.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = getProductGroup((await params).kategori);
  if (!group) notFound();
  const title = `${group.name} | AFİNA ZEYTİN`;
  const description = "AFİNA ZEYTİN zeytin ve zeytinyağı ürünlerini inceleyin. Ambalajınızı seçin, sepetinize veya teklifinize ekleyin.";
  const url = `/urunler/${group.id}`;
  return completeMetadata({
    title, description, alternates: { canonical: url }, robots: { index: false, follow: true },
    openGraph: { title, description, url, type: "website", locale: "tr_TR", siteName: siteIdentity.name },
    twitter: { card: "summary_large_image", title, description },
  });
}

export default async function Page({ params }: Props): Promise<JSX.Element> {
  const group = getProductGroup((await params).kategori);
  if (!group) notFound();
  const products = productsForGroup(await readProductFamilies(), group.id);
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
      { "@type": "ListItem", position: 2, name: "Ürünler", item: `${siteIdentity.origin}/urunler` },
      ...getGroupTrail(group.id).map((item, index) => ({ "@type": "ListItem", position: index + 3, name: item.name, item: `${siteIdentity.origin}/urunler/${item.id}` })),
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <ProductListing products={products} category routeKey={`/urunler/${group.id}`} />
  </>;
}
