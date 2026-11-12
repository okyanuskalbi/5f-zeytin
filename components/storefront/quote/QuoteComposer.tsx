"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type JSX, type SubmitEvent } from "react";
import { AnimatePresence, m as motion, useIsPresent } from "motion/react";
import { buildQuoteMailto, cleanQuoteLine, corporateContact, type QuoteEmailDraft } from "@/lib/site/corporate-contact";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import type { ProductVariant } from "@/types/catalog";
import { useQuoteJourney, type BusinessSegment } from "./QuoteJourneyProvider";
import styles from "./QuoteComposer.module.css";
import { AddressSearchField } from "@/components/ui/address-search-field";
import { DeferredPhoneField } from "@/components/storefront/forms/DeferredPhoneField";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { DeferredQuoteProductPicker as QuoteProductPicker } from "./DeferredQuoteProductPicker";
import { validateQuoteQuantity } from "@/lib/site/quote-lines";

const businessLabels: Record<Exclude<BusinessSegment, "">, string> = {
  hospitality: "Otel & restoran", retail: "Market & bayi", bulk: "Toplu tüketim",
};
type Field = "name" | "city" | "district" | "phone";
type Errors = Partial<Record<Field | "segment" | "productId" | "consent", string>>;
type PreparedQuote = { fingerprint: string; draft: QuoteEmailDraft; lines: { id: string; product: string; quantity: number; stock: number }[] };
const limits: Record<Field, number> = { name: 120, city: 80, district: 80, phone: 30 };
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function QuoteSummary({ quote, reduced }: { quote: PreparedQuote; reduced: boolean }): JSX.Element {
  const present = useIsPresent();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (present) heading.current?.focus(); }, [present]);
  return <motion.section className={styles.summary} aria-label="Talep özeti" aria-hidden={!present || undefined}
    initial={reduced ? false : { opacity: motionTokens.entrance.opacity, y: motionTokens.entrance.distance }}
    animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, pointerEvents: "none" }} transition={reduced ? { duration: 0 } : springs.editorial}>
    <h3 ref={heading} tabIndex={-1}>Talep özeti</h3>
    <dl>
      {[["Ad / firma", quote.draft.name], ["İşletme türü", quote.draft.business],
        ["Şehir", quote.draft.city], ["İlçe", quote.draft.district], ["Telefon", quote.draft.phone]].map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
    </dl>
    <ul className={styles.summaryProducts} aria-label="Seçilen ürünler ve adetler">
      {quote.lines.map(line => <li key={line.id}><span>{line.product.replace(" · ", ", ")}<small>Katalog stok durumu: {line.stock > 0 ? "Mevcut" : "Mevcut değil"}</small></span><strong>{line.quantity.toLocaleString("tr-TR")} adet</strong></li>)}
    </ul>
    <p>Bu sayfa e-posta göndermedi. Gönderimi e-posta uygulamanızda tamamlayın. Alıcı {corporateContact.name}: {corporateContact.email}.</p>
    <p>Fiyat, stok, ambalaj ve teslimat koşulları teklif aşamasında teyit edilir.</p>
    {present && <PillButton href={buildQuoteMailto(quote.draft)} fullWidth>E-postayla gönder</PillButton>}
  </motion.section>;
}

/** 21st 27904 Contact01: compact labelled field groups and persistent
 * result/error regions, adapted to a real mail draft instead of demo success. */
