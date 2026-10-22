"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MembershipError } from "@/lib/auth/adapter";
import { safeAuthRedirect } from "@/lib/auth/config";
import { loginInvalidCredentials, magicLinkConfirmation, validateLoginRequest, type LoginResponse } from "@/lib/contracts/login";
import { Field, useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";

// 21st diarmuradi/sign-in-3 (39096): preserve the split/password composition.
// Use the approved orchard and AFİNA tokens; Google awaits OAuth approval.
export function SignIn({ next = "/hesabim", signedIn = false, unavailable = false }: { next?: string; signedIn?: boolean; unavailable?: boolean }) {
  const router = useRouter();
  const [signedOut, setSignedOut] = useState(false);
  const sessionOpen = signedIn && !signedOut;
  const [initialFailure, setInitialFailure] = useState(unavailable);
  const [method, setMethod] = useState<"password" | "magic_link">("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { busy, errors, feedback, run } = useMembershipAction();
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const destination = safeAuthRedirect(next);
  useEffect(() => {
    if (feedback.message && !Object.keys(errors).length) feedbackRef.current?.focus();
  }, [feedback.message, errors]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInitialFailure(false);
    const values = new FormData(event.currentTarget);
    void run(async () => {
      const parsed = validateLoginRequest({ method, email: values.get("email"), next: destination, ...(method === "password" ? { password } : {}) });
      if (!parsed.ok) throw new MembershipError("Lütfen alanları kontrol edin.", parsed.fields);
      const response = await fetch("/api/auth/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result: LoginResponse | null = await response.json().catch(() => null);
      if (response.status === 429) throw new MembershipError("Çok fazla deneme. Daha sonra yeniden deneyin.");
      if (method === "password" && response.status === 401) throw new MembershipError(loginInvalidCredentials);
      if (method === "magic_link" && response.status === 202 && result && "data" in result && result.data?.status === "link_requested") return magicLinkConfirmation;
      if (method !== "password" || response.status !== 200 || !result || !("data" in result) || result.data?.status !== "signed_in") throw new MembershipError("Üyelik hizmeti şu anda kullanılamıyor. Lütfen yeniden deneyin.");
      setPassword("");
      router.replace(safeAuthRedirect(result.data.redirectTo));
      router.refresh();
    });
  }

  function signOut() {
    setInitialFailure(false);
    void run(async () => {
      const response = await fetch("/auth/logout", { method: "POST", credentials: "same-origin" });
      if (response.status === 429) throw new MembershipError("Çok fazla deneme. Daha sonra yeniden deneyin.");
      if (response.status !== 204) throw new MembershipError("Çıkış yapılamadı. Lütfen yeniden deneyin.");
      setSignedOut(true); setPassword("");
      router.replace("/giris"); router.refresh();
      return "Oturumunuz kapatıldı.";
    });
  }

  const message = feedback.message || (initialFailure ? "Üyelik hizmeti şu anda kullanılamıyor. Lütfen yeniden deneyin." : "");
  const failed = feedback.error || initialFailure;
  return <main className={styles.page}>
    <div className={styles.split}>
      <div className={styles.formSide}>
        <header className={styles.intro}><h1>Soframıza hoş geldiniz.</h1><p>Hesabınıza giriş yapın, sofranız için seçtiklerinizi takip edin.</p></header>
        {sessionOpen ? <div className={styles.form}>
          <p>Oturumunuz açık.</p>
          <Button asChild><Link href={destination}>Alışverişe devam et</Link></Button>
          <Button variant="outline" disabled={busy} onClick={signOut}>{busy ? "İşleniyor…" : "Çıkış yap"}</Button>
        </div> : <form onSubmit={submit} noValidate className={styles.form} aria-label="E-posta ile giriş" aria-busy={busy}>
          <fieldset disabled={busy}>
            <Field id="auth-email" name="email" label="E-posta" type="email" autoComplete="email" inputMode="email" maxLength={254} required error={errors.email} />
            {method === "password" ? <div className={styles.field}>
              <label htmlFor="auth-password">Şifre</label>
              <div className={styles.password}>
                <Input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} maxLength={128} required aria-invalid={!!errors.password} aria-describedby={errors.password ? "auth-password-error" : undefined} />
                <Button variant="outline" size="icon" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>
              </div>
              {errors.password && <small id="auth-password-error" className={styles.error}>{errors.password}</small>}
            </div> : <p className={styles.muted}>Şifrenizi kullanmadan, e-posta adresinize gönderilecek bağlantıyla giriş yapabilirsiniz.</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "İşleniyor…" : method === "password" ? "E-posta ile giriş yap" : "Giriş bağlantısı iste"}</Button>
            <Button variant="link" className="justify-start px-0" onClick={() => { setMethod(method === "password" ? "magic_link" : "password"); setPassword(""); setShowPassword(false); }}>{method === "password" ? "E-posta bağlantısıyla giriş" : "Şifreyle girişe dön"}</Button>
          </fieldset>
        </form>}
        <p ref={feedbackRef} tabIndex={-1} role={failed ? "alert" : "status"} aria-live={failed ? "assertive" : "polite"} aria-atomic="true" className={`${styles.feedback} ${failed ? styles.error : ""}`}>{busy ? "İsteğiniz işleniyor…" : message}</p>
        <p>Hesabınız yok mu? <Link href="/kayit" className={styles.textLink}>Üye ol</Link></p>
        <Link href="/sepet" className={styles.textLink}>Üye olmadan alışverişe devam et</Link>
      </div>
      <figure className={styles.story}>
        <Image src="/images/hero/zeytinlik-2400.webp" alt="Zeytin ağaçları arasında gün ışığı" width={2400} height={1350} sizes="(min-width: 1024px) 48vw, 100vw" />
        <figcaption><p>Kökü toprakta.<br />Yeri sofrada.</p></figcaption>
      </figure>
    </div>
  </main>;
}
