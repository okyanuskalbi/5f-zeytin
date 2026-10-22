"use client";

import { useId, type JSX } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductThumbnail } from "./ProductThumbnail";
import styles from "./CartExperience.module.css";
import type { CartItem } from "@/lib/cart/types";
import type { Product } from "@/types/catalog";

/** Supply only approved relationships and active IDs from the catalog owner.
 * No category-based guesses or default campaign values belong in the UI. */
export type UpsellConfiguration = Readonly<{
  activeProductIds: readonly string[];
  relations: readonly Readonly<{ sourceProductId: string; targetProductId: string }>[];
}>;

/** Display conditions only; Task 054/055 owns eligibility and actual pricing. */
export type QuantityDiscountConfiguration = Readonly<{
  productIds: readonly string[];
  tiers: readonly Readonly<{ minimumQuantity: number; percentOff: number }>[];
}>;

type UpsellProps = {
  products: readonly Product[];
  items: readonly CartItem[];
  configuration?: UpsellConfiguration | null;
  onAdd: (productId: string) => void;
};

const money = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Adapted from 21st shadcnstore/Product Listing Card (28227): named list,
// product details, price and add action. No unapproved imagery or deal badges.
export function Upsell({ products, items, configuration, onAdd }: UpsellProps): JSX.Element | null {
  const id = useId();
  if (!configuration || items.length === 0) return null;
  const active = new Set(configuration.activeProductIds);
  const inCart = new Set(items.map(({ productId }) => productId));
  const targets = new Set(configuration.relations
    .filter(({ sourceProductId }) => inCart.has(sourceProductId) && active.has(sourceProductId))
    .map(({ targetProductId }) => targetProductId));
  const suggestions = products.filter(({ id, stock }) => targets.has(id) && active.has(id)
    && !inCart.has(id) && Number.isSafeInteger(stock) && stock > 0);
  if (suggestions.length === 0) return null;

  return <section aria-labelledby={`${id}-heading`} className={styles.upsell}>
    <div className="space-y-2">
      <h2 id={`${id}-heading`}>Sofranıza ekleyin</h2>
    </div>
    <ul className={styles.suggestions}>
      {suggestions.slice(0, 2).map((product) => <li key={product.id} className={styles.suggestion}>
        <ProductThumbnail product={product} />
        <div className={styles.suggestionDetails}>
          <h3>{product.name}</h3>
          <p>{product.weight}</p>
          <p className={styles.amount}>{money.format(product.priceKurus / 100)} ₺ / adet (tahmini)</p>
        </div>
        <Button variant="outline" className={styles.suggestionAdd} aria-label={`${product.name} sepete ekle`} onClick={() => onAdd(product.id)}>
          <Plus aria-hidden="true" />Ekle
        </Button>
      </li>)}
    </ul>
  </section>;
}

type QuantityDiscountProps = {
  products: readonly Product[];
  items: readonly CartItem[];
  configuration?: QuantityDiscountConfiguration | null;
};

export function QuantityDiscount({ products, items, configuration }: QuantityDiscountProps): JSX.Element | null {
  const id = useId();
  if (!configuration || configuration.tiers.length === 0) return null;
  const { tiers, productIds } = configuration;
  // Fail closed on incomplete/invalid conditions instead of inventing a fallback.
  if (tiers.some(({ minimumQuantity, percentOff }) => !Number.isSafeInteger(minimumQuantity) || minimumQuantity < 2
    || !Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100)
    || new Set(tiers.map(({ minimumQuantity }) => minimumQuantity)).size !== tiers.length) return null;
  const applicable = products.filter(({ id }) => productIds.includes(id));
  if (applicable.length === 0 || !items.some(({ productId }) => applicable.some(({ id }) => id === productId))) return null;

  return <section aria-labelledby={`${id}-heading`} className="space-y-3 pt-5 text-base">
    <h3 id={`${id}-heading`} className="text-lg">Miktar indirimi koşulları</h3>
    <p className="break-words text-muted-foreground">Bu ürünlerin toplam adedi için: {applicable.map(({ name }) => name).join(", ")}.</p>
    <ul className="space-y-2">
      {[...tiers].sort((a, b) => a.minimumQuantity - b.minimumQuantity).map(({ minimumQuantity, percentOff }) =>
        <li key={minimumQuantity}>{minimumQuantity} adet ve üzeri için %{new Intl.NumberFormat("tr-TR").format(percentOff)} miktar indirimi</li>)}
    </ul>
    <p className="text-muted-foreground">Koşullar bilgi amaçlıdır. Uygulanacak indirim ve kesin tutar ödeme öncesinde sunucuda doğrulanır.</p>
  </section>;
}