export function QuoteComposer({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  const id = useId();
  const journey = useQuoteJourney();
  const reduced = usePrefersReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [values, setValues] = useState<Record<Field, string>>({ name: "", city: "", district: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const submitting = useRef(false);
  const [preparing, setPreparing] = useState(false);
  const [prepared, setPrepared] = useState<PreparedQuote | null>(null);
  const lastPhone = useRef("");
  const updatePhone = useCallback((phone: string) => {
    if (lastPhone.current === phone) return;
    lastPhone.current = phone;
    setValues(previous => previous.phone === phone ? previous : { ...previous, phone });
    setErrors(previous => previous.phone ? { ...previous, phone: undefined } : previous);
  }, []);
  const selected = products.filter(product => Object.hasOwn(journey.quantities, product.id));
  const fingerprint = JSON.stringify({ values, consent, segment: journey.segment, quantities: journey.quantities,
    products: selected.map(product => ({ id: product.id, name: product.name, weight: product.weight, stock: product.stock, priceKurus: product.priceKurus })) });
  const latestFingerprint = useRef(fingerprint);
  useLayoutEffect(() => { latestFingerprint.current = fingerprint; }, [fingerprint]);
  const summary = prepared?.fingerprint === fingerprint ? prepared : null;

  function clearError(field: keyof Errors): void { setErrors(previous => ({ ...previous, [field]: undefined })); }
  function field(name: Field) {
    return { id: `${id}-${name}`, name, value: values[name], maxLength: limits[name], required: true,
      "aria-invalid": !!errors[name] || undefined, "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
      onChange: (event: { target: { value: string } }) => {
        setValues(previous => ({ ...previous, [name]: event.target.value })); clearError(name);
      } };
  }
  function error(name: keyof Errors): JSX.Element | null {
    return errors[name] ? <span id={`${id}-${name}-error`} className={styles.error}>{errors[name]}</span> : null;
  }
  async function prepare(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPreparing(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const next: Errors = {};
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, cleanQuoteLine(value)])) as Record<Field, string>;
    for (const name of Object.keys(limits) as Field[]) {
      if (clean[name].length < 2 || clean[name].length > limits[name]) next[name] = "Bu alanı uygun uzunlukta doldurun.";
    }
    try {
      const { phoneForm } = await import("@/lib/contact/customer-phone");
      try {
        const contact = phoneForm(formData, "phone");
        if (!contact.phone) next.phone = "Geçerli bir telefon numarası girin.";
        else clean.phone = contact.phone;
      } catch { next.phone = "Seçili ülkeye uygun geçerli bir telefon numarası girin."; }
    } catch { next.phone = "Telefon doğrulaması yüklenemedi. Yeniden deneyin."; }
    finally { submitting.current = false; setPreparing(false); }
    // The import can finish after a product, field or consent edit. Do not
    // overwrite that newer interaction with errors from the old snapshot.
    if (latestFingerprint.current !== fingerprint) return;
    if (!Object.hasOwn(businessLabels, journey.segment)) next.segment = "İşletme türünü seçin.";
    const lines = selected.map(product => ({ id: product.id, product: `${product.name} · ${product.weight}`, quantity: validateQuoteQuantity(journey.quantities[product.id]), stock: product.stock }));
    if (!lines.length) next.productId = "En az bir ürün seçin.";
    else if (selected.length !== Object.keys(journey.quantities).length) next.productId = "Seçiminizde artık katalogda bulunmayan ürün var. Ürün seçimini güncelleyin.";
    else if (lines.some(line => line.quantity === null)) next.productId = "Her ürün için 1-99.999 arasında tam adet girin.";
    if (!consent) next.consent = "KVKK aydınlatma metnini okuduğunuzu belirtin.";
    setErrors(next);
    if (Object.keys(next).length || !journey.segment) {
      setPrepared(null);
      const first = Object.keys(next)[0];
      (form.elements.namedItem(first === "consent" ? "kvkk" : first) as HTMLElement | null)?.focus();
      return;
    }
    // Every selected row has passed the catalogue and integer checks above.
    const validated = lines.map(line => ({ ...line, quantity: line.quantity! }));
    setPrepared({ fingerprint, lines: validated, draft: {
      ...clean, business: businessLabels[journey.segment], items: validated.map(({ product, quantity }) => ({ product, quantity })),
    } });
  }

  return <div className={styles.composer} data-quote-composer="" data-ui-source="21st-27904">
    <p className={styles.explanation}>Form, talebinizin e-posta taslağını hazırlar. Gönderimi e-posta uygulamanızda siz tamamlarsınız.</p>
    <form aria-label="Kurumsal teklif talebi" noValidate method="post" onSubmit={prepare} aria-describedby={`${id}-status`}>
      <fieldset disabled={!hydrated} className={styles.fields}>
        <div className={styles.field}><label htmlFor={`${id}-name`}>Adınız veya firma adı</label><input {...field("name")} autoComplete="organization" />{error("name")}</div>
        <div className={styles.field}><label htmlFor={`${id}-segment`}>İşletme türü</label>
          <select id={`${id}-segment`} name="segment" required value={journey.segment} aria-invalid={!!errors.segment || undefined} aria-describedby={errors.segment ? `${id}-segment-error` : undefined}
            onChange={event => { journey.chooseSegment(event.target.value as BusinessSegment); clearError("segment"); }}>
            <option value="">Seçiniz</option>{Object.entries(businessLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>{error("segment")}</div>
        <div className={`${styles.field} ${styles.product}`}><label htmlFor={`${id}-products`}>İlgilendiğiniz ürünler</label>
          <QuoteProductPicker id={`${id}-products`} products={products} quantities={journey.quantities} disabled={!hydrated}
            onChange={next => { journey.setQuantities(next); clearError("productId"); }} invalid={!!errors.productId} errorId={errors.productId ? `${id}-productId-error` : undefined} />
          {error("productId")}
        </div>
        <div className={`${styles.field} ${styles.location}`}><AddressSearchField name="city" label="Şehir" value={values.city} kind="city" lang="tr" placeholder="Şehir seçin" autoComplete="address-level1" invalid={!!errors.city} errorId={errors.city ? `${id}-city-error` : undefined}
          onChange={city => { setValues(previous => previous.city === city ? previous : { ...previous, city, district: "" }); clearError("city"); clearError("district"); }} />{error("city")}</div>
        <div className={`${styles.field} ${styles.location}`}><AddressSearchField key={values.city} name="district" label="İlçe" value={values.district} kind="district" city={values.city} lang="tr" placeholder="İlçe seçin" autoComplete="address-level2" invalid={!!errors.district} errorId={errors.district ? `${id}-district-error` : undefined}
          onChange={district => { setValues(previous => ({ ...previous, district })); clearError("district"); }} />{error("district")}</div>
        <div className={styles.phone}><DeferredPhoneField name="phone" lang="tr" autoComplete="section-quote" onValueChange={updatePhone} invalid={!!errors.phone} errorId={errors.phone ? `${id}-phone-error` : undefined} />{error("phone")}</div>
        <div className={styles.consent}>
          <label><input type="checkbox" name="kvkk" checked={consent} required aria-invalid={!!errors.consent || undefined} aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
            onChange={event => { setConsent(event.target.checked); clearError("consent"); }} /><span><a href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK aydınlatma metnini</a> okudum.</span></label>
          {error("consent")}
        </div>
        {/* Mounted afresh once the page is interactive: the pre-hydration disabled look gives way at once, with no colour fade on load. */}
        <PillButton key={hydrated ? "ready" : "waiting"} className={styles.prepare} type="submit" fullWidth disabled={!hydrated} busy={preparing}>Talep özetini hazırla</PillButton>
      </fieldset>
      <p className={styles.status} id={`${id}-status`} role="status" aria-atomic="true">{summary ? "Talep özetiniz hazır. E-posta henüz gönderilmedi." : ""}</p>
      <p role="alert" className={styles.error}>{Object.values(errors).some(Boolean) ? "Lütfen işaretli alanları kontrol edin." : ""}</p>
    </form>
    <AnimatePresence initial={false}>{summary && <QuoteSummary key="quote-summary" quote={summary} reduced={reduced} />}</AnimatePresence>
    <noscript><p>Talep özeti hazırlamak için JavaScript gerekir. İletişim bölümündeki e-posta veya telefon bağlantısını kullanabilirsiniz.</p></noscript>
  </div>;
}
