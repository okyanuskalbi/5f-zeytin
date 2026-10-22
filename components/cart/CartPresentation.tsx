"use client";

import { forwardRef, useId, type JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { LockKeyhole, Minus, Plus, Trash2, Truck } from "lucide-react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { ProductThumbnail } from "./ProductThumbnail";
import { motionTokens, springs } from "@/lib/ui-motion";
import type { Product } from "@/types/catalog";
import styles from "./CartExperience.module.css";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function formatCartPrice(kurus: number): string { return `${money.format(kurus / 100)} ₺`; }

/** A single current value keeps live regions and screen readers free of outgoing digits. */
export function CartAmount({ amount, label }: { amount: number | null; label: string }): JSX.Element {
  const reduced = useReducedMotion();
  const value = amount === null ? "—" : formatCartPrice(amount);
  return <output aria-label={label} aria-live="off" className={styles.amount}>
    <motion.span key={value} initial={reduced ? false : { opacity: 0.6 }} animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>{value}</motion.span>
  </output>;
}

type CartLineItemProps = {
  product?: Product;
  quantity: number;
  unavailable: boolean;
  disabled: boolean;
  stockMessage?: string;
  headingLevel?: 2 | 3;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
};

// The direct presence child forwards its ref for popLayout; exiting rows are inert.
export const CartLineItem = forwardRef<HTMLLIElement, CartLineItemProps>(function CartLineItem({
  product, quantity, unavailable, disabled, stockMessage = "Bu ürün artık kullanılamıyor.", headingLevel = 3, onQuantity, onRemove,
}, ref) {
  const id = useId();
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <motion.li ref={ref} className={styles.line} aria-hidden={!present} inert={!present}
    layout={reduced ? false : true} initial={reduced ? false : { opacity: 0, x: motionTokens.distance.shelf }}
    animate={{ opacity: 1, x: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, x: motionTokens.distance.shelf }}
    transition={reduced ? { duration: 0 } : springs.drawer}>
    <div role="group" aria-labelledby={id} className={styles.lineGrid}>
      {product && <ProductThumbnail product={product} />}
      <div className={styles.lineDetails}>
        <Heading id={id} className={styles.productName}>{product?.name ?? "Kullanılamayan ürün"}</Heading>
        {product && <><span className={styles.sizeChip}>{product.weight}</span>
          <p className={styles.unitPrice}>{formatCartPrice(product.priceKurus)} / adet</p></>}
        {unavailable && <p className={styles.error}>{stockMessage}</p>}
        <div className={styles.lineActions}>
          <div className={styles.quantity}>
            <Button variant="ghost" size="icon" aria-label="Adedi azalt" disabled={disabled || quantity <= 1} onClick={() => onQuantity(quantity - 1)}><Minus aria-hidden="true" /></Button>
            <output aria-label="Adet">{quantity}</output>
            <Button variant="ghost" size="icon" aria-label="Adedi artır" disabled={disabled || quantity >= (product?.stock ?? 0)} onClick={() => onQuantity(quantity + 1)}><Plus aria-hidden="true" /></Button>
          </div>
          <Button variant="ghost" size="icon" className={styles.remove} aria-label="Sepetten sil" title="Kaldır" onClick={onRemove}><Trash2 aria-hidden="true" /></Button>
        </div>
        <div className={styles.lineTotal}><span>Satır toplamı</span><CartAmount amount={product && !unavailable ? product.priceKurus * quantity : null} label="Satır toplamı" /></div>
      </div>
    </div>
  </motion.li>;
});

// 21st Checkout Summary, demo 36084: semantic amount rows and explicit pending charges.
export function CartTotals({ subtotal, itemCount }: { subtotal: number | null; itemCount: number }): JSX.Element {
  return <dl className={styles.totals}>
    <div><dt>Ara toplam (tahmini) · {itemCount} adet</dt><dd><CartAmount amount={subtotal} label="Ara toplam" /></dd></div>
    <div className={styles.shipping}><dt>Kargo</dt><dd>Ödeme adımında hesaplanır</dd></div>
    <div className={styles.total}><dt>Toplam <small>(tahmini)</small></dt><dd><CartAmount amount={subtotal} label="Toplam (tahmini)" /></dd></div>
  </dl>;
}

export function CartTrust(): JSX.Element {
  return <div className={styles.trust}>
    <div role="group" aria-label="Güvenli ödeme" className={styles.payment}>
      <p><LockKeyhole aria-hidden="true" />Güvenli Ödeme</p>
      <div className={styles.paymentLogos}>
        <PaymentLogos tone="dark" />
      </div>
    </div>
    <p className={styles.delivery}><Truck aria-hidden="true" />Kargo 2–4 iş günü</p>
  </div>;
}

export function CartEmpty({ onBrowse }: { onBrowse?: () => void }): JSX.Element {
  return <div className={styles.empty}>
    <Image src="/brand/favicon.svg" alt="" width={64} height={64} className={styles.emptyEmblem} />
    <h2>Sepetiniz boş</h2>
    <p>Sofranız için seçtikleriniz burada birikir.</p>
    <Button asChild className={styles.checkout}><Link href="/#urunler" prefetch={false} onClick={onBrowse}>Ürünlere göz atın</Link></Button>
  </div>;
}
