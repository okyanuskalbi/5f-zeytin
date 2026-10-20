"use client";

import { useId, useRef, useState, type JSX, type SubmitEvent } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCardMotion } from "@/components/catalog/ProductCardMotion";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";

type ProductCardProps = {
  product: Product | null;
  loading?: boolean;
  /** Optional standalone callback; the application uses its shared cart owner. */
  onAddToCart?: (productId: string, quantity: number) => void | Promise<void>;
};

const priceFormatter = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cardStyle = "flex min-w-0 flex-col gap-6 text-foreground";

// Adapted from 21st Product Listing Card (shadcnstore/product-card-1, demo 28227).
// Keep its image/detail/action hierarchy; use AFİNA tokens and semantic controls.
export function ProductCard({ product, loading = false, onAddToCart }: ProductCardProps): JSX.Element {
  if (loading) {
    return (
      <div role="status" aria-label="Ürün yükleniyor" aria-busy="true" className={cardStyle}>
        <p className="text-muted-foreground">Ürün yükleniyor…</p>
      </div>
    );
  }
  if (!product) return <p role="status" className="text-muted-foreground">Görüntülenecek ürün bulunmuyor.</p>;
  // Replacing a product resets its quantity, pending state and old feedback.
  return (
    <ProductCardMotion key={product.id}>
      <PurchaseCard product={product} onAddToCart={onAddToCart} />
    </ProductCardMotion>
  );
}

function PurchaseCard({ product, onAddToCart }: { product: Product; onAddToCart: ProductCardProps["onAddToCart"] }): JSX.Element {
  const cart = useCart();
  const canAdd = !!onAddToCart || !!(cart?.products && cart.state.hydrated);
  const id = useId();
  const [quantity, setQuantity] = useState("1");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const [invalidQuantity, setInvalidQuantity] = useState(false);
  const submitting = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const soldOut = product.stock <= 0;
  const amount = Number(quantity);
  const validQuantity = quantity.trim() !== "" && Number.isSafeInteger(amount) && amount >= 1 && amount <= product.stock;

  function changeQuantity(value: string): void {
    setQuantity(value);
    setInvalidQuantity(false);
    setFeedback({ error: false, message: "" });
  }

  async function addToCart(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (soldOut || !canAdd || submitting.current) return;
    if (!validQuantity) {
      setInvalidQuantity(true);
      setFeedback({ error: true, message: `Adet 1 ile ${product.stock} arasında tam sayı olmalı.` });
      input.current?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    setFeedback({ error: false, message: "" });
    try {
      if (onAddToCart) await onAddToCart(product.id, amount);
      else cart!.addItem(product.id, amount, event.nativeEvent.submitter instanceof HTMLElement ? event.nativeEvent.submitter : undefined);
      setFeedback({ error: false, message: `${amount} adet ürün sepete eklendi.` });
    } catch {
      setFeedback({ error: true, message: "Ürün sepete eklenemedi. Tekrar deneyin." });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <article aria-labelledby={`${id}-title`} aria-busy={pending} className={cardStyle}>
      {/* Without approved media, the product is complete in type alone. */}
      <div className="flex flex-1 flex-col gap-3">
        <h3 id={`${id}-title`} className="break-words">{product.name}</h3>
        <p className="text-sm text-foreground">{product.weight}</p>
        <p className="mt-auto text-base font-medium tabular-nums">{priceFormatter.format(product.priceKurus / 100)} ₺</p>
        <p id={`${id}-stock`} className="text-sm text-muted-foreground">
          {soldOut ? "Tükendi" : `Stokta · ${product.stock} adet`}
        </p>
      </div>
      <form noValidate onSubmit={addToCart} className="space-y-4">
        <label htmlFor={`${id}-quantity`} className="block text-sm font-medium">Adet</label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Adedi azalt"
            disabled={pending || soldOut || !validQuantity || amount <= 1}
            onClick={() => changeQuantity(String(amount - 1))}><Minus aria-hidden="true" /></Button>
          <input ref={input} id={`${id}-quantity`} type="number" inputMode="numeric" min={1} max={product.stock} step={1}
            value={quantity} disabled={pending || soldOut} onChange={(event) => changeQuantity(event.target.value)}
            aria-invalid={invalidQuantity} aria-describedby={`${id}-stock ${id}-feedback`}
            className="min-h-11 w-16 min-w-0 rounded-none border border-input bg-background px-2 text-center text-base tabular-nums focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted aria-invalid:border-destructive" />
          <Button variant="outline" size="icon" aria-label="Adedi artır"
            disabled={pending || soldOut || !validQuantity || amount >= product.stock}
            onClick={() => changeQuantity(String(amount + 1))}><Plus aria-hidden="true" /></Button>
        </div>
        <Button type="submit" className="w-full" disabled={pending || soldOut || !canAdd}
          aria-describedby={!canAdd && !soldOut ? `${id}-unavailable` : undefined}>
          <ShoppingBag aria-hidden="true" />{pending ? "Ekleniyor…" : "Sepete ekle"}
        </Button>
        {!canAdd && !soldOut && (
          <p id={`${id}-unavailable`} className="text-sm text-muted-foreground">Sepete ekleme henüz kullanıma açık değil.</p>
        )}
        <p id={`${id}-feedback`} role={feedback.error ? "alert" : "status"}
          className={`min-h-6 text-sm ${feedback.error ? "text-destructive" : "text-muted-foreground"}`}>
          {feedback.message}
        </p>
      </form>
    </article>
  );
}
