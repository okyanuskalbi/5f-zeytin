"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import type { CustomerPhoneField } from "@/components/ui/customer-phone-field";
import "@/components/ui/contact-fields.css";
import "@/components/ui/phone-country-search.css";

type PhoneComponent = typeof CustomerPhoneField;
// Public enquiry forms start empty in TR. Existing account/address editing keeps
// CustomerPhoneField directly, including its initial-country parsing contract.
type Props = Omit<ComponentProps<PhoneComponent>, "initial" | "initialParts" | "defaultCountry">;
const copy = {
  tr: { label: "Telefon", country: "Telefon ülke kodu", name: "Türkiye", hint: "10 hane", loading: "Telefon alanı yükleniyor…", error: "Telefon alanı yüklenemedi.", retry: "Yeniden dene" },
  en: { label: "Phone", country: "Phone country code", name: "Türkiye", hint: "10 digits", loading: "Loading phone field…", error: "Unable to load phone field.", retry: "Retry" },
  ru: { label: "Телефон", country: "Телефонный код страны", name: "Турция", hint: "10 цифр", loading: "Загрузка телефона…", error: "Не удалось загрузить телефон.", retry: "Повторить" },
};

/** Reserve the real field's geometry, then load its unchanged phone rules near use. */
export function DeferredPhoneField(props: Props) {
  const root = useRef<HTMLDivElement>(null);
  const request = useRef<Promise<void> | null>(null);
  const alive = useRef(true);
  const focusTarget = useRef<"phone" | "country" | null>(null);
  const [Field, setField] = useState<PhoneComponent | null>(null);
  const [failed, setFailed] = useState(false);
  const id = useId();
  const c = copy[props.lang];
  const load = useCallback(() => {
    if (request.current) return request.current;
    setFailed(false);
    request.current = import("@/components/ui/customer-phone-field").then(module => {
      if (alive.current) setField(() => module.CustomerPhoneField);
    }).catch(() => {
      request.current = null;
      if (alive.current) setFailed(true);
    });
    return request.current;
  }, []);
  useEffect(() => {
    alive.current = true;
    const node = root.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") { void load(); return () => { alive.current = false; }; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void load(); }
    }, { rootMargin: "100px 0px" });
    observer.observe(node);
    return () => { alive.current = false; observer.disconnect(); };
  }, [load]);
  useLayoutEffect(() => {
    if (!Field || !focusTarget.current) return;
    // A late download must not steal focus from the next form field.
    if (document.activeElement === document.body || root.current?.contains(document.activeElement)) {
      root.current?.querySelector<HTMLElement>(focusTarget.current === "phone" ? 'input[type="tel"]' : '.phone-country-trigger')?.focus({ preventScroll: true });
    }
    focusTarget.current = null;
  }, [Field]);
  return <div ref={root} data-deferred-phone={Field ? "ready" : failed ? "error" : "waiting"}
    onFocusCapture={event => { if (!Field) { focusTarget.current = event.target instanceof HTMLInputElement ? "phone" : "country"; void load(); } }}
    onBlurCapture={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) focusTarget.current = null; }}
    onPointerDownCapture={() => { if (!Field) void load(); }}>
    {Field ? <Field {...props} /> : <div className="customer-phone-field">
      <span className="customer-phone-label" id={`${id}-label`}>{c.label}</span>
      <div className="customer-phone-inputs">
        <div className="phone-country-search"><button type="button" className="phone-country-trigger" aria-label={failed ? c.retry : `TR +90 ${c.name} · ${c.country}`} aria-disabled={!failed || undefined}
          onClick={() => { focusTarget.current = "country"; void load(); }}>
          <span data-phone-country-full="" aria-hidden="true">{failed ? c.retry : `+90 ${c.name}`}</span><span data-phone-country-compact="" aria-hidden="true">{failed ? c.retry : "TR +90"}</span><ChevronDown size={16} aria-hidden="true" />
        </button></div>
        <input name={props.name} required={props.required ?? true} type="tel" inputMode="tel" readOnly value="" aria-busy={!failed} aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint ${id}-status${props.errorId ? ` ${props.errorId}` : ""}`} aria-invalid={props.invalid || undefined} placeholder={failed ? c.error : c.loading} autoComplete="off" dir="ltr" />
      </div>
      <small id={`${id}-hint`}>{c.hint}</small>
      <span id={`${id}-status`} className="sr-only" role={failed ? "alert" : "status"}>{failed ? `${c.error} ${c.retry}` : c.loading}</span>
    </div>}
  </div>;
}
