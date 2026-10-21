import type { JSX } from "react";
import { FaqDisclosure } from "./FaqDisclosure";
import styles from "./Faq.module.css";

// Official section 04 and public seller facts only. docs/teyit still awaits approval.
export const verifiedFaqs = [
  { id: "Z01", question: "Afina Zeytin hangi ürün alanlarında çalışıyor?", answer: "Afina Zeytin, sofralık zeytin, salamura zeytin ve zeytinyağı alanlarında faaliyet gösteriyor." },
  { id: "Z06", question: "Afina Zeytin perakende müşterilere de ulaşıyor mu?", answer: "Afina Zeytin, ürünlerini hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor." },
  { id: "Z07", question: "Afina Zeytin’in üretim tesisi nerede?", answer: "Afina Zeytin’in üretim tesisi Osmaniye’nin Düziçi ilçesindeki Ellek Beldesi’nde bulunuyor." },
] as const;

export function Faq(): JSX.Element {
  return (
    <section id="sik-sorulanlar" data-reading-safe="" aria-labelledby="sss-title" className={styles.section}>
      <h2 id="sss-title">Sık sorulanlar</h2>
      <div className={styles.answers}>
        {verifiedFaqs.map(item => (
          <FaqDisclosure key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
