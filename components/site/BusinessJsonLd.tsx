import type { JSX } from "react";
import { seller } from "@/lib/site/seller";
import { siteIdentity } from "@/lib/site/identity";

const { origin, facility } = siteIdentity;
const business = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: siteIdentity.name,
      legalName: seller.name,
      url: origin,
      logo: `${origin}/brand/afina-zeytin.svg`,
      memberOf: { "@type": "Organization", name: "AFİNA Şirketler Topluluğu", url: siteIdentity.communityUrl },
      location: { "@id": `${origin}/#tesis` },
    },
    {
      "@type": "Place",
      "@id": `${origin}/#tesis`,
      name: "Afina Zeytin Osmaniye Üretim Tesisi",
      url: `${origin}/#hikayemiz`,
      image: `${origin}/images/renewal/tesis-musteri-1672.webp`,
      description: siteIdentity.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: facility.locality,
        addressRegion: facility.region,
        addressCountry: facility.country,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${origin}/#webpage`,
      url: `${origin}/`,
      name: siteIdentity.title,
      description: siteIdentity.description,
      inLanguage: "tr-TR",
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#organization` },
      dateModified: siteIdentity.contentUpdated,
      primaryImageOfPage: {
        "@type": "ImageObject",
        contentUrl: `${origin}/images/renewal/tesis-musteri-1672.webp`,
        width: 1672,
        height: 941,
        caption: "Afina Zeytin üretim tesisi, Ellek, Düziçi, Osmaniye",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: siteIdentity.name,
      url: origin,
      inLanguage: "tr-TR",
      publisher: { "@id": `${origin}/#organization` },
    },
  ],
};

// Tasks 114/145: district only; no street, VKN or sample Product/Offer data.
export function BusinessJsonLd(): JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />;
}
