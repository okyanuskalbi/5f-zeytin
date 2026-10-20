"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/account/GoogleButton";
import { useCart } from "@/components/cart/CartProvider";
import { EmptyState } from "@/components/site/EmptyState";
import { PaytrPreviewControl } from "./PaymentPreview";
import { CheckoutFields } from "./CheckoutFields";
import { CheckoutSummary } from "./CheckoutSummary";
import { createCheckoutAdapter, type CheckoutDetails, type CheckoutErrors } from "@/lib/checkout/adapter";
import { createMockAuthAdapter } from "@/lib/auth/adapter";
import { motionTokens } from "@/lib/ui-motion";
import styles from "./Checkout.module.css";

const initialDetails: CheckoutDetails = { name: "", email: "", phone: "", city: "", district: "", neighborhood: "", address: "", postalCode: "", billingType: "individual", company: "", taxNumber: "", taxOffice: "" };
const steps = ["Bilgiler", "Teslimat", "Ödeme"];

/** 21st preetsuthar17 Checkout Block (8339): three-step state and persistent summary.
 * AFİNA adaptation: guest flow, unknown charges, no card fields or icon/card grid.
 * Contact/address/consents live in React memory, never URL or storage.
 */
export function Checkout({ localPreviewAvailable = false }: { localPreviewAvailable?: boolean }) {
  const cart = useCart();
  const [adapter] = useState(createCheckoutAdapter);
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<CheckoutDetails>(initialDetails);
  const [shipping, setShipping] = useState("");
  const [sale, setSale] = useState(false);
  const [information, setInformation] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleMessage, setGoogleMessage] = useState("");
  const googleLock = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (previousStep.current !== step) { previousStep.current = step; stepRef.current?.focus(); }
  }, [step]);
  useEffect(() => { if (Object.keys(errors).length) errorRef.current?.focus(); }, [errors]);

  if (!adapter) return <EmptyState title="Ödeme" href="/sepet" action="Sepetime dön"><p>Yakında. Ödeme henüz kullanıma açık değil.</p></EmptyState>;
  if (!cart || !cart.state.hydrated) return <EmptyState title="Ödeme" href="/sepet" action="Sepetime dön"><p role="status">Sepet yükleniyor…</p></EmptyState>;
  if (cart.products === null) return <EmptyState title="Ödeme" href="/sepet" action="Sepetime dön"><p role="alert">Katalog yüklenemedi. Sepetiniz korunuyor; sepetten fiyat ve stokları yenileyin.</p></EmptyState>;
  if (!cart.state.items.length) return <EmptyState title="Ödeme" href="/sepet" action="Sepetime dön"><p>Sepetiniz boş. Önce ürünlerinizi seçin.</p></EmptyState>;
  const summary = adapter.summary(cart.state.items, cart.products);
  if (!summary.ready) return <EmptyState title="Ödeme" href="/sepet" action="Sepetime dön"><p role="alert">Sepetteki ürün veya stok bilgisi değişti. Sepetinizi gözden geçirin.</p></EmptyState>;

  function change(key: keyof CheckoutDetails, value: string) {
    setDetails(current => ({ ...current, [key]: value, ...(key === "city" ? { district: "" } : {}), ...(key === "billingType" && value === "individual" ? { company: "", taxNumber: "", taxOffice: "" } : {}) }));
    // Do not refocus a live error summary while someone is correcting a field.
  }
  function go(next: number) {
    setErrors({}); setPaymentOpen(false); setStep(next);
    setSale(false); setInformation(false);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: CheckoutErrors = step === 1 ? adapter!.validateDetails(details)
      : step === 2 ? (adapter!.shippingOptions().some(option => option.id === shipping) ? {} : { shipping: "Kargo seçimini yapın." })
      : { ...(!sale ? { sale: "Mesafeli satış sözleşmesini onaylayın." } : {}), ...(!information ? { information: "Ön bilgilendirme metnini onaylayın." } : {}) };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (step < 3) go(step + 1);
    else setPaymentOpen(true);
  }
  async function google() {
    if (googleLock.current) return;
    googleLock.current = true; setGoogleBusy(true); setGoogleMessage("");
    try {
      const session = await createMockAuthAdapter(window.sessionStorage).signInWithGoogle();
      setDetails(current => ({ ...current, name: current.name || session.name, email: session.email }));
      setGoogleMessage("Demo Google profili kullanılıyor. Gerçek Google bağlantısı kurulmadı.");
    } catch { setGoogleMessage("Demo giriş açılamadı. Misafir olarak devam edebilirsiniz."); }
    finally { googleLock.current = false; setGoogleBusy(false); }
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>Sofranıza bir adım daha.</h1>
      <p className={styles.muted}>Bilgilerinizi girin, teslimat seçimini gözden geçirin.</p>
      <Link href="/sepet" className={styles.link}>Sepetime dön</Link>
    </header>
    <p className={styles.demo}><strong>Demo ödeme.</strong> Örnek bilgiler kullanın. Gerçek sipariş, üyelik veya tahsilat oluşturulmaz. Adres bilgileri sayfa yenilendiğinde silinir.</p>
    <nav aria-label="Ödeme adımları">
      <ol className={styles.steps}>
        {steps.map((label, index) => <li key={label}>
          <Button variant="ghost" aria-current={step === index + 1 ? "step" : undefined} disabled={index + 1 > step} onClick={() => go(index + 1)}><span>{index + 1}</span>{label}</Button>
        </li>)}
      </ol>
      <div className={styles.progress} aria-hidden="true"><motion.div initial={false} animate={{ scaleX: step / steps.length }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }} data-testid="checkout-progress" /></div>
    </nav>
    <div className={styles.layout}>
      <div className={styles.content}>
        <section className={styles.section} aria-labelledby="checkout-step-title">
          <h2 id="checkout-step-title" ref={stepRef} tabIndex={-1}>{step === 1 ? "İletişim ve adres" : step === 2 ? "Teslimat seçimi" : "Ödeme onayı"}</h2>
          {step === 1 && <div className={styles.signIn}>
            <p>Google ile hızlı giriş</p>
            <GoogleButton busy={googleBusy} onClick={() => void google()} />
            <p className={styles.muted}>Misafir olarak devam edebilirsiniz. Demo giriş gerçek kimlik doğrulaması yapmaz.</p>
            <p role="status" aria-live="polite">{googleMessage}</p>
          </div>}
          <form className={styles.form} noValidate onSubmit={submit}>
            {Object.keys(errors).length > 0 && <div ref={errorRef} tabIndex={-1} role="alert" aria-live="assertive" className={styles.errorSummary}>
              <p>Lütfen aşağıdaki alanları kontrol edin.</p>
              <ul>{Object.entries(errors).map(([key, error]) => <li key={key}><a href={`#checkout-${key}`}>{error}</a></li>)}</ul>
            </div>}
            {step === 1 && <CheckoutFields details={details} errors={errors} adapter={adapter} onChange={change} />}
            {step === 2 && <>
              <address className={styles.address}><p>{details.name}</p><p>{details.neighborhood}, {details.address}</p><p>{details.postalCode} · {details.district} / {details.city}</p></address>
              <fieldset>
                <legend>Kargo seçimi</legend>
                {adapter.shippingOptions().map(option => <label key={option.id} className={styles.choice}>
                  <input id="checkout-shipping" type="radio" name="shipping" required value={option.id} checked={shipping === option.id}
                    aria-describedby={errors.shipping ? "checkout-shipping-error" : "checkout-shipping-hint"} onChange={() => setShipping(option.id)} />
                  <span>{option.name}<br /><span className={styles.muted}>{option.description}</span></span>
                </label>)}
                {errors.shipping && <p id="checkout-shipping-error" className={styles.error}>{errors.shipping}</p>}
              </fieldset>
              <p id="checkout-shipping-hint" className={styles.muted}>Kargo seçeneği temsilidir. Firma ve ücret henüz belirlenmedi.</p>
            </>}
            {step === 3 && <>
              <p className={styles.muted}>Standart kargo. Firma ve ücret henüz belirlenmedi. Metinler taslaktır; gerçek satış başlatılmaz.</p>
              <div>
                <label className={styles.choice}>
                  <input id="checkout-sale" type="checkbox" required checked={sale} aria-invalid={!!errors.sale} aria-describedby={errors.sale ? "checkout-sale-error" : undefined} onChange={event => { setSale(event.target.checked); setPaymentOpen(false); }} />
                  <span><Link href="/mesafeli-satis" target="_blank" rel="noopener noreferrer">Mesafeli satış sözleşmesi (taslak)</Link> metnini okudum, onaylıyorum.</span>
                </label>
                {errors.sale && <p id="checkout-sale-error" className={styles.error}>{errors.sale}</p>}
                <label className={styles.choice}>
                  <input id="checkout-information" type="checkbox" required checked={information} aria-invalid={!!errors.information} aria-describedby={errors.information ? "checkout-information-error" : undefined} onChange={event => { setInformation(event.target.checked); setPaymentOpen(false); }} />
                  <span><Link href="/mesafeli-satis#taslak-basligi" target="_blank" rel="noopener noreferrer">Ön bilgilendirme (taslak)</Link> metnini okudum, onaylıyorum.</span>
                </label>
                {errors.information && <p id="checkout-information-error" className={styles.error}>{errors.information}</p>}
              </div>
            </>}
            <div className={styles.actions}>
              {step > 1 && <Button type="button" variant="outline" onClick={() => go(step - 1)}>{step === 2 ? "Bilgilere dön" : "Teslimata dön"}</Button>}
              <Button type="submit" disabled={paymentOpen}>{step === 1 ? "Teslimata devam et" : step === 2 ? "Ödemeye devam et" : "PayTR ekranına geç"}</Button>
            </div>
          </form>
          {step === 3 && paymentOpen && sale && information && <section className={styles.section} aria-label="PayTR ödeme alanı">
            <h3>PayTR test ekranı</h3>
            <p className={styles.note}>Bu ekran yalnız sabit örnek siparişin yerel test önizlemesidir. Sepetinizden tahsilat yapmaz. Kart ve 3D Secure bilgileri yalnız PayTR çerçevesine girilir.</p>
            <PaytrPreviewControl keysAvailable={localPreviewAvailable} unavailableMessage="Test anahtarı eksik veya ödeme bağlantısı henüz hazır değil. Ödeme başlatılmadı." />
            <p className={styles.muted}>Ödeme sonucu yalnız sunucuda doğrulanabilir. Bu demo ödeme sonucu veya sipariş onayı göstermez.</p>
          </section>}
        </section>
      </div>
      <CheckoutSummary summary={summary} />
    </div>
  </main>;
}
