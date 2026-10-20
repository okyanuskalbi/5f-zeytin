"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { passwordStrength, type Registration } from "@/lib/auth/adapter";
import { getMembershipAdapters } from "@/lib/auth/demo";
import { GoogleButton } from "./GoogleButton";
import { DemoNotice, Feedback, Field, useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";

// Adapted from 21st diarmuradi/sign-in-3 (39096), sign-up-2 (28332).
// Preserve the split composition/password control; use the approved orchard,
// Google-first order and AFİNA tokens instead of testimonials, gloss and cards.
export function SignIn() {
  const [tab, setTab] = useState("login");
  return <main className={styles.page}>
    <div className={styles.split}>
      <div className={styles.formSide}>
        <header className={styles.intro}><h1>Soframıza hoş geldiniz.</h1><p>Hesabınıza giriş yapın, sofranız için seçtiklerinizi takip edin.</p></header>
        <DemoNotice />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Üyelik işlemi"><TabsTrigger value="login">Giriş</TabsTrigger><TabsTrigger value="register">Üye ol</TabsTrigger></TabsList>
          <TabsContent value="login"><AuthForm register={false} /></TabsContent>
          <TabsContent value="register"><AuthForm register /></TabsContent>
        </Tabs>
        <Link href="/sepet" className={styles.textLink}>Üye olmadan alışverişe devam et</Link>
      </div>
      <figure className={styles.story}>
        <Image src="/images/hero/zeytinlik-2400.webp" alt="Zeytin ağaçları arasında gün ışığı" width={2400} height={1350} sizes="(min-width: 1024px) 48vw, 100vw" />
        <figcaption><p>Kökü toprakta.<br />Yeri sofrada.</p></figcaption>
      </figure>
    </div>
  </main>;
}

function AuthForm({ register }: { register: boolean }) {
  const router = useRouter();
  const [reset, setReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const { busy, errors, feedback, run } = useMembershipAction();
  const strength = passwordStrength(password);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run(async () => {
      const auth = getMembershipAdapters().auth;
      const email = String(data.get("email") ?? "");
      if (reset) return (await auth.resetPassword(email)).message;
      const credentials = { email, password };
      if (register) {
        const input: Registration = { ...credentials, name: String(data.get("name") ?? ""), privacy: data.get("privacy") === "on", consent: data.get("consent") === "on", marketing: data.get("marketing") === "on" };
        await auth.signUp(input);
      } else await auth.signInWithEmail(credentials);
      setPassword("");
      router.push("/hesabim");
    });
  }
  return <div>
    <GoogleButton busy={busy} onClick={() => void run(async () => { await getMembershipAdapters().auth.signInWithGoogle(); router.push("/hesabim"); })} />
    <p className={styles.separator}>veya</p>
    <form onSubmit={submit} noValidate className={styles.form} aria-label={reset ? "Şifre sıfırlama" : register ? "E-posta ile üyelik" : "E-posta ile giriş"} aria-busy={busy}>
      {reset && <h2 className="text-xl">Şifrenizi sıfırlayın</h2>}
      <fieldset disabled={busy}>
        {!register && !reset && <p className={styles.muted}>Demo e-posta girişi için önce üye olun. Giriş bilgileri sayfa yenilenince sıfırlanır.</p>}
        {register && <Field id="auth-name" name="name" label="Ad soyad" autoComplete="name" maxLength={100} required error={errors.name} />}
        <Field id="auth-email" name="email" label="E-posta" type="email" autoComplete="email" inputMode="email" maxLength={254} required error={errors.email} />
        {!reset && <div className={styles.field}>
          <label htmlFor="auth-password">Şifre</label>
          <div className={styles.password}>
            <Input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} minLength={register ? 8 : undefined} maxLength={128} required aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : register ? "password-hint" : undefined} />
            <Button variant="outline" size="icon" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>
          </div>
          {register && <><small id="password-hint" className={styles.muted}>8–128 karakter; büyük/küçük harf ve rakam kullanın.</small><div className={styles.strength}><meter min={0} max={4} value={strength} aria-label="Şifre gücü" /><span>{password ? ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"][strength] : "Şifre gücü"}</span></div></>}
          {errors.password && <small id="password-error" className={styles.error}>{errors.password}</small>}
        </div>}
        {register && <div className={styles.consents}>
          <Consent name="privacy" error={errors.privacy}><Link href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK aydınlatma metnini</Link> okudum. (Zorunlu)</Consent>
          <Consent name="consent" error={errors.consent}>Açık rıza: üyelik bilgilerimin üyelik işlemleri için işlenmesine rıza veriyorum. (Zorunlu)</Consent>
          <Consent name="marketing">Ticari ileti almak istiyorum. (İsteğe bağlı)</Consent>
        </div>}
        <Feedback {...feedback} />
        <Button type="submit" className="w-full">{busy ? "İşleniyor…" : reset ? "Sıfırlama bağlantısı iste" : register ? "Üyelik oluştur" : "E-posta ile giriş yap"}</Button>
        {!register && <Button variant="link" className="justify-start px-0" onClick={() => { setReset(!reset); setPassword(""); }}>{reset ? "Girişe dön" : "Şifremi unuttum"}</Button>}
      </fieldset>
    </form>
  </div>;
}

function Consent({ name, error, children }: { name: string; error?: string; children: ReactNode }) {
  return <div><label className={styles.check}><input name={name} type="checkbox" required={name !== "marketing"} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} /><span>{children}</span></label>{error && <p id={`${name}-error`} className={styles.error}>{error}</p>}</div>;
}
