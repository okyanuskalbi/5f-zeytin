"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isSafeCarrierUrl, type TrackingOrder } from "@/lib/orders/tracking-adapter";
import styles from "./Tracking.module.css";

const money = (kurus: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(kurus / 100);

// 21st ravikatiyar162/order-status-tracker (8205): item and summary data
// remain separate; no stock images, illustrations or icon-card grid.
export function TrackingSummary({ order }: { order: TrackingOrder }) {
  const [copyMessage, setCopyMessage] = useState("");
  const shipping = order.shipping;
  async function copy() {
    try { await navigator.clipboard.writeText(shipping!.trackingNo); setCopyMessage("Takip numarası kopyalandı."); }
    catch { setCopyMessage("Kopyalanamadı. Takip numarasını seçip kopyalayabilirsiniz."); }
  }
  return <div className={styles.summary}>
    <section aria-labelledby="shipping-title" className={styles.shipping}>
      <h2 id="shipping-title">Kargo bilgileri</h2>
      {shipping ? <>
        <dl><div><dt>Kargo firması</dt><dd>{shipping.carrier}</dd></div><div><dt>Takip numarası</dt><dd className={styles.trackingNo}>{shipping.trackingNo}</dd></div></dl>
        <Button variant="outline" onClick={() => void copy()}>Takip numarasını kopyala</Button>
        <p role="status" aria-live="polite">{copyMessage}</p>
        {isSafeCarrierUrl(shipping.trackingUrl) ? <a className={styles.link} href={shipping.trackingUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Kargo firmasında takip et <span className="sr-only">(yeni sekmede açılır)</span></a> : <p>Kargo firmasında takip et bağlantısı, firma belirlendiğinde burada yer alacak.</p>}
        {shipping.estimatedDelivery && order.status !== "cancelled" && order.status !== "refunded" && <p>Tahmini teslim: <time dateTime={shipping.estimatedDelivery}>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(shipping.estimatedDelivery))}</time></p>}
      </> : <p>Kargo bilgileri henüz eklenmedi.</p>}
    </section>
    <section aria-labelledby="summary-title"><h2 id="summary-title">Sipariş özeti</h2>
      <ul className={styles.items}>{order.items.map(item => <li key={item.name}><strong>{item.name}</strong><span>{item.quantity} adet × {money(item.unitPriceKurus)}</span><span>{money(item.quantity * item.unitPriceKurus)}</span></li>)}</ul>
      <dl className={styles.totals}><div><dt>Toplam</dt><dd>{money(order.amountKurus)}</dd></div><div><dt>Teslimat adresi (maskeli)</dt><dd>{order.deliveryAddress}</dd></div></dl>
    </section>
  </div>;
}
