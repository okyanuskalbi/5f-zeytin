"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type JSX, type SubmitEvent } from "react";
import { AddressSearchField } from "@/components/ui/address-search-field";
import { DeferredPhoneField as CustomerPhoneField } from "@/components/storefront/forms/DeferredPhoneField";

import { corporateContact } from "@/lib/site/corporate-contact";
import type { DealershipDraft, DealershipErrors, DealershipField, dealershipLimits as Limits } from "@/lib/dealership/application";
import styles from "./DealershipForm.module.css";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const openMailto = (url: string) => window.location.assign(url);
const empty = { companyName: "", contactName: "", email: "", city: "", district: "", businessType: "", outletCount: "", message: "" };
type Values = typeof empty;

/** 21st 27904 Contact01: labeled groups and clear action;
 * adapted to the A single-column form and tokens and an explicitly user-sent email draft. */
export type DealershipConfiguration = { businessTypes: readonly string[]; outletCounts: readonly string[]; dealershipLimits: typeof Limits };
export function DealershipFormClient({ openDraft = openMailto, configuration }: { openDraft?: (url: string) => void; configuration: DealershipConfiguration }): JSX.Element {
  const { businessTypes, outletCounts, dealershipLimits } = configuration;
  const id = useId();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [values, setValues] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<DealershipErrors>({});
  const [prepared, setPrepared] = useState<DealershipDraft | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [launchFailed, setLaunchFailed] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const draftRequest = useRef(0);
  useLayoutEffect(() => { draftRequest.current++; }, [values, consent]);
  const preview = useRef<HTMLTextAreaElement>(null);
  const lastPhone = useRef("");
  const updatePhone = useCallback((phone: string) => {
    if (lastPhone.current === phone) return;
    lastPhone.current = phone;
    draftRequest.current++;
    setPrepared(null); setCopyStatus("");
    setErrors(previous => previous.phone ? { ...previous, phone: undefined } : previous);
  }, []);

  function invalidate(): void { setPrepared(null); setCopyStatus(""); }
  function update(field: keyof Values, value: string): void {
    setValues(previous => ({ ...previous, [field]: value, ...(field === "city" && previous.city !== value ? { district: "" } : {}) }));
    setErrors(previous => ({ ...previous, [field]: undefined, ...(field === "city" ? { district: undefined } : {}) }));
    invalidate();
  }
  function error(field: DealershipField): JSX.Element | null {
    return errors[field] ? <p id={`${id}-${field}-error`} className={styles.error}>{errors[field]?.replace(/[—–]/g, "-")}</p> : null;
  }
  function inputProps(field: keyof typeof Limits) {
    return { id: `${id}-${field}`, name: field, value: values[field], maxLength: dealershipLimits[field],
      "aria-invalid": !!errors[field] || undefined,
      "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined,
      onChange: (event: { target: { value: string } }) => update(field, event.target.value) };
  }
  async function prepare(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = new FormData(form);
    const request = ++draftRequest.current;
    setPreparing(true);
    try {
    const [{ dealershipSchema, createDealershipDraft }, { phoneDigits }] = await Promise.all([import("@/lib/dealership/application"), import("@/lib/contact/customer-phone")]);
    if (request !== draftRequest.current) return;
    const result = dealershipSchema.safeParse({ ...values, consent, phoneCountry: String(raw.get("phoneCountry") || ""), phoneNational: phoneDigits(String(raw.get("phone") || "")) });
    if (!result.success) {
      setErrors(result.errors); invalidate();
      const first = Object.keys(result.errors)[0];
      const control = form.elements.namedItem(first === "consent" ? "kvkk" : first);
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    const draft = createDealershipDraft(result.data);
    setErrors({}); setPrepared(draft); setCopyStatus(""); setLaunchFailed(false);
    try { openDraft(draft.mailto); } catch { setLaunchFailed(true); }
    } catch {
      if (request === draftRequest.current) setErrors({ companyName: "Form hazırlanamadı. Bağlantınızı kontrol edip yeniden deneyin." });
    } finally { setPreparing(false); }
  }
  async function copy(): Promise<void> {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(`${prepared.subject}\r\n\r\n${prepared.body}`);
      setCopyStatus("Başvuru metni kopyalandı. E-posta uygulamanızda gönderimi tamamlayabilirsiniz.");
    } catch {
      setCopyStatus("Metni aşağıdaki kutudan seçip kopyalayabilirsiniz.");
      preview.current?.focus(); preview.current?.select();
    }
  }

  return <div className={styles.root} data-dealership-form="" data-ui-source="21st-27904">
    <p className={styles.explanation} id={`${id}-help`}>Form başvurunuzun e-posta taslağını hazırlar. Gönderimi e-posta uygulamanızda siz tamamlarsınız. Yıldızlı alanlar zorunludur.</p>
    <form aria-label="Bayilik başvurusu" aria-describedby={`${id}-help`} noValidate method="post" onSubmit={prepare}>
      <fieldset className={styles.fields} disabled={!hydrated}>
        <div className={styles.field} data-dealership-field=""><label htmlFor={`${id}-companyName`}>Firma adı <span aria-hidden="true">*</span></label><input {...inputProps("companyName")} autoComplete="organization" required minLength={2} />{error("companyName")}</div>
        <div className={styles.field} data-dealership-field=""><label htmlFor={`${id}-contactName`}>Yetkili adı soyadı <span aria-hidden="true">*</span></label><input {...inputProps("contactName")} autoComplete="name" required minLength={2} />{error("contactName")}</div>
        <div className={styles.field} data-dealership-field=""><CustomerPhoneField name="phone" lang="tr" autoComplete="section-dealership" onValueChange={updatePhone} invalid={!!errors.phone} errorId={errors.phone ? `${id}-phone-error` : undefined} />{error("phone")}</div>
        <div className={styles.field} data-dealership-field=""><label htmlFor={`${id}-email`}>E-posta <span aria-hidden="true">*</span></label><input {...inputProps("email")} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required />{error("email")}</div>
        <div className={styles.field} data-dealership-field=""><AddressSearchField name="city" label="İl *" value={values.city} onChange={city => update("city", city)} kind="city" lang="tr" placeholder="İl seçin veya yazın" autoComplete="address-level1" invalid={!!errors.city} errorId={errors.city ? `${id}-city-error` : undefined} />{error("city")}</div>
        <div className={styles.field} data-dealership-field=""><AddressSearchField key={values.city} name="district" label="İlçe *" value={values.district} onChange={district => update("district", district)} kind="district" city={values.city} lang="tr" placeholder="İlçe seçin veya yazın" autoComplete="address-level2" invalid={!!errors.district} errorId={errors.district ? `${id}-district-error` : undefined} />{error("district")}</div>
        <div className={styles.field} data-dealership-field=""><label htmlFor={`${id}-businessType`}>İşletme türü <span aria-hidden="true">*</span></label><select id={`${id}-businessType`} name="businessType" required value={values.businessType} onChange={event => update("businessType", event.target.value)} aria-invalid={!!errors.businessType || undefined} aria-describedby={errors.businessType ? `${id}-businessType-error` : undefined}><option value="">Seçiniz</option>{businessTypes.map(type => <option key={type}>{type}</option>)}</select>{error("businessType")}</div>
        <div className={styles.field} data-dealership-field=""><label htmlFor={`${id}-outletCount`}>Satış noktası sayısı (isteğe bağlı)</label><select id={`${id}-outletCount`} name="outletCount" value={values.outletCount} onChange={event => update("outletCount", event.target.value)} aria-invalid={!!errors.outletCount || undefined} aria-describedby={errors.outletCount ? `${id}-outletCount-error` : undefined}><option value="">Belirtmek istemiyorum</option>{outletCounts.map(count => <option key={count} value={count}>{count.replaceAll("–", "-")}</option>)}</select>{error("outletCount")}</div>
        <div className={`${styles.field} ${styles.wide}`} data-dealership-field=""><label htmlFor={`${id}-message`}>Mesaj (isteğe bağlı, en çok 1000 karakter)</label><textarea {...inputProps("message")} rows={5} />{error("message")}</div>
        <div className={`${styles.consent} ${styles.wide}`} data-dealership-field="">
          <label><input type="checkbox" name="kvkk" checked={consent} required aria-invalid={!!errors.consent || undefined} aria-describedby={errors.consent ? `${id}-consent-error` : undefined} onChange={event => { setConsent(event.target.checked); setErrors(previous => ({ ...previous, consent: undefined })); invalidate(); }} /><span>KVKK aydınlatma metnini okudum. <span aria-hidden="true">*</span></span></label>
          <a href="/kvkk">KVKK aydınlatma metni</a>{error("consent")}
        </div>
        <button className={`${styles.submit} ${styles.wide}`} type="submit" disabled={!hydrated || preparing} aria-busy={preparing}>Başvuru E-postasını Hazırla</button>
      </fieldset>
      <p role="alert" className={styles.error}>{Object.values(errors).some(Boolean) ? "Lütfen işaretli alanları kontrol edin." : ""}</p>
    </form>
    <p role="status" aria-label="Başvuru durumu" aria-atomic="true" className={styles.status}>{prepared ? launchFailed ? "Başvuru taslağınız hazır. E-posta uygulamanız açılamadıysa metni kopyalayıp aşağıdaki adrese gönderebilirsiniz." : "E-posta uygulamanızda başvuru taslağı açıldı. Gönder'e bastığınızda başvurunuz bize ulaşır." : ""}{copyStatus && <> {copyStatus}</>}</p>
    {prepared && <div className={styles.fallback}>
      <p>E-posta uygulamanız açılmadıysa metni kopyalayıp <a href={`mailto:${corporateContact.email}`}>{corporateContact.email}</a> adresine gönderebilirsiniz.</p>
      <button type="button" onClick={() => void copy()}>Metni kopyala</button>
      <label htmlFor={`${id}-preview`}>Hazırlanan başvuru metni</label><textarea id={`${id}-preview`} ref={preview} readOnly rows={7} value={`${prepared.subject}\r\n\r\n${prepared.body}`.replace(/[—–]/g, "-")} />
    </div>}
    <noscript><p>Başvuru taslağını hazırlamak için JavaScript gerekir. Firma, yetkili, telefon, e-posta, il, ilçe ve işletme türü bilgilerinizi <a href={`mailto:${corporateContact.email}`}>{corporateContact.email}</a> adresine yazabilirsiniz.</p></noscript>
  </div>;
}
