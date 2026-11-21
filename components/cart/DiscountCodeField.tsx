"use client";

import { useEffect, useId, useRef, useState, type JSX } from "react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { invalidCodeMessage } from "@/lib/contracts/discounts";
import type { CartItem } from "@/lib/cart/types";
import styles from "./CartExperience.module.css";

/** Sunucunun hesapladığı indirim. `key`, hesabın yapıldığı sepet içeriğidir; sepet değişirse tutar geçersiz sayılır ve yeniden doğrulanır. */
export type AppliedDiscount = Readonly<{ code: string; amountKurus: number; key: string }>;
type Status = Readonly<{ kind: "idle" | "ok" | "error"; text: string }>;
const unavailable = "İşlem tamamlanamadı. Lütfen yeniden deneyin.";

/** İndirim kodu isteği: yalnız kod ve (ürün kimliği, adet) gider; tutarı sunucu hesaplar. */
async function requestDiscount(code: string, items: readonly CartItem[], signal?: AbortSignal): Promise<{ amountKurus: number; code: string } | { error: string }> {
  try {
    const response = await fetch("/api/discount/validate", { method: "POST", headers: { "content-type": "application/json" }, signal: signal ?? AbortSignal.timeout(10000),
      body: JSON.stringify({ code, items: items.map(({ productId, quantity }) => ({ productId, quantity })) }) });
    const body = await response.json().catch(() => null);
    if (response.ok && Number.isSafeInteger(body?.data?.discountKurus) && typeof body.data.code === "string") return { amountKurus: body.data.discountKurus, code: body.data.code };
    if (response.status === 422) return { error: invalidCodeMessage };
    const message = body?.error?.message;
    return { error: (response.status === 429 || response.status === 409) && typeof message === "string" ? message : unavailable };
  } catch { return { error: unavailable }; }
}

export function DiscountCodeField({ items, itemsKey, applied, disabled, onChange }: {
  items: readonly CartItem[]; itemsKey: string; applied: AppliedDiscount | null; disabled: boolean; onChange: (discount: AppliedDiscount | null) => void;
}): JSX.Element {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Sepet değişince uygulanmış kodu sunucuda yeniden doğrula; geçersizse kaldır.
  useEffect(() => {
    if (!applied || applied.key === itemsKey) return;
    if (items.length === 0) { onChange(null); return; }
    const controller = new AbortController();
    void requestDiscount(applied.code, items, AbortSignal.any([controller.signal, AbortSignal.timeout(10000)])).then(result => {
      if (controller.signal.aborted) return;
      if ("error" in result) { onChange(null); setStatus({ kind: "error", text: "İndirim kodu bu sepet için geçerli değil. Kaldırıldı." }); return; }
      onChange({ code: result.code, amountKurus: result.amountKurus, key: itemsKey });
    });
    return () => controller.abort();
  }, [applied, itemsKey, items, onChange]);

  async function apply(): Promise<void> {
    const code = draft.trim();
    if (!code || busy || disabled) return;
    setBusy(true); setStatus({ kind: "idle", text: "" });
    const result = await requestDiscount(code, items);
    setBusy(false);
    if ("error" in result) { setStatus({ kind: "error", text: result.error }); return; }
    onChange({ code: result.code, amountKurus: result.amountKurus, key: itemsKey });
    setDraft(""); setStatus({ kind: "ok", text: "İndirim kodu uygulandı." });
  }
  function remove(): void {
    onChange(null); setStatus({ kind: "ok", text: "İndirim kodu kaldırıldı." });
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return <div className={styles.coupon} data-discount-field="">
    <label htmlFor={`${id}-code`}>İndirim kodu</label>
    {applied
      ? <>
        <p className={styles.couponApplied} id={`${id}-applied`}><strong>{applied.code}</strong> uygulandı</p>
        <PillButton variant="outline" icon="none" size="md" onClick={remove} aria-label={`${applied.code} indirim kodunu kaldır`}>Kaldır</PillButton>
      </>
      : <>
        <input ref={inputRef} id={`${id}-code`} type="text" value={draft} maxLength={32} autoCapitalize="characters" autoComplete="off" spellCheck={false}
          disabled={busy || disabled} aria-invalid={status.kind === "error"} aria-describedby={`${id}-status`}
          onChange={event => { setDraft(event.target.value); if (status.kind === "error") setStatus({ kind: "idle", text: "" }); }}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void apply(); } }} />
        <PillButton variant="outline" icon="none" size="md" busy={busy} disabled={busy || disabled || !draft.trim()} onClick={() => void apply()} aria-label="İndirim kodunu uygula">Uygula</PillButton>
      </>}
    <p id={`${id}-status`} role={status.kind === "error" ? "alert" : "status"} aria-atomic="true" className={status.kind === "error" ? styles.couponError : undefined}>{status.text}</p>
  </div>;
}
