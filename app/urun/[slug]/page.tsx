import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/catalog/ProductPage";
import { readProductFamilies } from "@/lib/catalog/read";
import { getFamilyBySlug, getFamilySlug } from "@/lib/catalog/product-pages";
import { getGroupTrail } from "@/lib/catalog/groups";
import { getProductDetails } from "@/lib/catalog/product-details";
import { siteIdentity } from "@/lib/site/identity";

export const dynamic = "force-static";
export const revalidate = 300;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await readProductFamilies()).flatMap(family => {
    const slug = getFamilySlug(family.id);
    return slug ? [{ slug }] : [];
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const family = getFamilyBySlug(await readProductFamilies(), slug);
  if (!family) notFound();
  const title = `${family.name} | AFİNA ZEYTİN`;
  const description = getProductDetails(family.variants[0])?.description ?? `${family.name} boylarını ve ürün bilgilerini inceleyin.`;
  return { title, description, alternates: { canonical: `/urun/${slug}` }, robots: { index: false, follow: true }, openGraph: { title, description, url: `/urun/${slug}`, type: "website", locale: "tr_TR", siteName: siteIdentity.name } };
}

export default async function Page({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const families = await readProductFamilies();
  const family = getFamilyBySlug(families, slug);
  if (!family) notFound();
  const related = families.flatMap(item => item.variants);
  const trail = [
    { name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { name: "Ürünler", item: `${siteIdentity.origin}/urunler` },
    ...getGroupTrail(family.groupId).map(group => ({ name: group.name, item: `${siteIdentity.origin}/urunler/${group.id}` })),
    { name: family.name, item: `${siteIdentity.origin}/urun/${slug}` },
  ];
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} /><ProductPage family={family} related={related} /></>;
}
