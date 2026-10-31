import type { JSX } from "react";
import { FaqDisclosure } from "./FaqDisclosure";
import styles from "./Faq.module.css";

import { verifiedFaqs } from "@/lib/site/faqs";
import { siteIdentity } from "@/lib/site/identity";
export { verifiedFaqs } from "@/lib/site/faqs";

export function Faq(): JSX.Element {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${siteIdentity.origin}/#sik-sorulanlar`, mainEntity: verifiedFaqs.map(faq => ({
    "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })) };
  return (
    <section id="sik-sorulanlar" data-reading-safe="" aria-labelledby="sss-title" className={styles.section}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <div><h2 id="sss-title">Sık sorulanlar</h2><p className={styles.updated}>AFİNA ZEYTİN · Güncelleme: <time dateTime={siteIdentity.contentUpdated}>1 Kasım 2026</time></p></div>
      <div className={styles.answers}>
        {verifiedFaqs.map(item => (
          <FaqDisclosure key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
