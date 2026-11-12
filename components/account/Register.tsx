"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MembershipFrame } from "./MembershipFrame";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { Input } from "@/components/ui/input";
import { MembershipError, passwordStrength } from "@/lib/auth/adapter";
import { registrationConfirmation, registrationReady, registrationPasswordError, validateRegisterRequest, type RegisterResponse } from "@/lib/contracts/register";
import { Field, useMembershipAction } from "./FormControls";
import { ConfiguredGoogleButton } from "./ConfiguredGoogleButton";
import styles from "./Membership.module.css";

// Reuses the existing 21st-derived split composition in SignIn and AFİNA tokens.
export function Register({ embedded = false, onSignIn }: { embedded?: boolean; onSignIn?: () => void } = {}) {
  const Heading = embedded ? "h2" : "h1";
  const content = <>
    <header className={styles.intro}><Heading>Soframıza katılın.</Heading><p>E-posta adresinizle hesabınızı oluşturun. </p></header>
    <ConfiguredGoogleButton />
    <RegisterForm />
    <div className={styles.authFooter}>
      <p>Zaten hesabınız var mı? <Link prefetch={false} href="/giris" className={styles.textLink} onClick={onSignIn ? (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); event.stopPropagation(); onSignIn();
      } : undefined}>Giriş yap</Link></p>
      <Link prefetch={false} href="/sepet" className={styles.guestLink}>Üye olmadan alışverişe devam et<ArrowRight aria-hidden="true" size={15} /></Link>
    </div>
  </>;
  return embedded ? content : <MembershipFrame mode="register">{content}</MembershipFrame>;
}

function RegisterForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { busy, errors, feedback, run } = useMembershipAction();
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const strength = passwordStrength(password);
  useEffect(() => {
    if (feedback.message && !Object.keys(errors).length) feedbackRef.current?.focus();
  }, [feedback.message, errors]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    void run(async () => {
      const parsed = validateRegisterRequest({ name: values.get("name"), email: values.get("email"), password, privacy: values.get("privacy") === "on", consent: values.get("consent") === "on", marketing: values.get("marketing") === "on" });
      if (!parsed.ok) throw new MembershipError("Lütfen alanları kontrol edin.", parsed.fields);
      const response = await fetch("/api/auth/register", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result: RegisterResponse | null = await response.json().catch(() => null);
      if (result && "error" in result && result.error.code === "email_not_configured") throw new MembershipError(result.error.message);
      if (response.status === 429) throw new MembershipError("Çok fazla deneme. Daha sonra yeniden deneyin.");
      if (response.status === 422 && result && "error" in result && result.error?.code === "validation_error") {
        throw new MembershipError("Lütfen alanları kontrol edin.", { password: registrationPasswordError });
      }
      if (response.status !== 202 || !result || !("data" in result) || !["confirmation_required", "registered"].includes(result.data?.status)) {
        throw new MembershipError("Üyelik hizmeti şu anda kullanılamıyor. Lütfen yeniden deneyin.");
      }
      setPassword("");
      return result.data.status === "registered" ? registrationReady : registrationConfirmation;
    });
  }

  return <form onSubmit={submit} noValidate className={styles.form} aria-label="E-posta ile üyelik" aria-busy={busy}>
    <fieldset disabled={busy}>
      <Field id="register-name" name="name" label="Ad soyad" autoComplete="name" maxLength={100} required error={errors.name} />
      <Field id="register-email" name="email" label="E-posta" type="email" autoComplete="email" inputMode="email" maxLength={254} required error={errors.email} />
      <div className={styles.field}>
        <label htmlFor="register-password">Şifre</label>
        <div className={styles.password}>
          <Input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} minLength={10} maxLength={128} required aria-invalid={!!errors.password} aria-describedby={`register-password-hint${errors.password ? " register-password-error" : ""}`} />
          <Button variant="ghost" size="icon" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>
        </div>
        <small id="register-password-hint" className={styles.muted}>{registrationPasswordError}</small>
        <div className={styles.strength}><meter min={0} max={4} value={strength} aria-label="Şifre gücü" /><span>{password ? ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"][strength] : "Şifre gücü"}</span></div>
        {errors.password && <small id="register-password-error" className={styles.error}>{errors.password}</small>}
      </div>
      <div className={styles.consents}>
        <Consent name="privacy" error={errors.privacy}><Link prefetch={false} href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK aydınlatma metnini</Link> okudum. (Zorunlu)</Consent>
        <Consent name="consent" error={errors.consent}>Açık rıza: üyelik bilgilerimin üyelik işlemleri için işlenmesine rıza veriyorum. (Zorunlu)</Consent>
        <Consent name="marketing">Ticari ileti almak istiyorum. (İsteğe bağlı)</Consent>
      </div>
      <PillButton type="submit" fullWidth busy={busy}>{busy ? "İşleniyor…" : "Üyelik oluştur"}</PillButton>
    </fieldset>
    <p ref={feedbackRef} tabIndex={-1} role={feedback.error ? "alert" : "status"} aria-live={feedback.error ? "assertive" : "polite"} aria-atomic="true" className={`${styles.feedback} ${feedback.error ? styles.error : ""}`}>{busy ? "İsteğiniz işleniyor…" : feedback.message}</p>
  </form>;
}

function Consent({ name, error, children }: { name: "privacy" | "consent" | "marketing"; error?: string; children: ReactNode }) {
  return <div><label className={styles.check}><input name={name} type="checkbox" required={name !== "marketing"} aria-invalid={!!error} aria-describedby={error ? `register-${name}-error` : undefined} /><span>{children}</span></label>{error && <p id={`register-${name}-error`} className={styles.error}>{error}</p>}</div>;
}
