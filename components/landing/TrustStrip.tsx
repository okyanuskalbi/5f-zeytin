import type { JSX } from "react";
import Link from "next/link";
import styles from "./V3Foundation.module.css";

export function TrustStrip(): JSX.Element {
  return <section aria-label="Alışveriş bilgileri" className={styles.trust}>
    <ul>
      <li><span data-trust-dot="" aria-hidden="true" />Kendi tesisimizde dolum</li>
      <li><span data-trust-dot="" aria-hidden="true" />Kargo 2–4 iş günü</li>
      <li><span data-trust-dot="" aria-hidden="true" />PayTR ile güvenli ödeme</li>
      <li><span data-trust-dot="" aria-hidden="true" /><Link href="/#toptan-iletisim">Toptan alım için teklif</Link></li>
    </ul>
  </section>;
}
