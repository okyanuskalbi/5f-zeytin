import { verifiedFaqs } from "@/lib/site/faqs";
import { siteIdentity } from "@/lib/site/identity";
import styles from "./StoreFaq.module.css";

export function StoreFaq({ canonicalPath }: { canonicalPath: string }) {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${siteIdentity.origin}${canonicalPath}#sik-sorulanlar`, mainEntity: verifiedFaqs.map(item => ({
    "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer },
  })) };
  return <section id="sik-sorulanlar" aria-labelledby="sss-title" className={styles.faq}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <h2 id="sss-title">Sık sorulanlar</h2>
    <div className={styles.answers}>{verifiedFaqs.map(item => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
  </section>;
}
