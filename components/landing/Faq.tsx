import type { JSX } from "react";
import { FaqDisclosure } from "./FaqDisclosure";
import styles from "./Faq.module.css";

import { verifiedFaqs } from "@/lib/site/faqs";
import { siteIdentity } from "@/lib/site/identity";
export { verifiedFaqs } from "@/lib/site/faqs";

export function Faq({ embedded = false, canonicalPath = "/" }: { embedded?: boolean; canonicalPath?: string } = {}): JSX.Element {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${siteIdentity.origin}${canonicalPath}#sik-sorulanlar`, mainEntity: verifiedFaqs.map(faq => ({
    "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })) };
  const Root = embedded ? "div" : "section";
  return (
    <Root id="sik-sorulanlar" data-reading-safe="" data-21st-source="31986" aria-labelledby={embedded ? undefined : "sss-title"} className={styles.section}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <div className={styles.heading}><h2 id="sss-title">Sık sorulanlar</h2><p className={styles.updated}>AFİNA ZEYTİN · Güncelleme: <time dateTime={siteIdentity.contentUpdated}>1 Kasım 2026</time></p></div>
      <div className={styles.answers}>
        {verifiedFaqs.map(item => (
          <FaqDisclosure key={item.id} {...item} />
        ))}
      </div>
    </Root>
  );
}
