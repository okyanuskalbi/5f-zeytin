"use client";

import { useId, useRef, useState, type JSX, type SubmitEvent } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/catalog";
import styles from "./FeaturedProduct.module.css";

const price = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function FeaturedPurchase({ product }: { product: Product }): JSX.Element {
  const cart = useCart();
  const id = useId();
  const [quantity, setQuantity] = useState("1");
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const input = useRef<HTMLInputElement>(null);
  const amount = Number(quantity);
  const valid = quantity.trim() !== "" && Number.isSafeInteger(amount) && amount >= 1 && amount <= product.stock;
  const available = !!cart?.products && cart.state.hydrated;
  const soldOut = product.stock <= 0;

  function change(value: string): void {
    setQuantity(value);
    setFeedback({ error: false, message: "" });
  }

  function add(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!available || soldOut) return;
    if (!valid) {
      setFeedback({ error: true, message: `Adet 1 ile ${product.stock} arasında tam sayı olmalı.` });
      input.current?.focus();
      return;
    }
    try {
      const opener = event.nativeEvent.submitter;
      cart!.addItem(product.id, amount, opener instanceof HTMLElement ? opener : undefined);
      setFeedback({ error: false, message: `${amount} adet ürün sepete eklendi.` });
    } catch {
      setFeedback({ error: true, message: "Ürün sepete eklenemedi. Stok sınırını kontrol edip tekrar deneyin." });
    }
  }

  return <form noValidate onSubmit={add} className={styles.form}>
    <p role="status" aria-label="Seçilen boy ve fiyat" className={styles.price}>
      {product.weight} · {price.format(product.priceKurus / 100)} ₺
    </p>
    <p id={`${id}-stock`} className={styles.note}>{soldOut ? "Tükendi" : `Stokta · ${product.stock} adet`}</p>
    <label htmlFor={`${id}-quantity`}>Adet</label>
    <div className={styles.quantity}>
      <Button variant="outline" size="icon" aria-label="Adedi azalt" disabled={soldOut || !valid || amount <= 1}
        onClick={() => change(String(amount - 1))}><Minus aria-hidden="true" /></Button>
      <input ref={input} id={`${id}-quantity`} type="number" inputMode="numeric" min={1} max={product.stock} step={1}
        value={quantity} disabled={soldOut} onChange={event => change(event.target.value)} aria-invalid={feedback.error && !valid}
        aria-describedby={`${id}-stock ${id}-feedback`} />
      <Button variant="outline" size="icon" aria-label="Adedi artır" disabled={soldOut || !valid || amount >= product.stock}
        onClick={() => change(String(amount + 1))}><Plus aria-hidden="true" /></Button>
    </div>
    <Button type="submit" className={styles.add} disabled={soldOut || !available}>
      <ShoppingBag aria-hidden="true" />{soldOut ? "Tükendi" : "Sepete ekle"}
    </Button>
    {!available && !soldOut && <p className={styles.note}>Sepete ekleme henüz kullanıma açık değil.</p>}
    <p id={`${id}-feedback`} role={feedback.error ? "alert" : "status"} className={styles.feedback}>{feedback.message}</p>
  </form>;
}
