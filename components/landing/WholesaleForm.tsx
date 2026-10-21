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
  const pending = status === "pending";

  useEffect(() => {
    if (status === "success") statusRef.current?.focus({ preventScroll: true });
    if (status === "error") alertRef.current?.focus({ preventScroll: true });
  }, [status]);

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
    <form data-reading-safe="" aria-labelledby={`${id}-title`} aria-describedby={`${id}-scope ${id}-availability`}
      aria-busy={pending} onSubmit={handleSubmit} noValidate method="post"
      className={`${styles.form} space-y-6`}>
      <h3 id={`${id}-title`}>Toptan talep formu</h3>
      <p id={`${id}-scope`}>Sofralık zeytin • Salamura zeytin • Zeytinyağı</p>
      <p id={`${id}-availability`} className="text-muted-foreground">
        {submitRequest ? "İsim / firma ve talep mesajı zorunludur. Size ulaşabilmemiz için e-posta veya telefon bilgilerinden en az birini girin." : unavailable}
      </p>
      {/* SSR/JavaScript-free fields cannot trigger a native submit or leak values. */}
      <fieldset disabled={!hydrated || pending} className="min-w-0 space-y-6">
        <div className="space-y-2">
          <label htmlFor={`${id}-name`} className="font-semibold">İsim / firma</label>
          <Input {...fieldProps("name")} autoComplete="organization" required minLength={2} />
          <p id={`${id}-name-hint`} className="text-sm text-muted-foreground">Zorunlu · 2–120 karakter</p>
          {error("name")}
        </div>
        <div className="grid min-w-0 gap-6 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <label htmlFor={`${id}-email`} className="font-semibold">E-posta</label>
            <Input {...fieldProps("email")} type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} />
            <p id={`${id}-email-hint`} className="text-sm text-muted-foreground">E-posta veya telefon bilgilerinden biri yeterlidir.</p>
            {error("email")}
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor={`${id}-phone`} className="font-semibold">Telefon</label>
            <Input {...fieldProps("phone")} type="tel" autoComplete="tel" />
            <p id={`${id}-phone-hint`} className="text-sm text-muted-foreground">7–15 rakam; ülke kodu ekleyebilirsiniz.</p>
            {error("phone")}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-message`} className="font-semibold">Talep mesajı</label>
          <Textarea {...fieldProps("message")} rows={5} required minLength={10} />
          <p id={`${id}-message-hint`} className="text-sm text-muted-foreground">Zorunlu · 10–2000 karakter</p>
          {error("message")}
        </div>
        <div className="space-y-2">
          <label className={styles.consent}>
            <input type="checkbox" name="kvkk" checked={acknowledged} required
              aria-invalid={acknowledgementError || undefined}
              aria-describedby={`${id}-kvkk-hint${acknowledgementError ? ` ${id}-kvkk-error` : ""}`}
              onChange={event => { setAcknowledged(event.target.checked); setAcknowledgementError(false); setStatus("idle"); }} />
            <span>KVKK aydınlatma metnini okudum.</span>
          </label>
          {acknowledgementError && <p id={`${id}-kvkk-error`} className="text-base text-destructive">Devam etmek için KVKK aydınlatma metnini okuduğunuzu belirtin.</p>}
        </div>
      </fieldset>
      <p>
        <a href="/kvkk" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:decoration-2">KVKK aydınlatma metni</a>
        <span id={`${id}-kvkk-hint`} className="block text-sm text-muted-foreground">KVKK metni taslaktır; onay bekleniyor.</span>
      </p>
      <Button type="submit" disabled={!hydrated || pending || !submitRequest} aria-describedby={`${id}-availability`}>
        {pending ? "Gönderiliyor…" : "Talebi gönder"}
      </Button>
      <p ref={statusRef} role="status" tabIndex={-1} className="empty:mt-0">
        {!submitRequest ? unavailable : pending ? "Talebiniz gönderiliyor…" : status === "success" ? "Talebiniz gönderildi." : ""}
      </p>
      <p ref={alertRef} role="alert" tabIndex={-1} className="text-destructive empty:mt-0">
        {status === "error" ? "Talebiniz gönderilemedi. Bilgilerinizi kontrol edip tekrar deneyin."
          : acknowledgementError || Object.values(errors).some(Boolean) ? "Lütfen işaretli alanları kontrol edin." : ""}
      </p>
    </form>
  );
}
