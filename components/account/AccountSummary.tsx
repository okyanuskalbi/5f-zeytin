"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { MembershipError } from "@/lib/auth/adapter";
import type { AccountProfile } from "@/lib/contracts/account";
import { useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";
import { SectionHeading } from "@/components/storefront/ui/SectionHeading";
import summary from "./AccountSummary.module.css";
import panel from "@/components/storefront/account/AccountSurface.module.css";
import { CustomerNavigation } from "./CustomerNavigation";

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

  return <main className={panel.customerPage}><div className={panel.customerShell}>
    <header className={panel.customerHeader}>
      <div><SectionHeading as="h1" title="Hesabım" lead="Profil bilgileriniz ve siparişlerinize ulaşabileceğiniz alan." /></div>
      {profile && !signedOut && <PillButton variant="outline" icon="none" disabled={busy} onClick={signOut}>{busy ? "İşleniyor…" : "Çıkış yap"}</PillButton>}
    </header>
    {signedOut ? <PillButton href="/giris">Giriş yap</PillButton> : profile ? <div className={panel.customerLayout}><CustomerNavigation /><div className={panel.customerContent}>
      <section className={panel.card} aria-labelledby="account-profile-title">
        <h2 id="account-profile-title">Profil bilgilerim</h2>
        <dl>{([["Ad soyad", profile.name], ["E-posta", profile.email], ["Telefon", profile.phone]] as const).map(([label, value]) =>
          <div key={label}><dt>{label}</dt><dd>{value ?? "Belirtilmedi"}</dd></div>)}</dl>
      </section>
      <nav aria-label="Hesap bağlantıları" className={panel.quickLinks}>
        <Link href="/hesabim/siparisler" prefetch={false}><strong>Sipariş geçmişim</strong><span aria-hidden="true">Siparişlerinizi ve durumlarını görün.</span></Link>
        <Link href="/hesabim/adresler"><strong>Adres defterim</strong><span>Teslimat adreslerinizi yönetin.</span></Link>
        <Link href="/hesabim/bilgilerim"><strong>Hesap bilgilerim</strong><span>Adınızı ve telefonunuzu düzenleyin.</span></Link>
        <Link href="/hesabim/guvenlik"><strong>Güvenlik</strong><span>Şifrenizi güncelleyin.</span></Link>
      </nav>
    </div></div> : <div className={summary.failure}>
      <p role="alert">Hesap bilgileri yüklenemedi. Lütfen yeniden deneyin.</p>
      <div className={styles.actions}><PillButton icon="none" onClick={() => router.refresh()}>Yeniden dene</PillButton><Link href="/giris" className={styles.textLink}>Giriş sayfasına dön</Link></div>
    </div>}
    <p ref={feedbackRef} tabIndex={-1} role={feedback.error ? "alert" : "status"} aria-live={feedback.error ? "assertive" : "polite"} aria-atomic="true" className={`${styles.feedback} ${feedback.error ? styles.error : ""}`}>{busy ? "İsteğiniz işleniyor…" : feedback.message}</p>
  </div></main>;
}
