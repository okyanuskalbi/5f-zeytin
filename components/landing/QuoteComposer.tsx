"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type JSX, type SubmitEvent } from "react";
import { AnimatePresence, m as motion, useIsPresent } from "motion/react";
import { buildQuoteMailto, cleanQuoteLine, corporateContact, type QuoteEmailDraft } from "@/lib/site/corporate-contact";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import type { ProductVariant } from "@/types/catalog";
import { useQuoteJourney, type BusinessSegment } from "./QuoteJourneyProvider";
import styles from "./QuoteComposer.module.css";

const businessLabels: Record<Exclude<BusinessSegment, "">, string> = {
  hospitality: "Otel & restoran", retail: "Market & bayi", bulk: "Toplu tüketim",
};
type Field = "name" | "quantity" | "city" | "phone";
type Errors = Partial<Record<Field | "segment" | "productId" | "consent", string>>;
type PreparedQuote = { fingerprint: string; draft: QuoteEmailDraft; stock: number };
const limits: Record<Field, number> = { name: 120, quantity: 100, city: 80, phone: 30 };
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
      {[["Ad / firma", quote.draft.name], ["İşletme türü", quote.draft.business], ["Ürün", quote.draft.product],
        ["Miktar", quote.draft.quantity], ["Şehir", quote.draft.city], ["Telefon", quote.draft.phone],
        ["Katalog stok durumu", quote.stock > 0 ? "Mevcut" : "Mevcut değil"]].map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
    </dl>
    <p>Bu sayfa e-posta göndermedi. Gönderimi e-posta uygulamanızda tamamlayın. Alıcı {corporateContact.name}: {corporateContact.email}.</p>
    <p>Fiyat, stok, ambalaj ve teslimat koşulları teklif aşamasında teyit edilir.</p>
    <a className={styles.emailAction} href={present ? buildQuoteMailto(quote.draft) : undefined} tabIndex={present ? undefined : -1}>E-postayla gönder</a>
  </motion.section>;
}

/** 21st 35258 Contact Form: responsive labelled field groups and persistent
 * result/error regions, adapted to a real mail draft instead of demo success. */
