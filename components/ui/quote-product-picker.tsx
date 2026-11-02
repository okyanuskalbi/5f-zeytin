"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, Minus, PackageOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { QUOTE_QUANTITY_MAX, validateQuoteQuantity } from "@/lib/site/quote-lines";
import type { ProductVariant } from "@/types/catalog";
import styles from "./quote-product-picker.module.css";

export interface QuoteProductPickerProps {
  products: readonly ProductVariant[];
  quantities: Readonly<Record<string, string>>;
  onChange: (next: Record<string, string>) => void;
  invalid?: boolean;
  errorId?: string;
  disabled?: boolean;
  id?: string;
}

/** 21st Quantity (20055 / youcefbnm) and Interactive Checkout (109 / kokonutd)
 * provide the bounded stepper and photo/selection/summary composition.
 * Retrieved sources: docs/referans/quote-picker-171-source.json.
 * Raw edits belong to the parent; these are package counts for a quote,
 * independent of commerce stock, prices, cart state or payment. */
export function QuoteProductPicker({ products, quantities, onChange, invalid = false, errorId, disabled = false, id }: QuoteProductPickerProps) {
  const instance = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = products.filter(product => Object.hasOwn(quantities, product.id));
  const hasInvalid = selected.some(product => validateQuoteQuantity(quantities[product.id]) === null);
  const total = selected.reduce((sum, product) => sum + (validateQuoteQuantity(quantities[product.id]) ?? 0), 0);
  const summary = selected.length
    ? `${selected.length} ürün · ${hasInvalid ? "Adetleri kontrol edin" : `${total.toLocaleString("tr-TR")} adet`}`
    : "Ürünleri seçin";

  function select(productId: string, checked: boolean) {
    if (disabled) return;
    const next = { ...quantities };
    if (checked) next[productId] = "1";
    else delete next[productId];
    onChange(next);
  }
  function update(productId: string, raw: string) {
    if (disabled || !Object.hasOwn(quantities, productId)) return;
    onChange({ ...quantities, [productId]: raw });
  }
  function step(productId: string, direction: -1 | 1) {
    const current = validateQuoteQuantity(quantities[productId]);
    if (current === null) return;
    const next = current + direction;
    if (next >= 1 && next <= QUOTE_QUANTITY_MAX) update(productId, String(next));
  }
  function selectAll() {
    if (disabled) return;
    const next = { ...quantities };
    for (const product of products) if (!Object.hasOwn(next, product.id)) next[product.id] = "1";
    onChange(next);
  }

  return <Dialog open={open} onOpenChange={next => { if (!disabled || !next) setOpen(next); }}>
    <DialogTrigger asChild>
      <Button ref={trigger} id={id} type="button" name="productId" variant="outline" disabled={disabled}
        aria-label="İlgilendiğiniz ürünler" aria-description={summary}
        aria-invalid={invalid || hasInvalid || undefined} aria-describedby={errorId} className={styles.trigger}>
        {selected.length ? <span className={styles.thumbnails} aria-hidden="true">
          {selected.slice(0, 3).map(product => <V3Picture key={product.id} image={v3Image(product.imageKey)} sizes="32px" decorative />)}
        </span> : <PackageOpen size={18} aria-hidden="true" />}
        <span className={styles.triggerText}>{summary}</span><ChevronDown size={18} aria-hidden="true" />
      </Button>
    </DialogTrigger>
    <DialogContent className={styles.panel} showCloseButton={false}
      onCloseAutoFocus={event => { if (trigger.current && !trigger.current.disabled) { event.preventDefault(); trigger.current.focus(); } }}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <DialogTitle className={styles.title}>Ürünleri seçin</DialogTitle>
          <DialogClose asChild><Button variant="ghost" size="icon" className={styles.close} aria-label="Kapat"><X size={20} aria-hidden="true" /></Button></DialogClose>
        </div>
        <DialogDescription className={styles.description}>Teklifinize eklemek istediğiniz ambalajları ve adetlerini belirleyin.</DialogDescription>
        <div className={styles.bulk}>
          <Button variant="ghost" size="sm" disabled={disabled || products.length === 0 || selected.length === products.length} onClick={selectAll}>Tümünü seç</Button>
          <Button variant="ghost" size="sm" disabled={disabled || Object.keys(quantities).length === 0} onClick={() => { if (!disabled) onChange({}); }}>Seçimi temizle</Button>
        </div>
      </div>
      <div className={styles.body}>
        {products.length ? <ul className={styles.products} aria-label="Teklif için ambalajlar">
          {products.map((product, index) => {
            const chosen = Object.hasOwn(quantities, product.id);
            const raw = chosen ? quantities[product.id] : "";
            const count = chosen ? validateQuoteQuantity(raw) : null;
            const bad = chosen && count === null;
            const productLabel = `${product.name} · ${product.weight}`;
            const checkboxId = `${instance}-product-${index}`;
            const quantityError = `${instance}-quantity-${index}-error`;
            return <li key={product.id} className={styles.product} data-selected={chosen}>
              <div className={styles.productHeading}>
                <V3Picture image={v3Image(product.imageKey)} sizes="72px" decorative className={styles.photo} />
                <label htmlFor={checkboxId} className={styles.productLabel}><strong>{product.name}</strong><span>{product.weight}</span></label>
                <input id={checkboxId} type="checkbox" aria-label={`Ürün · ${productLabel}`} checked={chosen} disabled={disabled}
                  className={styles.checkbox} onChange={event => select(product.id, event.currentTarget.checked)} />
              </div>
              <div className={styles.quantityRow}>
                <span>Adet</span>
                <div className={styles.stepper}>
                  <Button variant="ghost" size="icon" aria-label={`Adedi azalt · ${productLabel}`}
                    disabled={disabled || !chosen || count === null || count <= 1} onClick={() => step(product.id, -1)}><Minus aria-hidden="true" /></Button>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={5} value={raw}
                    aria-label={`Adet · ${productLabel}`} aria-invalid={bad || undefined} aria-describedby={bad ? quantityError : undefined}
                    disabled={disabled || !chosen} placeholder="—" autoComplete="off"
                    onChange={event => update(product.id, event.currentTarget.value)} />
                  <Button variant="ghost" size="icon" aria-label={`Adedi artır · ${productLabel}`}
                    disabled={disabled || !chosen || count === null || count >= QUOTE_QUANTITY_MAX} onClick={() => step(product.id, 1)}><Plus aria-hidden="true" /></Button>
                </div>
              </div>
              {bad && <p id={quantityError} className={styles.error}>1–{QUOTE_QUANTITY_MAX.toLocaleString("tr-TR")} arasında tam bir adet girin.</p>}
            </li>;
          })}
        </ul> : <p className={styles.empty} role="status">Şu anda seçilebilecek ürün bulunmuyor.</p>}
      </div>
      <div className={styles.footer}>
        <div><p aria-label="Seçim özeti" aria-live="polite" aria-atomic="true" className={styles.summary}>{selected.length ? summary : "Henüz ürün seçilmedi"}</p><p className={styles.note}>Adet, seçilen ambalaj sayısıdır.</p></div>
        <DialogClose asChild><Button className={styles.done} disabled={disabled || hasInvalid}>Tamam</Button></DialogClose>
      </div>
    </DialogContent>
  </Dialog>;
}
