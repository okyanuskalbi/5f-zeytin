import type { JSX } from "react";
import { CreditCard, Factory, Truck } from "lucide-react";
import styles from "./V3Foundation.module.css";

export function TrustStrip(): JSX.Element {
  return <section aria-label="Alışveriş bilgileri" className={styles.trust}>
    <ul>
      <li><Truck aria-hidden="true" /><p>Kargo 2–4 iş günü</p></li>
      <li><CreditCard aria-hidden="true" /><p>PayTR ile güvenli ödeme</p></li>
      <li><Factory aria-hidden="true" /><p>Kendi tesisimizde dolum</p></li>
    </ul>
  </section>;
}
