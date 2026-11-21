import { validRecordId } from "./admin-panel";

/** İndirim kodu sözleşmeleri (görev 215 Aşama 2). Para: kuruş (INTEGER), siparişlerle aynı. İstemci ve sunucu ortak kullanır. */
export const discountTypes = ["percent", "fixed"] as const;
export type DiscountType = (typeof discountTypes)[number];
export const discountTypeLabels: Record<DiscountType, string> = { percent: "Yüzde", fixed: "Tutar (₺)" };
export const discountStatuses = ["active", "passive"] as const;
export const discountStatusLabels: Record<string, string> = { active: "Açık", passive: "Kapalı" };
export const discountLimits = { codeMin: 3, codeMax: 32, note: 500, maxUses: 1_000_000, valueFixedMax: 100_000_000, cartLines: 50, quantity: 10_000 } as const;
/** Tek yerde: herkese açık doğrulamada her başarısızlık nedeni (yok, pasif, süresi geçmiş, limit dolu, alt tutar) aynı mesajı verir. */
export const invalidCodeMessage = "Kod geçersiz.";

export type AdminDiscount = {
  id: string; code: string; type: DiscountType; value: number; minSubtotalKurus: number; startsAt: string | null; endsAt: string | null;
  maxUses: number | null; usedCount: number; active: boolean; createdAt: string; note: string | null;
};

/** Büyük/küçük harf duyarsız karşılaştırma için tek biçim: kırpılır ve ASCII büyük harfe çevrilir (yerel ayardan bağımsız). */
export function normalizeDiscountCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  if (code.length < discountLimits.codeMin || code.length > discountLimits.codeMax || !/^[A-Z0-9_-]+$/.test(code)) return null;
  return code;
}

/** Yüzde: tam sayı aritmetiği, yarım kuruş yukarı yuvarlanır; ondalık kayma yoktur. Tutar: sabit. Sonuç [0, ara toplam] aralığındadır. */
export function computeDiscountKurus(type: DiscountType, value: number, subtotalKurus: number): number {
  if (!Number.isSafeInteger(subtotalKurus) || subtotalKurus <= 0 || !Number.isSafeInteger(value) || value <= 0) return 0;
  const raw = type === "percent" ? Math.floor((subtotalKurus * Math.min(value, 100) + 50) / 100) : value;
  return Math.max(0, Math.min(raw, subtotalKurus));
}

export type CartLineInput = { productId: string; quantity: number };
/** Sepet satırları: yalnız ürün kimliği ve adet kabul edilir; fiyat/toplam/indirim alanı gelirse istek reddedilir. */
export function parseCartLines(value: unknown): CartLineInput[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > discountLimits.cartLines) return null;
  const seen = new Set<string>();
  const lines: CartLineInput[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const line = entry as Record<string, unknown>;
    if (Object.keys(line).some(key => key !== "productId" && key !== "quantity")) return null;
    if (!validRecordId(line.productId) || seen.has(line.productId)) return null;
    if (!Number.isSafeInteger(line.quantity) || (line.quantity as number) < 1 || (line.quantity as number) > discountLimits.quantity) return null;
    seen.add(line.productId);
    lines.push({ productId: line.productId, quantity: line.quantity as number });
  }
  return lines;
}

export type ValidateRequest = { code: string; items: CartLineInput[] };
export function parseValidateRequest(value: unknown): ValidateRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => key !== "code" && key !== "items")) return null;
  const code = normalizeDiscountCode(input.code);
  const items = parseCartLines(input.items);
  return code && items ? { code, items } : null;
}

export type DiscountFields = {
  type: DiscountType; value: number; minSubtotalKurus: number; startsAt: string | null; endsAt: string | null; maxUses: number | null; note: string | null; active: boolean;
};
export type DiscountCreate = DiscountFields & { code: string };
export type DiscountPatch = { id: string } & Partial<DiscountFields>;

