"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type JSX, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessCustomerTypes, businessEnquiryLimits, buildBusinessEnquiry, type BusinessEnquiryErrors, type BusinessEnquiryValues } from "@/lib/contracts/business-enquiry";
import type { WholesaleSubmit } from "@/lib/contracts/wholesale";
import type { Product } from "@/types/catalog";
import styles from "./RenewalLanding.module.css";

const initial: BusinessEnquiryValues = { company: "", contact: "", phone: "", email: "", city: "", productId: "", packaging: "", consumption: "", deliveryRegion: "", customerType: "" };
const subscribe = () => () => {};
const client = () => true;
const server = () => false;

// 21st.dev/kevingirelli/contact-form (35258): responsive two-column form,
// injected submit handler and persistent status/error regions. No demo submission.
export function BusinessEnquiry({ products, submitRequest }: { products: readonly Product[]; submitRequest?: WholesaleSubmit }): JSX.Element {
  const id = useId();
  const hydrated = useSyncExternalStore(subscribe, client, server);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<BusinessEnquiryErrors>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const busy = useRef(false);
  const result = useRef<HTMLParagraphElement>(null);
  const pending = status === "pending";
  useEffect(() => { if (status === "success" || status === "error") result.current?.focus(); }, [status]);

  function field(key: keyof BusinessEnquiryValues) {
    return { id: `${id}-${key}`, name: key, value: values[key], maxLength: businessEnquiryLimits[key],
      "aria-invalid": Boolean(errors[key]) || undefined, "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
      onChange: (event: { target: { value: string } }) => { setValues(previous => ({ ...previous, [key]: event.target.value })); setErrors(previous => ({ ...previous, [key]: undefined })); setStatus("idle"); } };
  }
  function error(key: keyof BusinessEnquiryValues) {
    return errors[key] ? <span id={`${id}-${key}-error`} className={styles.fieldError}>{errors[key]}</span> : null;
  }
  async function submit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!submitRequest || busy.current) return;
    const checked = buildBusinessEnquiry(values, products);
    setConsentError(!consent);
    if (!checked.ok) {
      setErrors(checked.errors);
      (event.currentTarget.elements.namedItem(Object.keys(checked.errors)[0]) as HTMLElement | null)?.focus();
      return;
    }
    if (!consent) { (event.currentTarget.elements.namedItem("kvkk") as HTMLElement)?.focus(); return; }
    busy.current = true;
    setErrors({}); setStatus("pending");
    try {
      const response = await submitRequest(checked.data);
      if (!response.ok) { setStatus("error"); return; }
      setValues(initial); setConsent(false); setStatus("success");
    } catch { setStatus("error"); }
    finally { busy.current = false; }
  }
  return <form aria-label="Kurumsal teklif talebi" className={styles.businessForm} onSubmit={submit} noValidate method="post" aria-busy={pending} aria-describedby={`${id}-status`}>
    <fieldset disabled={!hydrated || pending} className={styles.formFields}>
      {([
        ["company", "Firma adı", "organization"], ["contact", "Yetkili kişi", "name"], ["phone", "Telefon", "tel"],
        ["email", "E-posta (isteğe bağlı)", "email"], ["city", "Şehir", "address-level1"],
      ] as const).map(([key, label, autocomplete]) => <div key={key} className={styles.formField}>
        <label htmlFor={`${id}-${key}`}>{label}</label>
        <Input {...field(key)} type={key === "phone" ? "tel" : key === "email" ? "email" : "text"} autoComplete={autocomplete} required={key !== "email"} />{error(key)}
      </div>)}
      <div className={styles.formField}><label htmlFor={`${id}-customerType`}>İşletme türü</label>
        <select {...field("customerType")} required><option value="">Seçiniz</option>{businessCustomerTypes.map(type => <option key={type}>{type}</option>)}</select>{error("customerType")}</div>
      <div className={styles.formField}><label htmlFor={`${id}-productId`}>Ürün</label>
        <select {...field("productId")} required><option value="">Katalogdan seçiniz</option>{products.map(product => <option value={product.id} key={product.id}>{product.name} · {product.weight}</option>)}</select>{error("productId")}</div>
      {([
        ["packaging", "Ambalaj tercihi", "Örn. 3 L teneke"], ["consumption", "Tahmini aylık tüketim", "Miktar ve birim belirtin"], ["deliveryRegion", "Teslimat bölgesi", "İlçe / teslimat bölgesi"],
      ] as const).map(([key, label, placeholder]) => <div key={key} className={styles.formField}>
        <label htmlFor={`${id}-${key}`}>{label}</label><Input {...field(key)} required placeholder={placeholder} />{error(key)}
      </div>)}
      <div className={styles.formConsent}>
        <label><input type="checkbox" name="kvkk" checked={consent} onChange={event => { setConsent(event.target.checked); setConsentError(false); }} required aria-invalid={consentError || undefined} aria-describedby={consentError ? `${id}-consent-error` : undefined} />
          <span><a href="/kvkk">KVKK aydınlatma metnini</a> okudum.</span></label>
        {consentError && <p id={`${id}-consent-error`} className={styles.fieldError}>KVKK aydınlatma metnini okuduğunuzu belirtin.</p>}
      </div>
    </fieldset>
    <Button type="submit" disabled={!hydrated || pending || !submitRequest} className={styles.sendButton}>{pending ? "Gönderiliyor…" : "Teklif talebini gönder"}</Button>
    <p ref={result} tabIndex={-1} id={`${id}-status`} role="status" aria-atomic="true" className={styles.formStatus}>
      {!submitRequest ? "Teklif formundan gönderim şu anda kapalı. İletişim kanalı açıldığında buradan talebinizi iletebilirsiniz." : status === "success" ? "Talebiniz gönderildi." : pending ? "Talebiniz gönderiliyor…" : ""}
    </p>
    <p role="alert" className={styles.fieldError}>{status === "error" ? "Talebiniz gönderilemedi. Bilgileriniz korunuyor; tekrar deneyin." : Object.keys(errors).length ? "Lütfen işaretli alanları kontrol edin." : ""}</p>
  </form>;
}
