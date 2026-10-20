import { emailError, isMembershipDemoEnabled, type AuthAdapter, type DemoStorage } from "@/lib/auth/adapter";

export { isMembershipDemoEnabled as isTrackingDemoEnabled };
export const trackingStages = ["Sipariş alındı", "Ödeme onaylandı", "Hazırlanıyor", "Kargoya verildi", "Dağıtımda", "Teslim edildi"] as const;
export type TrackingStatus = "preparing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type TrackingQuery = { no: string; contact: string };
export type TrackingOrder = {
  no: string;
  status: TrackingStatus;
  events: { label: typeof trackingStages[number]; at: string | null }[];
  terminalAt?: string;
  items: { name: string; quantity: number; unitPriceKurus: number }[];
  amountKurus: number;
  /** Already masked by the adapter; full address must never reach this UI. */
  deliveryAddress: string;
  shipping: { carrier: string; trackingNo: string; trackingUrl: string | null; estimatedDelivery: string | null } | null;
};
export type TrackingResult = { kind: "found"; order: TrackingOrder } | { kind: "not-found" } | { kind: "rate-limited"; retryAfterSeconds: number };
export interface TrackingAdapter {
  lookup(query: TrackingQuery): Promise<TrackingResult>;
  getOwnOrder(no: string): Promise<TrackingResult>;
}
export interface TrackingAttemptLimiter { consume(): { allowed: boolean; retryAfterSeconds: number } }

export function validateTrackingQuery({ no, contact }: TrackingQuery): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!/^[A-Z0-9][A-Z0-9-]{2,39}$/i.test(no.trim())) fields.no = "Geçerli bir sipariş numarası girin (3–40 harf, rakam veya kısa çizgi).";
  if (!/^\d{4}$/.test(contact.trim()) && emailError(contact.trim())) fields.contact = "E-posta adresinizi veya telefonunuzun son 4 rakamını girin.";
  return fields;
}

/** Demo UI limit only. Real enforcement belongs to the approved server adapter. */
export function createDemoAttemptLimiter(storage?: DemoStorage, now = Date.now): TrackingAttemptLimiter {
  let attempts: number[] = [];
  const key = "afina:tracking:demo-attempts:v1";
  return { consume() {
    const time = now();
    try {
      const saved: unknown = JSON.parse(storage?.getItem(key) ?? "null");
      if (Array.isArray(saved) && saved.every(value => typeof value === "number" && Number.isFinite(value))) attempts = saved;
    } catch { /* Memory fallback for storage-denied browsers. */ }
    attempts = attempts.filter(at => at > time - 60_000 && at <= time);
    if (attempts.length >= 5) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((attempts[0] + 60_000 - time) / 1000)) };
    attempts.push(time);
    try { storage?.setItem(key, JSON.stringify(attempts)); } catch { /* Memory fallback. */ }
    return { allowed: true, retryAfterSeconds: 0 };
  } };
}

function sampleOrder(no: string, status: "preparing" | "shipped" | "delivered", amountKurus: number): TrackingOrder {
  const completed = status === "preparing" ? 3 : status === "shipped" ? 4 : 6;
  const day = status === "delivered" ? 10 : 20;
  const dates = [day, day, day, day, day + 1, day + 1];
  const times = ["09:00", "09:02", "11:30", "16:15", "08:45", "14:20"];
  return {
    no, status, amountKurus,
    events: trackingStages.map((label, i) => ({ label, at: i < completed ? `2026-10-${dates[i]}T${times[i]}:00+03:00` : null })),
    items: [{ name: "Sofralık Zeytin · örnek ürün", quantity: 2, unitPriceKurus: amountKurus / 2 }],
    deliveryAddress: "D*** S*** · Ö*** Mah. No: ** · Düziçi / Osmaniye",
    shipping: status === "preparing" ? null : {
      carrier: "Örnek kargo firması", trackingNo: `DEMO-KARGO-${no.slice(-5)}`,
      // No carrier has been selected. Do not invent a carrier URL or send demo IDs externally.
      trackingUrl: null, estimatedDelivery: status === "shipped" ? "2026-10-23" : null,
    },
  };
}

/** Three synthetic orders only. This is neither authentication nor an order database. */
export function createMockTrackingAdapter(auth: Pick<AuthAdapter, "getSession">, limiter = createDemoAttemptLimiter()): TrackingAdapter {
  const orders = [sampleOrder("DEMO-10902", "preparing", 64000), sampleOrder("DEMO-10801", "shipped", 125000), sampleOrder("DEMO-10800", "delivered", 89000)];
  function find(no: string): TrackingResult {
    const order = orders.find(order => order.no === no.trim().toUpperCase());
    return order ? { kind: "found", order: structuredClone(order) } : { kind: "not-found" };
  }
  return {
    async lookup(query) {
      const attempt = limiter.consume();
      if (!attempt.allowed) return { kind: "rate-limited", retryAfterSeconds: attempt.retryAfterSeconds };
      if (Object.keys(validateTrackingQuery(query)).length) return { kind: "not-found" };
      const contact = query.contact.trim().toLowerCase();
      return contact === "demo@example.test" || contact === "4567" ? find(query.no) : { kind: "not-found" };
    },
    async getOwnOrder(no) {
      const session = await auth.getSession();
      return session?.id === "demo-google" && session.email === "demo@example.test" ? find(no) : { kind: "not-found" };
    },
  };
}

export function isSafeCarrierUrl(value: string | null): value is string {
  if (!value) return false;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
