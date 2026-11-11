"use client";

import type { ComponentProps } from "react";
import { ChevronDown, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { validateQuoteQuantity } from "@/lib/site/quote-lines";
import type { QuoteProductPickerProps } from "@/components/ui/quote-product-picker";
import styles from "@/components/ui/quote-product-picker.module.css";

type SelectionProps = Pick<QuoteProductPickerProps, "products" | "quantities">;

export function quoteSelectionSummary({ products, quantities }: SelectionProps) {
  const selected = products.filter(product => Object.hasOwn(quantities, product.id));
  const hasInvalid = selected.some(product => validateQuoteQuantity(quantities[product.id]) === null);
  const total = selected.reduce((sum, product) => sum + (validateQuoteQuantity(quantities[product.id]) ?? 0), 0);
  const summary = selected.length
    ? `${selected.length} ürün, ${hasInvalid ? "Adetleri kontrol edin" : `${total.toLocaleString("tr-TR")} adet`}`
    : "Ürünleri seçin";
  return { selected, hasInvalid, summary };
}

/** The closed trigger has no Dialog dependency; Radix supplies its props after loading. */
export function QuoteProductTrigger({ products, quantities, invalid, errorId, ...props }:
  SelectionProps & Pick<QuoteProductPickerProps, "invalid" | "errorId"> & ComponentProps<typeof Button>) {
  const { selected, hasInvalid, summary } = quoteSelectionSummary({ products, quantities });
  return <Button type="button" name="productId" variant="outline"
    aria-label="İlgilendiğiniz ürünler" aria-description={summary}
    aria-invalid={invalid || hasInvalid || undefined} aria-describedby={errorId} className={styles.trigger} {...props}>
    {selected.length ? <span className={styles.thumbnails} aria-hidden="true">
      {selected.slice(0, 3).map(product => <V3Picture key={product.id} image={v3Image(product.imageKey)} sizes="32px" decorative />)}
    </span> : <PackageOpen size={18} aria-hidden="true" />}
    <span className={styles.triggerText}>{summary}</span><ChevronDown size={18} aria-hidden="true" />
  </Button>;
}
