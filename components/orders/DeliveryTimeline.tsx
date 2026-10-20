"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TrackingOrder } from "@/lib/orders/tracking-adapter";
import { motionTokens } from "@/lib/ui-motion";
import styles from "./Tracking.module.css";

const dateTime = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
export function TrackingTime({ at }: { at: string }) {
  return <time dateTime={at}>{dateTime.format(new Date(at))}</time>;
}

// 21st ibrandify/delivery-progress (37491) + javierdev0/order-tracking (641).
// Semantic steps, current state and progress, adapted to AFİNA's flat surface.
export function DeliveryTimeline({ order }: { order: TrackingOrder }) {
  const reduce = useReducedMotion();
  const stopped = order.status === "cancelled" || order.status === "refunded";
  const completed = order.events.filter(event => event.at).length;
  const terminal = order.status === "cancelled" ? "İptal edildi" : "İade edildi";
  return <section aria-labelledby="delivery-title" className={styles.timeline}>
    <h2 id="delivery-title">Teslimat yolculuğu</h2>
    <div className={styles.progress} role="progressbar" aria-label="Teslimat ilerlemesi" aria-valuemin={0} aria-valuemax={6} aria-valuenow={completed} aria-valuetext={stopped ? terminal : order.events[Math.max(0, completed - 1)].label}>
      <motion.span data-testid="tracking-progress-fill" key={order.no} initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: completed / 6 }} transition={{ duration: reduce ? 0 : motionTokens.duration.fast }} />
    </div>
    <ol className={styles.steps}>{order.events.map((event, i) => <li key={event.label} data-complete={!!event.at} data-connected={!!order.events[i + 1]?.at} aria-current={!stopped && i === completed - 1 ? "step" : undefined}>
      <span className={styles.marker} aria-hidden="true" />
      <div><strong>{event.label}</strong><p>{event.at ? <TrackingTime at={event.at} /> : stopped ? "Gerçekleşmedi" : "Güncelleme bekleniyor"}</p></div>
      {!stopped && i === completed - 1 && <span className={styles.current}>Güncel durum</span>}
    </li>)}{stopped && <li aria-current="step" data-complete="true"><span className={styles.marker} aria-hidden="true" /><div><strong>{terminal}</strong><p>{order.terminalAt ? <TrackingTime at={order.terminalAt} /> : "Tarih bilgisi bekleniyor"}</p></div></li>}</ol>
  </section>;
}
