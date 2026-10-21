"use client";

import { useId, useState, type JSX } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { V3Picture } from "@/components/media/V3Picture";
import type { V3Image } from "@/lib/media/v3-assets";
import type { ProductFamily } from "@/types/catalog";
import styles from "./V3Foundation.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

/** Basic selection only. Task 113 owns shelf choreography and quick view. */
export function PantryFamily({ family, images }: { family: ProductFamily; images: readonly V3Image[] }): JSX.Element {
  const id = useId();
  const cart = useCart();
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [feedback, setFeedback] = useState({ error: false, message: "" });
  const product = family.variants[selected];
  const count = Number(quantity);
  const valid = Number.isInteger(count) && count > 0 && count <= product.stock;
  function add(opener: HTMLElement): void {
    try {
      if (!valid || !cart) throw new Error("invalid quantity");
      cart.addItem(product.id, count, opener);
      setFeedback({ error: false, message: `${product.name}, ${product.weight} sepetinize eklendi.` });
    } catch {
      setFeedback({ error: true, message: "Ürün sepete eklenemedi. Adet ve stok durumunu kontrol edip tekrar deneyin." });
    }
  }
  return <article aria-labelledby={`${id}-name`} className={styles.family}>
    <V3Picture image={images[selected]} sizes="(max-width: 767px) 40vw, 22vw" className={styles.productImage} />
    <div className={styles.label}>
      <h3 id={`${id}-name`}>{family.name}</h3>
      <label htmlFor={`${id}-size`}>Boy</label>
      <select id={`${id}-size`} value={selected} onChange={event => { setSelected(Number(event.target.value)); setQuantity("1"); setFeedback({ error: false, message: "" }); }}>
        {family.variants.map((variant, index) => <option key={variant.id} value={index}>{variant.weight}</option>)}
      </select>
      <p className={styles.price}>{money.format(product.priceKurus / 100)}</p>
      {product.stock === 0 ? <p>Stokta yok</p> : <>
        <label htmlFor={`${id}-quantity`}>Adet</label>
        <input id={`${id}-quantity`} type="number" inputMode="numeric" min={1} max={product.stock} step={1} value={quantity} onChange={event => setQuantity(event.target.value)} />
      </>}
      <button type="button" disabled={!cart?.state.hydrated || cart.products === null || !valid} onClick={event => add(event.currentTarget)}>Sepete ekle</button>
      <p role={feedback.error ? "alert" : "status"} aria-atomic="true" className={styles.feedback}>{feedback.message}</p>
    </div>
  </article>;
}
