"use client";

import Link from "next/link";
import { isMembershipDemoEnabled } from "@/lib/auth/adapter";
import styles from "./Membership.module.css";

export function CheckoutSignIn() {
  if (!isMembershipDemoEnabled()) return null;
  return <aside className={styles.suggestion} aria-label="İsteğe bağlı üyelik">
    <Link href="/giris" className={styles.textLink}>Google ile hızlı giriş</Link>
    <p className={styles.muted}>Giriş yapmak isteğe bağlıdır. Misafir olarak ödemeye devam edebilirsiniz.</p>
  </aside>;
}
