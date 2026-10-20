"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CheckoutSummary as Summary } from "@/lib/checkout/adapter";
import styles from "./Checkout.module.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

// 21st Checkout Form (7053): distinct coupon and amount groups, adapted to a
// flat AFİNA surface, semantic amount rows and an explicitly unknown final total.
export function CheckoutSummary({ summary }: { summary: Summary }) {
  return <aside className={styles.summary} aria-label="Sipariş özeti">
    <h2>Sipariş özeti</h2>
    <ul aria-label="Sipariş ürünleri">
      {summary.lines.map(line => <li key={line.id}>
        <p>{line.name}</p>
        <p className={styles.muted}>{line.weight} · {line.quantity} adet</p>
        <p className="tabular-nums">{money.format(line.amountKurus / 100)}</p>
      </li>)}
    </ul>
    <dl>
      <div><dt>Ara toplam (tahmini)</dt><dd>{summary.subtotalKurus === null ? "Hesaplanamadı" : money.format(summary.subtotalKurus / 100)}</dd></div>
      <div><dt>Kargo</dt><dd>Ücret ödeme adımında</dd></div>
      <div><dt>İndirim</dt><dd>Henüz hesaplanmadı</dd></div>
    </dl>
    <p>Kesin toplam henüz hesaplanmadı.</p>
    <p className={styles.muted}>Ürünler ve tutarlar temsilidir. Kargo ve indirimler ara toplama dahil değildir; bu demo sipariş oluşturmaz.</p>
    <div className={styles.coupon}>
      <label htmlFor="checkout-coupon">Kupon kodu</label>
      <Input id="checkout-coupon" disabled aria-describedby="checkout-coupon-hint" />
      <p id="checkout-coupon-hint" className={styles.muted}>Kupon kullanımı yakında.</p>
      <Button variant="outline" disabled aria-describedby="checkout-coupon-hint">Kuponu uygula</Button>
    </div>
    <Link className={styles.link} href="/sepet">Sepeti düzenle</Link>
  </aside>;
}
