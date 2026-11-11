import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import type { JSX } from "react";
import { AboutPage } from "@/components/storefront/content/AboutPage";
import { siteIdentity } from "@/lib/site/identity";

const title = "Hakkımızda | AFİNA ZEYTİN";
const description = "AFİNA ZEYTİN'i tanıyın. Osmaniye Düziçi Ellek'teki kendi tesisimizde zeytin ayıklama, salamura, paketleme ve depolama süreçlerimizi inceleyin.";

export const metadata: Metadata = completeMetadata({
  title, description, alternates: { canonical: "/hakkimizda" }, robots: { index: true, follow: true },
  openGraph: { title, description, url: "/hakkimizda", type: "website", locale: "tr_TR", siteName: siteIdentity.name },
  twitter: { card: "summary_large_image", title, description },
});

const breadcrumb = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${siteIdentity.origin}/` },
    { "@type": "ListItem", position: 2, name: "Hakkımızda", item: `${siteIdentity.origin}/hakkimizda` },
  ],
};

export default function Page(): JSX.Element {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} /><AboutPage /></>;
}
