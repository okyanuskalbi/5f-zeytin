import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import type { JSX } from "react";
import { DealershipPage } from "@/components/storefront/content/DealershipPage";
import { siteIdentity } from "@/lib/site/identity";

const title = "Bayilik | AFİNA ZEYTİN";
const description = "AFİNA ZEYTİN bayiliği için firma ve bölge bilgilerinizi paylaşın. Market, şarküteri, yöresel ürün dükkânı ve distribütörler için başvuru formu.";

export const metadata: Metadata = completeMetadata({
  title,
  description,
  alternates: { canonical: "/bayilik" },
  openGraph: { title, description, url: "/bayilik", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
});

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { "@type": "ListItem", position: 2, name: "Bayilik", item: `${siteIdentity.origin}/bayilik` },
  ],
};

export default function Page(): JSX.Element {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
    <DealershipPage />
  </>;
}
