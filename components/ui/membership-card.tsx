"use client";

import { Leaf, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/site/BrandLogo";
import styles from "./membership-card.module.css";

/** User-supplied CreditCardForm's two-sided card, adapted to membership.
 * Only the focus category reaches this artwork; no credentials or card data. */
export function MembershipCard({ secure = false }: { secure?: boolean }) {
  return <div className={styles.scene} role="img" aria-label="AFİNA üyelik kartı" data-side={secure ? "back" : "front"}>
    <div className={styles.card} aria-hidden="true">
      <div className={styles.front}>
        <div className={styles.top}><BrandLogo className={styles.logo} /><Leaf size={26} strokeWidth={1.3} /></div>
        <p className={styles.headline}>Sofranızda<br /><em>bir yerimiz var.</em></p>
        <div className={styles.bottom}><span>AFİNA · ÜYELİK</span><span>Kökü toprakta.</span></div>
      </div>
      <div className={styles.back}>
        <ShieldCheck size={32} strokeWidth={1.2} />
        <p className={styles.headline}>Sadece<br /><em>size ait.</em></p>
        <div className={styles.bottom}><span>SİPARİŞLERİNİZ · ADRESLERİNİZ</span><span>••••••</span></div>
      </div>
    </div>
  </div>;
}
