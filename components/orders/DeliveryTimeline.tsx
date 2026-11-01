"use client";

import { m } from "framer-motion";
import type { TrackingOrder } from "@/lib/orders/tracking-adapter";
import { deliveryOrderTimeline } from "@/lib/orders/timeline";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { TrackingTimeline, TimelineTime } from "@/components/ui/order-history";
import { motionTokens } from "@/lib/ui-motion";
import styles from "./Tracking.module.css";

export const TrackingTime = TimelineTime;

export function DeliveryTimeline({ order }: { order: TrackingOrder }) {
  const reduced = usePrefersReducedMotion();
  const items = deliveryOrderTimeline(order);
  const completed = items.filter(item => item.status === "completed" || item.status === "in-progress").length;
  const current = items.find(item => item.current)?.title ?? "Güncelleme bekleniyor";
  const total = Math.max(1, order.events.length);
  return <section aria-labelledby="delivery-title" className={styles.timeline}>
    <h2 id="delivery-title">Teslimat yolculuğu</h2>
    <div className={styles.progress} role="progressbar" aria-label="Teslimat ilerlemesi" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} aria-valuetext={current}>
      <m.span data-testid="tracking-progress-fill" initial={false} animate={{ scaleX: completed / total }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }} />
    </div>
    <TrackingTimeline items={items} />
  </section>;
}
