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
      sameAs: [siteIdentity.communityUrl],
      location: { "@id": `${origin}/#tesis` },
    },
    {
      "@type": "Place",
      "@id": `${origin}/#tesis`,
      name: "Afina Zeytin Osmaniye Üretim Tesisi",
      url: `${origin}/#tesisimiz`,
      image: `${origin}/images/v3/tesis-osmaniye-w800.webp`,
      description: siteIdentity.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: facility.locality,
        addressRegion: facility.region,
        addressCountry: facility.country,
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
