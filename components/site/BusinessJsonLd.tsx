import type { JSX } from "react";
import { seller } from "@/lib/site/seller";

const origin = "https://afinazeytin.com";
const business = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "Afina Zeytin",
      legalName: seller.name,
      url: origin,
      logo: `${origin}/brand/afina-zeytin.svg`,
    },
    {
      "@type": "LocalBusiness",
      "@id": `${origin}/#tesis`,
      name: "Afina Zeytin Osmaniye Üretim Tesisi",
      url: `${origin}/#tesisimiz`,
      image: `${origin}/images/v3/tesis-osmaniye-w800.webp`,
      description: "Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin, salamura zeytin ve zeytinyağını toptan ve perakende müşterileriyle buluşturuyor.",
      parentOrganization: { "@id": `${origin}/#organization` },
    },
  ],
};

// Task 114: no address or VKN in JSON-LD; no Product/Offer for sample prices.
export function BusinessJsonLd(): JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />;
}
