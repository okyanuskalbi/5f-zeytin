"use client";

import { forwardRef, useId, type JSX } from "react";
import Image from "next/image";
import { LockKeyhole, Trash2, Truck } from "lucide-react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { QuantityStepper } from "@/components/storefront/ui/QuantityStepper";
import { Tag } from "@/components/storefront/ui/Tag";
import { CheckoutValue } from "@/components/ui/interactive-checkout";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { ProductThumbnail } from "./ProductThumbnail";
import { motionTokens, springs } from "@/lib/ui-motion";
import type { Product } from "@/types/catalog";
import styles from "./CartExperience.module.css";

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function formatCartPrice(kurus: number): string { return `${money.format(kurus / 100)} ₺`; }

/** A single current value keeps live regions and screen readers free of outgoing digits. */
export function CartAmount({ amount, label }: { amount: number | null; label: string }): JSX.Element {
  const value = amount === null ? "Fiyat yakında" : formatCartPrice(amount);
  return <output aria-label={label} aria-live="off" data-pending={amount === null} className={styles.amount}>
    <CheckoutValue value={value} />
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
        {product && <><Tag>{product.weight}</Tag>
          <p className={styles.unitPrice}>{formatCartPrice(product.priceKurus)} / adet</p></>}
        {unavailable && <p className={styles.error}>{stockMessage}</p>}
        <div className={styles.lineActions}>
          <QuantityStepper quantity={quantity} canDecrease={!disabled && quantity > 1} canIncrease={!disabled && quantity < (product?.stock ?? 0)} onChange={onQuantity}>
            <CheckoutValue value={quantity} />
          </QuantityStepper>
          <button type="button" className={styles.remove} aria-label="Sepetten sil" title="Kaldır" onClick={onRemove}><Trash2 size={20} strokeWidth={1.7} aria-hidden="true" /></button>
        </div>
        <div className={styles.lineTotal}><span>Satır toplamı</span><CartAmount amount={product && !unavailable ? product.priceKurus * quantity : null} label="Satır toplamı" /></div>
      </div>
    </div>
  </motion.li>;
});

// 21st Checkout Summary, demo 36084: semantic amount rows and explicit pending charges.
export function CartTotals({ subtotal, itemCount }: { subtotal: number | null; itemCount: number }): JSX.Element {
  return <dl className={styles.totals}>
    <div><dt>Ara toplam (tahmini), {itemCount} adet</dt><dd><CartAmount amount={subtotal} label="Ara toplam" /></dd></div>
    <div className={styles.shipping}><dt>Kargo</dt><dd>Ödeme adımında hesaplanır</dd></div>
    <div className={styles.total}><dt>Toplam <small>(tahmini)</small></dt><dd data-cart-total=""><CartAmount amount={subtotal} label="Toplam (tahmini)" /></dd></div>
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
    <p className={styles.delivery}><Truck aria-hidden="true" />Teslimat koşulları teklif aşamasında belirlenir.</p>
  </div>;
}

export function CartEmpty({ onBrowse }: { onBrowse?: () => void }): JSX.Element {
  return <div className={styles.empty}>
    <Image src="/brand/favicon.svg" alt="" width={64} height={64} className={styles.emptyEmblem} />
    <h2>Sepetiniz boş</h2>
    <p>Sofranız için seçtikleriniz burada birikir.</p>
    <PillButton href="/urunler" onClick={onBrowse}>Ürünleri İnceleyin</PillButton>
  </div>;
}