function isoOrNull(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string" || value.length > 40) return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}
function intField(value: unknown, min: number, max: number): number | undefined {
  return Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max ? (value as number) : undefined;
}
const cleanNote = (value: string) => value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();

/** Ortak alan doğrulaması; geçersizse null. `partial` ise yalnız verilen alanlar döner. */
function parseFields(input: Record<string, unknown>, partial: boolean): Partial<DiscountFields> | null {
  const out: Partial<DiscountFields> = {};
  const has = (key: string) => input[key] !== undefined;
  if (has("type")) { if (typeof input.type !== "string" || !(discountTypes as readonly string[]).includes(input.type)) return null; out.type = input.type as DiscountType; }
  if (has("value")) { const value = intField(input.value, 1, discountLimits.valueFixedMax); if (value === undefined) return null; out.value = value; }
  if (has("minSubtotalKurus")) { const value = intField(input.minSubtotalKurus, 0, discountLimits.valueFixedMax); if (value === undefined) return null; out.minSubtotalKurus = value; }
  for (const [key, field] of [["startsAt", "startsAt"], ["endsAt", "endsAt"]] as const) {
    if (!has(key)) continue;
    const value = isoOrNull(input[key]);
    if (value === undefined) return null;
    out[field] = value;
  }
  if (has("maxUses")) {
    if (input.maxUses === null) out.maxUses = null;
    else { const value = intField(input.maxUses, 1, discountLimits.maxUses); if (value === undefined) return null; out.maxUses = value; }
  }
  if (has("note")) {
    if (input.note !== null && typeof input.note !== "string") return null;
    const note = typeof input.note === "string" ? cleanNote(input.note) : "";
    if (note.length > discountLimits.note) return null;
    out.note = note || null;
  }
  if (has("active")) { if (typeof input.active !== "boolean") return null; out.active = input.active; }
  if (!partial && (out.type === undefined || out.value === undefined)) return null;
  return out;
}
/** Yüzde 1-100, bitiş başlangıçtan sonra olmalı. Eksik alanlar (kısmi güncelleme) veritabanı denetimine kalır. */
function consistent(fields: Partial<DiscountFields>): boolean {
  if (fields.type === "percent" && fields.value !== undefined && fields.value > 100) return false;
  return !(fields.startsAt && fields.endsAt && fields.startsAt >= fields.endsAt);
}

const createKeys = ["code", "type", "value", "minSubtotalKurus", "startsAt", "endsAt", "maxUses", "note", "active"];
export function parseDiscountCreate(value: unknown): DiscountCreate | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !createKeys.includes(key))) return null;
  const code = normalizeDiscountCode(input.code);
  const fields = parseFields(input, false);
  if (!code || !fields || !consistent(fields)) return null;
  return { code, type: fields.type!, value: fields.value!, minSubtotalKurus: fields.minSubtotalKurus ?? 0, startsAt: fields.startsAt ?? null,
    endsAt: fields.endsAt ?? null, maxUses: fields.maxUses ?? null, note: fields.note ?? null, active: fields.active ?? true };
}
export function parseDiscountPatch(value: unknown): DiscountPatch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => key !== "id" && (key === "code" || !createKeys.includes(key))) || !validRecordId(input.id)) return null;
  const fields = parseFields(input, true);
  if (!fields || !consistent(fields) || Object.keys(fields).length === 0) return null;
  return { id: input.id, ...fields };
}

/** Panel girdisi: "12,50" veya "12.5" → 1250 kuruş; geçersizse null. */
export function tlToKurus(value: string): number | null {
  const text = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
}
export const kurusToTl = (kurus: number) => (kurus % 100 === 0 ? String(kurus / 100) : (kurus / 100).toFixed(2).replace(".", ","));
/** Panelde tarih alanları Türkiye saatiyle (UTC+3, yaz saati yok) girilir. */
export function istanbulInputToIso(value: string): string | null | undefined {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const time = Date.parse(`${value}:00+03:00`);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}
export function isoToIstanbulInput(iso: string | null): string {
  if (!iso) return "";
  const time = Date.parse(iso);
  return Number.isNaN(time) ? "" : new Date(time + 3 * 3600_000).toISOString().slice(0, 16);
}
