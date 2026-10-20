import type { JSX } from "react";
import styles from "./Faq.module.css";

// 087: initial common selection Z01/Z05/Z06/Z07, official section 04.
// 074/087 owns JSON-LD; no parallel schema producer here.
export const verifiedFaqs = [
  { id: "Z01", question: "Afina Zeytin hangi ürün alanlarında çalışıyor?", answer: "Sofralık zeytin • Salamura zeytin • Zeytinyağı" },
  { id: "Z05", question: "Toptan zeytin veya zeytinyağı talebi iletilebilir mi?", answer: "Toptan satış" },
  { id: "Z06", question: "Afina Zeytin perakende müşterilere de ulaşıyor mu?", answer: "ürünlerini toptan ve perakende kanallarda müşterileriyle buluşturuyor." },
  { id: "Z07", question: "Afina Zeytin'in üretim tesisi hangi şehirde?", answer: "Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin" },
] as const;

export function Faq(): JSX.Element {
  return (
    <section id="sik-sorulanlar" data-reading-safe="" aria-labelledby="sss-title" className={styles.section}>
      <h2 id="sss-title">Sık sorulanlar</h2>
      <div className={styles.answers}>
        {verifiedFaqs.map(item => (
          <div key={item.id} data-faq={item.id} className={styles.answer}>
            <h3>{item.question}</h3>{" "}<p data-faq-answer="">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
