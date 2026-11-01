import { customerOrderStatuses, type CustomerOrder } from "@/lib/contracts/customer";
import type { TrackingOrder } from "./tracking-adapter";

export type OrderTimelineItem = {
  id: string | number;
  title: string;
  /** An actual recorded timestamp only. Null never becomes today's date. */
  date: string | null;
  status: "completed" | "in-progress" | "pending" | "stopped";
  current?: boolean;
  description?: string;
};

export function recordedDate(value: string | null | undefined): string | null {
  return value && Number.isFinite(Date.parse(value)) ? value : null;
}

const customerStages = [
  ["received", "Sipariş alındı"],
  ["paid", "Ödeme onaylandı"],
  ["preparing", "Hazırlanıyor"],
  ["shipped", "Kargoya verildi"],
  ["delivered", "Teslim edildi"],
] as const;

/** The customer API has a creation date and current status, not a status log. */
export function customerOrderTimeline(order: CustomerOrder): OrderTimelineItem[] {
  const received: OrderTimelineItem = {
    id: "received", title: "Sipariş alındı", date: recordedDate(order.date), status: "completed",
  };
  if (order.status === "cancelled" || order.status === "refunded") {
    return [received, {
      id: order.status, title: customerOrderStatuses[order.status], date: null,
      status: "stopped", current: true, description: "İşlem tarihi paylaşılmadı.",
    }];
  }
  const current = order.status === "pending" ? 1 : customerStages.findIndex(([id]) => id === order.status);
  return customerStages.map(([id, title], index) => {
    const active = index === current;
    const waiting = order.status === "pending" && active;
    const ongoing = active && (waiting || order.status === "preparing" || order.status === "shipped");
    return {
      id,
      title: waiting ? customerOrderStatuses.pending : title,
      date: index === 0 ? received.date : null,
      status: ongoing ? "in-progress" : index <= current ? "completed" : "pending",
      current: active,
      description: index === 0 ? undefined : index > current || waiting
        ? "Güncelleme bekleniyor."
        : "Aşama tarihi paylaşılmadı.",
    };
  });
}

/** Keep carrier event dates when supplied; the order status controls the endpoint. */
export function deliveryOrderTimeline(order: TrackingOrder): OrderTimelineItem[] {
  const stopped = order.status === "cancelled" || order.status === "refunded";
  const currentTitle = order.status === "delivered" ? "Teslim edildi"
    : order.status === "shipped"
      ? order.events.some(event => event.label === "Dağıtımda" && recordedDate(event.at)) ? "Dağıtımda" : "Kargoya verildi"
      : "Hazırlanıyor";
  const currentIndex = order.events.findIndex(event => event.label === currentTitle);
  const items: OrderTimelineItem[] = order.events.map((event, index) => {
    const date = recordedDate(event.at);
    const current = !stopped && index === currentIndex;
    const ongoing = current && order.status !== "delivered";
    const completed = !!date || (!stopped && index <= currentIndex);
    return {
      id: event.label, title: event.label, date, current,
      status: ongoing ? "in-progress" : completed ? "completed" : "pending",
      description: date ? undefined : stopped ? "Kayıt bulunmuyor."
        : completed ? "Aşama tarihi paylaşılmadı." : "Güncelleme bekleniyor.",
    };
  });
  if (stopped) items.push({
    id: order.status, title: order.status === "cancelled" ? "İptal edildi" : "İade edildi",
    date: recordedDate(order.terminalAt), status: "stopped", current: true,
    description: "İşlem tarihi paylaşılmadı.",
  });
  return items;
}
