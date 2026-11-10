"use client";

import type { ReactNode } from "react";
import { Check, Circle, CircleDot, CircleX } from "lucide-react";
import { cn } from "cn";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { recordedDate, type OrderTimelineItem } from "@/lib/orders/timeline";
import styles from "./order-history.module.css";

// Task165: user's TrackingTimeline / order-history.tsx, adapted to real AFİNA
// statuses. SSR content is visible, dates are optional and terminal is distinct.
export interface TimelineItem extends OrderTimelineItem {
  icon?: ReactNode;
}

const dateTime = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul",
});

export function TimelineTime({ at }: { at: string }) {
  return recordedDate(at) ? <time dateTime={at}>{dateTime.format(new Date(at))}</time> : <>Tarih bilgisi paylaşılmadı.</>;
}

function StatusIcon({ item }: { item: TimelineItem }) {
  if (item.icon) return <>{item.icon}</>;
  const Icon = item.status === "completed" ? Check
    : item.status === "in-progress" ? CircleDot : item.status === "stopped" ? CircleX : Circle;
  return <Icon size={16} strokeWidth={1.8} />;
}

export function TrackingTimeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const explicitCurrent = items.some(item => item.current);
  const currentIndex = items.findIndex(item => explicitCurrent ? item.current : item.status === "in-progress");
  return (
    <ol className={cn(styles.timeline, className)} aria-label="Sipariş aşamaları" data-order-history data-motion={reduced ? "reduced" : "standard"}>
      {items.map((item, index) => {
        const current = index === currentIndex;
        const date = recordedDate(item.date);
        return (
          <li key={item.id} className={styles.step} data-status={item.status} aria-current={current ? "step" : undefined}>
            <span className={styles.marker} aria-hidden="true">
              <StatusIcon item={item} />
            </span>
            <div className={styles.content}>
              <div className={styles.heading}>
                <h3>{item.title}</h3>
                {current && <span className={styles.current}>Güncel durum</span>}
              </div>
              <p>{date ? <TimelineTime at={date} /> : item.description ?? "Güncelleme bekleniyor."}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default TrackingTimeline;
