import type { JSX } from "react";
import Link from "next/link";
import styles from "./V3Foundation.module.css";

export function TrustStrip(): JSX.Element {
  return <section aria-labelledby="trust-title" className={styles.trust}>
    <h2 id="trust-title" className="sr-only">Alışveriş bilgileri</h2>
    <ul>
      <li><span data-trust-dot="" aria-hidden="true" />Kendi tesisimizde dolum</li>
      <li><span data-trust-dot="" aria-hidden="true" />Kargo 2–4 iş günü</li>
      <li><span data-trust-dot="" aria-hidden="true" />Güvenli Ödeme</li>
      <li><span data-trust-dot="" aria-hidden="true" /><Link href="/#toptan-iletisim">Toptan alım için teklif</Link></li>
    </ul>
  </section>;
}
