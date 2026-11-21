/** Yönetim paneli (görev 215 Aşama 1) ortak sözleşmeleri: sipariş, müşteri, lead. */
export const adminListPageSize = 20;
export const orderStatuses = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof orderStatuses)[number];
/** Panelden yalnız lojistik durumlar verilir; ödeme durumları (pending/paid/refunded) ödeme akışına aittir. */
export const orderStatusesSettable = ["preparing", "shipped", "delivered", "cancelled"] as const;
export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Ödeme bekliyor", paid: "Ödendi", preparing: "Hazırlanıyor", shipped: "Kargoda", delivered: "Teslim edildi", cancelled: "İptal", refunded: "İade",
};
export const leadStatuses = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof leadStatuses)[number];
export const leadStatusLabels: Record<LeadStatus, string> = { new: "Yeni", contacted: "Görüşüldü", closed: "Kapandı" };
export const leadSources = ["iletisim", "bayilik", "teklif"] as const;
export const leadSourceLabels: Record<string, string> = { iletisim: "İletişim", bayilik: "Bayilik", teklif: "Teklif" };
export const leadLimits = { name: 200, email: 254, phone: 40, message: 4000, note: 2000 } as const;

export type AdminOrderRow = {
  id: string; orderNo: string; status: OrderStatus; totalKurus: number; createdAt: string;
  customerName: string; customerEmail: string; itemCount: number;
};
export type AdminOrderDetail = AdminOrderRow & {
  currency: string; shippingCarrier: string | null; trackingNo: string | null;
  deliveryAddress: { recipient: string; line: string; district: string; city: string; postalCode: string; phone: string };
  items: { id: string; productName: string; weight: string; quantity: number; unitPriceKurus: number }[];
};
export type AdminCustomerRow = {
  id: string; name: string; email: string; phone: string | null; createdAt: string; orderCount: number; totalKurus: number; addressCount: number;
};
export type AdminCustomerDetail = AdminCustomerRow & {
  addresses: { id: string; title: string; recipient: string; phone: string; city: string; district: string; line: string; postalCode: string; isDefault: boolean }[];
};
export type AdminLead = {
  id: string; createdAt: string; name: string; email: string | null; phone: string | null; message: string; source: string; status: LeadStatus; note: string | null;
};
export type AdminListResponse<T> = { data: T[]; total: number; page: number; pageSize: number };

export const validRecordId = (value: unknown): value is string => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
export const isOrderStatus = (value: unknown): value is OrderStatus => typeof value === "string" && (orderStatuses as readonly string[]).includes(value);
export const isLeadStatus = (value: unknown): value is LeadStatus => typeof value === "string" && (leadStatuses as readonly string[]).includes(value);

export type ListQuery = { page: number; status: string | null; q: string | null; id: string | null };
/** Sayfa, durum, arama ve kimlik değerlerini sıkı doğrular; geçersizse null döner. */
export function parseListQuery(params: URLSearchParams, statuses: readonly string[]): ListQuery | null {
  const page = Number(params.get("page") ?? "1");
  const status = params.get("status");
  const rawQ = params.get("q");
  const id = params.get("id");
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000000) return null;
  if (status !== null && status !== "" && !statuses.includes(status)) return null;
  if (id !== null && !validRecordId(id)) return null;
  const q = rawQ === null ? null : rawQ.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  if (q !== null && q.length > 100) return null;
  return { page, status: status || null, q: q || null, id };
}
/** LIKE aramasında özel karakterleri etkisiz kılar (ESCAPE '\'). */
export const likePattern = (value: string) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;

const cleanLine = (value: string) => value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
export type LeadInput = { name: string; email: string | null; phone: string | null; message: string; source: string };
/** Herkese açık form girdisi: bilinmeyen alan reddedilir, metinler temizlenir. */
export function parseLeadInput(value: unknown): LeadInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = ["name", "email", "phone", "message", "source", "website"];
  if (Object.keys(input).some(key => !allowed.includes(key))) return null;
  for (const key of ["name", "email", "phone", "message", "source"]) if (input[key] !== undefined && typeof input[key] !== "string") return null;
  const name = cleanLine(String(input.name ?? ""));
  const email = cleanLine(String(input.email ?? ""));
  const phone = cleanLine(String(input.phone ?? ""));
  const message = String(input.message ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  const source = String(input.source ?? "iletisim");
  if (name.length < 2 || name.length > leadLimits.name) return null;
  if (email && (email.length > leadLimits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null;
  const digits = phone.replace(/\D/g, "");
  if (phone && (phone.length > leadLimits.phone || !/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) return null;
  if (!email && !phone) return null;
  if (message.length > leadLimits.message) return null;
  if (!(leadSources as readonly string[]).includes(source)) return null;
  return { name, email: email || null, phone: phone || null, message, source };
}
export type LeadPatch = { id: string; status?: LeadStatus; note?: string | null };
export function parseLeadPatch(value: unknown): LeadPatch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !["id", "status", "note"].includes(key)) || !validRecordId(input.id)) return null;
  const patch: LeadPatch = { id: input.id };
  if (input.status !== undefined) { if (!isLeadStatus(input.status)) return null; patch.status = input.status; }
  if (input.note !== undefined) {
    if (input.note !== null && typeof input.note !== "string") return null;
    const note = typeof input.note === "string" ? input.note.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim() : "";
    if (note.length > leadLimits.note) return null;
    patch.note = note || null;
  }
  return patch.status === undefined && patch.note === undefined ? null : patch;
}
export type OrderPatch = { id: string; status: OrderStatus; shippingCarrier?: string | null; trackingNo?: string | null };
export function parseOrderPatch(value: unknown): OrderPatch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !["id", "status", "shippingCarrier", "trackingNo"].includes(key)) || !validRecordId(input.id)) return null;
  if (typeof input.status !== "string" || !(orderStatusesSettable as readonly string[]).includes(input.status)) return null;
  const patch: OrderPatch = { id: input.id, status: input.status as OrderStatus };
  for (const key of ["shippingCarrier", "trackingNo"] as const) {
    const raw = input[key];
    if (raw === undefined) continue;
    if (raw !== null && typeof raw !== "string") return null;
    const text = typeof raw === "string" ? cleanLine(raw) : "";
    if (text.length > 100) return null;
    patch[key] = text || null;
  }
  return patch;
}
