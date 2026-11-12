"use client";

import { PillButton } from "@/components/storefront/ui/PillButton";
import { isMembershipDemoEnabled } from "@/lib/auth/adapter";
import styles from "./Membership.module.css";

export function CheckoutSignIn() {
  if (!isMembershipDemoEnabled()) return null;
  return <aside className={styles.suggestion} aria-label="İsteğe bağlı üyelik">
    <PillButton variant="quiet" href="/giris">Giriş yap</PillButton>
    <p className={styles.muted}>Giriş yapmak isteğe bağlıdır. Misafir olarak ödemeye devam edebilirsiniz.</p>
  </aside>;
}
