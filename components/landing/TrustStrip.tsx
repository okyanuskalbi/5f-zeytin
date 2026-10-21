import type { JSX } from "react";
import { CreditCard, Factory, Package } from "lucide-react";
import styles from "./V3Foundation.module.css";

export function TrustStrip(): JSX.Element {
  return <section aria-label="Alışveriş bilgileri" className={styles.trust}>
    <p><Package aria-hidden="true" />Kargo bilgileri ödemede</p>
    <p><CreditCard aria-hidden="true" />PayTR ile güvenli ödeme</p>
    <p><Factory aria-hidden="true" />Kendi tesisimizde dolum</p>
  </section>;
}
