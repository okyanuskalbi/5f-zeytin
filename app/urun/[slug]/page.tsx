import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { readProductFamilies } from "@/lib/catalog/read";
import { getFamilyBySlug, getFamilySlug } from "@/lib/catalog/product-pages";
import { getGroupTrail } from "@/lib/catalog/groups";
import { getProductDetails } from "@/lib/catalog/product-details";
import { siteIdentity } from "@/lib/site/identity";

// Query-aware metadata distinguishes the selected packaging.
export const revalidate = 300;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ boy?: string | string[] }> };

export async function generateStaticParams() {
  return (await readProductFamilies()).flatMap(family => {
    const slug = getFamilySlug(family.id);
    return slug ? [{ slug }] : [];
  });
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const family = getFamilyBySlug(await readProductFamilies(), slug);
  if (!family) notFound();
  const query = await searchParams;
  const selected = family.variants.find(variant => variant.weight === query?.boy) ?? family.variants[0];
  const title = `${family.name}, ${selected.weight} | AFİNA ZEYTİN`;
  const description = `${selected.weight}. ${getProductDetails(selected)?.description ?? `${family.name} ürün bilgilerini inceleyin.`}`;
  const url = `/urun/${slug}?boy=${encodeURIComponent(selected.weight)}`;
  return completeMetadata({ title, description, alternates: { canonical: url }, robots: { index: false, follow: true }, openGraph: { title, description, url, type: "website", locale: "tr_TR", siteName: siteIdentity.name } });
}

export default async function Page({ params, searchParams }: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const families = await readProductFamilies();
  const family = getFamilyBySlug(families, slug);
  if (!family) notFound();
  const query = await searchParams;
  const initialSize = typeof query?.boy === "string" ? query.boy : "";
  const related = families.flatMap(item => item.variants);
  const trail = [
    { name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { name: "Ürünler", item: `${siteIdentity.origin}/urunler` },
    ...getGroupTrail(family.groupId).map(group => ({ name: group.name, item: `${siteIdentity.origin}/urunler/${group.id}` })),
    { name: family.name, item: `${siteIdentity.origin}/urun/${slug}` },
  ];
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} /><ProductDetail family={family} related={related} initialSize={initialSize} /></>;
}
