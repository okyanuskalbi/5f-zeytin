"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MembershipError } from "@/lib/auth/adapter";
import type { AccountProfile } from "@/lib/contracts/account";
import { useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";
import summary from "./AccountSummary.module.css";

// 21st kavikatiyar/order-history (7710), demo shell: labelled heading and
// stacked semantic content, adapted to AFİNA's flat account rows and tokens.
export function AccountSummary({ profile }: { profile: AccountProfile | null }) {
  const router = useRouter();
  const [signedOut, setSignedOut] = useState(false);
  const { busy, feedback, run } = useMembershipAction();
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (feedback.message) feedbackRef.current?.focus(); }, [feedback.message]);

  function signOut() {
    void run(async () => {
      const response = await fetch("/auth/logout", { method: "POST", credentials: "same-origin" });
      if (response.status === 429) throw new MembershipError("Çok fazla deneme. Daha sonra yeniden deneyin.");
      if (response.status !== 204) throw new MembershipError("Çıkış yapılamadı. Lütfen yeniden deneyin.");
      setSignedOut(true);
      router.replace("/giris"); router.refresh();
      return "Oturumunuz kapatıldı.";
    });
  }

  return <main className={styles.page}><div className={`${styles.account} ${summary.shell}`}>
    <header className={styles.accountHeader}>
      <div><h1 className={summary.title}>Hesabım</h1><p className={styles.muted}>Profil bilgileriniz ve siparişlerinize ulaşabileceğiniz alan.</p></div>
      {profile && !signedOut && <Button variant="outline" disabled={busy} onClick={signOut}>{busy ? "İşleniyor…" : "Çıkış yap"}</Button>}
    </header>
    {signedOut ? <Button asChild><Link href="/giris">Giriş yap</Link></Button> : profile ? <>
      <section className={summary.profile} aria-labelledby="account-profile-title">
        <h2 id="account-profile-title">Profil bilgilerim</h2>
        <dl>{([["Ad soyad", profile.name], ["E-posta", profile.email], ["Telefon", profile.phone]] as const).map(([label, value]) =>
          <div key={label}><dt>{label}</dt><dd>{value ?? "Belirtilmedi"}</dd></div>)}</dl>
      </section>
      <nav aria-label="Hesap bağlantıları" className={styles.actions}>
        <Button asChild><Link href="/hesabim/siparisler" prefetch={false}>Sipariş geçmişim</Link></Button>
        <Link href="/#urunler" className={styles.textLink}>Alışverişe devam et</Link>
      </nav>
    </> : <div className={summary.failure}>
      <p role="alert">Hesap bilgileri yüklenemedi. Lütfen yeniden deneyin.</p>
      <div className={styles.actions}><Button onClick={() => router.refresh()}>Yeniden dene</Button><Link href="/giris" className={styles.textLink}>Giriş sayfasına dön</Link></div>
    </div>}
    <p ref={feedbackRef} tabIndex={-1} role={feedback.error ? "alert" : "status"} aria-live={feedback.error ? "assertive" : "polite"} aria-atomic="true" className={`${styles.feedback} ${feedback.error ? styles.error : ""}`}>{busy ? "İsteğiniz işleniyor…" : feedback.message}</p>
  </div></main>;
}
