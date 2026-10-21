import type { JSX } from "react";
import styles from "./Faq.module.css";

// 087: initial common selection Z01/Z05/Z06/Z07, official section 04.
// 074/087 owns JSON-LD; no parallel schema producer here.
export const verifiedFaqs = [
  { id: "Z01", question: "Afina Zeytin hangi ürün alanlarında çalışıyor?", answer: "Afina Zeytin, sofralık zeytin, salamura zeytin ve zeytinyağı alanlarında faaliyet gösteriyor." },
  { id: "Z06", question: "Afina Zeytin perakende müşterilere de ulaşıyor mu?", answer: "Afina Zeytin, ürünlerini hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor." },
  { id: "Z07", question: "Afina Zeytin’in üretim tesisi nerede?", answer: "Afina Zeytin’in üretim tesisi Osmaniye’nin Düziçi ilçesindeki Ellek Beldesi’nde bulunuyor." },
] as const;

export function Faq(): JSX.Element {
  return (
    <section id="sik-sorulanlar" data-reading-safe="" aria-labelledby="sss-title" className={styles.section}>
      <h2 id="sss-title" data-scene-reveal="">Sık sorulanlar</h2>
      <div className={styles.answers}>
        {verifiedFaqs.map(item => (
          <div key={item.id} data-faq={item.id} data-scene-reveal="" className={styles.answer}>
            <h3>{item.question}</h3>{" "}<p data-faq-answer="">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
