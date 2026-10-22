"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MembershipError, passwordStrength } from "@/lib/auth/adapter";
import { registrationConfirmation, registrationPasswordError, validateRegisterRequest, type RegisterResponse } from "@/lib/contracts/register";
import { Field, useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";

// Reuses the existing 21st-derived split composition in SignIn and AFİNA tokens.
export function Register() {
  return <main className={styles.page}>
    <div className={styles.split}>
      <div className={styles.formSide}>
        <header className={styles.intro}><h1>Soframıza katılın.</h1><p>E-posta adresinizle hesabınızı oluşturun. Üyeliğinizi e-posta bağlantısıyla doğrulayın.</p></header>
        <RegisterForm />
        <p>Zaten hesabınız var mı? <Link href="/giris" className={styles.textLink}>Giriş yap</Link></p>
        <Link href="/sepet" className={styles.textLink}>Üye olmadan alışverişe devam et</Link>
      </div>
      <figure className={styles.story}>
        <Image src="/images/hero/zeytinlik-2400.webp" alt="Zeytin ağaçları arasında gün ışığı" width={2400} height={1350} sizes="(min-width: 1024px) 48vw, 100vw" />
        <figcaption><p>Kökü toprakta.<br />Yeri sofrada.</p></figcaption>
      </figure>
    </div>
  </main>;
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
      if (response.status === 429) throw new MembershipError("Çok fazla deneme. Daha sonra yeniden deneyin.");
      if (response.status === 422 && result && "error" in result && result.error?.code === "validation_error") {
        throw new MembershipError("Lütfen alanları kontrol edin.", { password: registrationPasswordError });
      }
      if (response.status !== 202 || !result || !("data" in result) || result.data?.status !== "confirmation_required") {
        throw new MembershipError("Üyelik hizmeti şu anda kullanılamıyor. Lütfen yeniden deneyin.");
      }
      setPassword("");
      return registrationConfirmation;
    });
  }

  return <form onSubmit={submit} noValidate className={styles.form} aria-label="E-posta ile üyelik" aria-busy={busy}>
    <fieldset disabled={busy}>
      <Field id="register-name" name="name" label="Ad soyad" autoComplete="name" maxLength={100} required error={errors.name} />
      <Field id="register-email" name="email" label="E-posta" type="email" autoComplete="email" inputMode="email" maxLength={254} required error={errors.email} />
      <div className={styles.field}>
        <label htmlFor="register-password">Şifre</label>
        <div className={styles.password}>
          <Input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} maxLength={128} required aria-invalid={!!errors.password} aria-describedby={`register-password-hint${errors.password ? " register-password-error" : ""}`} />
          <Button variant="outline" size="icon" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>
        </div>
        <small id="register-password-hint" className={styles.muted}>8–128 karakter; büyük/küçük harf ve rakam kullanın.</small>
        <div className={styles.strength}><meter min={0} max={4} value={strength} aria-label="Şifre gücü" /><span>{password ? ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"][strength] : "Şifre gücü"}</span></div>
        {errors.password && <small id="register-password-error" className={styles.error}>{errors.password}</small>}
      </div>
      <div className={styles.consents}>
        <Consent name="privacy" error={errors.privacy}><Link href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK aydınlatma metnini</Link> okudum. (Zorunlu)</Consent>
        <Consent name="consent" error={errors.consent}>Açık rıza: üyelik bilgilerimin üyelik işlemleri için işlenmesine rıza veriyorum. (Zorunlu)</Consent>
        <Consent name="marketing">Ticari ileti almak istiyorum. (İsteğe bağlı)</Consent>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "İşleniyor…" : "Üyelik oluştur"}</Button>
    </fieldset>
    <p ref={feedbackRef} tabIndex={-1} role={feedback.error ? "alert" : "status"} aria-live={feedback.error ? "assertive" : "polite"} aria-atomic="true" className={`${styles.feedback} ${feedback.error ? styles.error : ""}`}>{busy ? "İsteğiniz işleniyor…" : feedback.message}</p>
  </form>;
}

function Consent({ name, error, children }: { name: "privacy" | "consent" | "marketing"; error?: string; children: ReactNode }) {
  return <div><label className={styles.check}><input name={name} type="checkbox" required={name !== "marketing"} aria-invalid={!!error} aria-describedby={error ? `register-${name}-error` : undefined} /><span>{children}</span></label>{error && <p id={`register-${name}-error`} className={styles.error}>{error}</p>}</div>;
}
