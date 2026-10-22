"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type JSX, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import styles from "./WholesaleForm.module.css";
import {
  validateWholesaleRequest, wholesaleLimits,
  type WholesaleErrors, type WholesaleField, type WholesaleRequest, type WholesaleSubmit,
} from "@/lib/contracts/wholesale";

const empty: WholesaleRequest = { name: "", email: "", phone: "", message: "" };
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const unavailable = "Toptan iletişim bilgileri yakında paylaşılacak. Bilgileriniz gönderilmez.";
type Status = "idle" | "pending" | "success" | "error";

// Adapted from 21st kevingirelli/Contact Form (35258): two-column layout,
// injected submission and persistent live regions. No default contact/claim/demo timer.
export function WholesaleForm({ submitRequest }: { submitRequest?: WholesaleSubmit }): JSX.Element {
  const id = useId();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<WholesaleErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementError, setAcknowledgementError] = useState(false);
  const inFlight = useRef(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const pending = status === "pending";

  useEffect(() => {
    if (status === "success") statusRef.current?.focus({ preventScroll: true });
    if (status === "error") alertRef.current?.focus({ preventScroll: true });
  }, [status]);

  useEffect(() => {
    const textarea = messageRef.current;
    if (!textarea) return;
    function resize(): void {
      const style = getComputedStyle(textarea!);
      // Start at the responsive CSS minimum; height:auto retains rows=3 on SE.
      textarea!.style.height = style.minHeight;
      const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const height = Math.max(parseFloat(style.minHeight), Math.min(textarea!.scrollHeight + border, parseFloat(style.maxHeight)));
      if (Number.isFinite(height)) textarea!.style.height = `${height}px`;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [values.message]);

  function update(field: WholesaleField, value: string): void {
    setValues(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setStatus("idle");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (inFlight.current || !submitRequest) return;
    const validation = validateWholesaleRequest(values);
    setAcknowledgementError(!acknowledged);
    if (!validation.ok) {
      setStatus("idle");
      setErrors(validation.errors);
      const field = Object.keys(validation.errors)[0];
      const control = event.currentTarget.elements.namedItem(field);
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    if (!acknowledged) {
      setErrors({});
      setStatus("idle");
      (event.currentTarget.elements.namedItem("kvkk") as HTMLInputElement).focus();
      return;
    }
    setErrors({});
    inFlight.current = true;
    setStatus("pending");
    try {
      const result = await submitRequest(validation.data);
      if (result.ok !== true) { setStatus("error"); return; }
      setValues(empty);
      setAcknowledged(false);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }

  function fieldProps(field: WholesaleField) {
    return {
      id: `${id}-${field}`, name: field, value: values[field], maxLength: wholesaleLimits[field],
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": `${id}-${field}-hint${errors[field] ? ` ${id}-${field}-error` : ""}`,
      onChange: (event: { target: { value: string } }) => update(field, event.target.value),
    };
  }
  function error(field: WholesaleField): JSX.Element | null {
    return errors[field] ? <p id={`${id}-${field}-error`} className="text-base text-destructive">{errors[field]}</p> : null;
  }

  return (
    <form data-reading-safe="" aria-label="Toptan teklif isteyin" aria-describedby={`${id}-availability`}
      aria-busy={pending} onSubmit={handleSubmit} noValidate method="post"
      className={styles.form}>
      <span id={`${id}-name-hint`} className="sr-only">Zorunlu, 2–120 karakter.</span>
      <span id={`${id}-email-hint`} className="sr-only">E-posta veya telefondan en az birini girin. E-posta en fazla 254 karakter.</span>
      <span id={`${id}-phone-hint`} className="sr-only">E-posta veya telefondan en az birini girin. Telefon 7–15 rakam, en fazla 30 karakter.</span>
      <span id={`${id}-message-hint`} className="sr-only">Zorunlu, 10–2000 karakter. En az 10 karakter.</span>
      {/* SSR/JavaScript-free fields cannot trigger a native submit or leak values. */}
      <fieldset disabled={!hydrated || pending} className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>İsim / firma<span aria-hidden="true"> *</span></label>
          <Input {...fieldProps("name")} inputMode="text" autoComplete="organization" placeholder="İsim veya firma adı" required minLength={2} />
          {error("name")}
        </div>
        <div className={styles.channels}>
          <div className={styles.field}>
            <label htmlFor={`${id}-email`}>E-posta</label>
            <Input {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="E-posta veya telefon" />
            {error("email")}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-phone`}>Telefon</label>
            <Input {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="Ülke koduyla, 7–15 rakam" />
            {error("phone")}
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-message`}>Talep mesajı<span aria-hidden="true"> *</span></label>
          <Textarea ref={messageRef} {...fieldProps("message")} rows={3} required minLength={10} placeholder="Miktar ve teslimat bilgisi. En az 10 karakter." />
          {error("message")}
        </div>
        <div className={styles.consentGroup}>
          <label className={styles.consent}>
            <input type="checkbox" name="kvkk" checked={acknowledged} required
              aria-invalid={acknowledgementError || undefined}
              aria-describedby={`${id}-kvkk-hint${acknowledgementError ? ` ${id}-kvkk-error` : ""}`}
              onChange={event => { setAcknowledged(event.target.checked); setAcknowledgementError(false); setStatus("idle"); }} />
            <span>KVKK aydınlatma metnini okudum.</span>
          </label>
          {acknowledgementError && <p id={`${id}-kvkk-error`} className="text-base text-destructive">Devam etmek için KVKK aydınlatma metnini okuduğunuzu belirtin.</p>}
          <a href="/kvkk" className={styles.legal}>KVKK aydınlatma metni</a>
          <span id={`${id}-kvkk-hint`} className="sr-only">KVKK metni taslaktır; onay bekleniyor.</span>
        </div>
      </fieldset>
      <div data-wholesale-actions="" className={`${styles.actions} sticky bottom-0`}>
        <Button type="submit" disabled={!hydrated || pending || !submitRequest} aria-describedby={`${id}-availability`}>
          {pending ? "Gönderiliyor…" : "Talebi gönder"}
        </Button>
        <p id={`${id}-availability`} ref={statusRef} role="status" tabIndex={-1}>
          {!submitRequest ? unavailable : pending ? "Talebiniz gönderiliyor…" : status === "success" ? "Talebiniz gönderildi." : ""}
        </p>
        <p ref={alertRef} role="alert" tabIndex={-1} className="text-destructive">
          {status === "error" ? "Talebiniz gönderilemedi. Bilgilerinizi kontrol edip tekrar deneyin."
            : acknowledgementError || Object.values(errors).some(Boolean) ? "Lütfen işaretli alanları kontrol edin." : ""}
        </p>
      </div>
    </form>
  );
}