export function QuoteComposer({ products }: { products: readonly ProductVariant[] }): JSX.Element {
  const id = useId();
  const journey = useQuoteJourney();
  const reduced = usePrefersReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [values, setValues] = useState<Record<Field, string>>({ name: "", quantity: "", city: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [prepared, setPrepared] = useState<PreparedQuote | null>(null);
  const product = products.find(item => item.id === journey.productId);
  const productId = product?.id ?? "";
  const fingerprint = JSON.stringify({ values, consent, segment: journey.segment,
    product: product && { id: product.id, name: product.name, weight: product.weight, stock: product.stock, priceKurus: product.priceKurus } });
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
  function prepare(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const next: Errors = {};
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, cleanQuoteLine(value)])) as Record<Field, string>;
    for (const name of Object.keys(limits) as Field[]) {
      if (clean[name].length < (name === "quantity" ? 1 : 2) || clean[name].length > limits[name]) next[name] = "Bu alanı uygun uzunlukta doldurun.";
    }
    const phoneDigits = clean.phone.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(clean.phone) || phoneDigits.length < 7 || phoneDigits.length > 15) next.phone = "Geçerli bir telefon numarası girin.";
    if (!Object.hasOwn(businessLabels, journey.segment)) next.segment = "İşletme türünü seçin.";
    if (!product) next.productId = "Mevcut ürünlerden birini seçin.";
    if (!consent) next.consent = "KVKK aydınlatma metnini okuduğunuzu belirtin.";
    setErrors(next);
    if (Object.keys(next).length || !product || !journey.segment) {
      setPrepared(null);
      const first = Object.keys(next)[0];
      (event.currentTarget.elements.namedItem(first === "consent" ? "kvkk" : first) as HTMLElement | null)?.focus();
      return;
    }
    setPrepared({ fingerprint, stock: product.stock, draft: {
      ...clean, business: businessLabels[journey.segment], product: `${product.name} · ${product.weight}`,
    } });
  }

  return <div className={styles.composer} data-quote-composer="" data-ui-source="21st-35258">
    <p className={styles.explanation}>Talebinizi hazırlayın; göndermek için e-posta uygulamanız açılır. Alıcı {corporateContact.name}’nun kurumsal iletişim adresidir.</p>
    <form aria-label="Kurumsal teklif talebi" noValidate method="post" onSubmit={prepare} aria-describedby={`${id}-status`}>
      <fieldset disabled={!hydrated} className={styles.fields}>
        <div className={styles.field}><label htmlFor={`${id}-name`}>Adınız veya firma adı</label><input {...field("name")} autoComplete="organization" />{error("name")}</div>
        <div className={styles.field}><label htmlFor={`${id}-segment`}>İşletme türü</label>
          <select id={`${id}-segment`} name="segment" required value={journey.segment} aria-invalid={!!errors.segment || undefined} aria-describedby={errors.segment ? `${id}-segment-error` : undefined}
            onChange={event => { journey.chooseSegment(event.target.value as BusinessSegment); clearError("segment"); }}>
            <option value="">Seçiniz</option>{Object.entries(businessLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>{error("segment")}</div>
        <div className={`${styles.field} ${styles.full}`}><label htmlFor={`${id}-product`}>İlgilendiğiniz ürün</label>
          <select id={`${id}-product`} name="productId" required value={productId} aria-invalid={!!errors.productId || undefined} aria-describedby={errors.productId ? `${id}-productId-error` : undefined}
            onChange={event => { journey.chooseProduct(event.target.value); clearError("productId"); }}>
            <option value="">{products.length ? "Katalogdan seçiniz" : "Şu anda ürün listelenmiyor"}</option>
            {products.map(item => <option key={item.id} value={item.id}>{item.name} · {item.weight}</option>)}
          </select>{error("productId")}</div>
        <div className={styles.field}><label htmlFor={`${id}-quantity`}>Miktar</label><input {...field("quantity")} placeholder="Örn. aylık 100 kg" />{error("quantity")}</div>
        <div className={styles.field}><label htmlFor={`${id}-city`}>Şehir</label><input {...field("city")} autoComplete="address-level1" />{error("city")}</div>
        <div className={`${styles.field} ${styles.full}`}><label htmlFor={`${id}-phone`}>Telefon</label><input {...field("phone")} type="tel" autoComplete="tel" />{error("phone")}</div>
        <div className={`${styles.consent} ${styles.full}`}>
          <label><input type="checkbox" name="kvkk" checked={consent} required aria-invalid={!!errors.consent || undefined} aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
            onChange={event => { setConsent(event.target.checked); clearError("consent"); }} /><span><a href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK aydınlatma metnini</a> okudum.</span></label>
          {error("consent")}
        </div>
      </fieldset>
      <button className={styles.prepare} type="submit" disabled={!hydrated}>Talep özetini hazırla</button>
      <p className={styles.status} id={`${id}-status`} role="status" aria-atomic="true">{summary ? "Talep özetiniz hazır. E-posta henüz gönderilmedi." : ""}</p>
      <p role="alert" className={styles.error}>{Object.values(errors).some(Boolean) ? "Lütfen işaretli alanları kontrol edin." : ""}</p>
    </form>
    <AnimatePresence initial={false}>{summary && <QuoteSummary key="quote-summary" quote={summary} reduced={reduced} />}</AnimatePresence>
    <div className={styles.contact}>
      <p>E-posta uygulamanız yoksa çatı şirketin kurumsal iletişim kanalını kullanabilirsiniz.</p>
      <a href={`tel:${corporateContact.phone}`}>{corporateContact.name}’nu arayın · {corporateContact.displayPhone}</a>
      <a href={`mailto:${corporateContact.email}`}>Kurumsal e-posta · {corporateContact.email}</a>
    </div>
    <noscript><p>Talep özeti hazırlamak için JavaScript gerekir. Yukarıdaki kurumsal e-posta veya telefon bağlantısını kullanabilirsiniz.</p></noscript>
  </div>;
}
