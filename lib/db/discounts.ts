import "server-only";
import { randomUUID } from "node:crypto";
import { query, type Row, type SqlStatement } from "@/lib/db";
import { adminListPageSize, likePattern, type ListQuery } from "@/lib/contracts/admin-panel";
import { computeDiscountKurus, type AdminDiscount, type DiscountCreate, type DiscountPatch, type DiscountType } from "@/lib/contracts/discounts";

/** İndirim kodu okuma/yazma sorguları. Tüm değerler parametrelidir; sıralama ve sütunlar sabittir. */
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const text = (value: unknown) => (typeof value === "string" ? value : "");
const textOrNull = (value: unknown) => (typeof value === "string" ? value : null);
const columns = "id, code, type, value, min_subtotal, starts_at, ends_at, max_uses, used_count, active, created_at, note";
const toDiscount = (row: Row): AdminDiscount => ({ id: text(row.id), code: text(row.code), type: text(row.type) as DiscountType, value: num(row.value),
  minSubtotalKurus: num(row.min_subtotal), startsAt: textOrNull(row.starts_at), endsAt: textOrNull(row.ends_at),
  maxUses: row.max_uses === null || row.max_uses === undefined ? null : num(row.max_uses), usedCount: num(row.used_count), active: row.active === 1,
  createdAt: text(row.created_at), note: textOrNull(row.note) });

export async function getDiscountByCode(code: string): Promise<AdminDiscount | null> {
  const { rows } = await query<Row>(`select ${columns} from discount_codes where code = $1`, [code]);
  return rows[0] ? toDiscount(rows[0]) : null;
}
export async function getDiscountById(id: string): Promise<AdminDiscount | null> {
  const { rows } = await query<Row>(`select ${columns} from discount_codes where id = $1`, [id]);
  return rows[0] ? toDiscount(rows[0]) : null;
}

/** Kod bu ara toplam için bu anda kullanılabilir mi? Kullanılabilirse indirim tutarı (kuruş), değilse null.
 * Nedenler (pasif, başlamamış, bitmiş, limit dolu, alt tutar altında) dışarıya ayırt edilmez. */
export function evaluateDiscount(discount: AdminDiscount | null, subtotalKurus: number, now: number): number | null {
  if (!discount || !discount.active) return null;
  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) return null;
  if (discount.startsAt && Date.parse(discount.startsAt) > now) return null;
  if (discount.endsAt && Date.parse(discount.endsAt) <= now) return null;
  if (subtotalKurus < discount.minSubtotalKurus) return null;
  const amount = computeDiscountKurus(discount.type, discount.value, subtotalKurus);
  return amount > 0 ? amount : null;
}

/** Sipariş yazımıyla AYNI toplu çağrıya konur: sayaç yalnız kod hâlâ geçerliyse ve hesaplanan değerler değişmediyse artar;
 * artmadıysa (limit doldu, kapatıldı, süre bitti, değer düzenlendi) koruma satırı tüm çağrıyı geri alır. */
export function redeemStatements(discount: AdminDiscount, subtotalKurus: number, now: number): SqlStatement[] {
  const iso = new Date(now).toISOString();
  return [
    { text: `update discount_codes set used_count = used_count + 1
      where id = $1 and active = 1 and type = $2 and value = $3 and min_subtotal <= $4
        and (max_uses is null or used_count < max_uses) and (starts_at is null or starts_at <= $5) and (ends_at is null or ends_at > $5)`,
    values: [discount.id, discount.type, discount.value, subtotalKurus, iso] },
    { text: "insert into discount_guard(ok) select case when changes() = 1 then 1 else 0 end" },
  ];
}

const filter = `($1 is null or d.code like $1 escape '\\' or coalesce(d.note, '') like $1 escape '\\')
  and ($2 is null or (case when d.active = 1 then 'active' else 'passive' end) = $2) and ($3 is null or d.id = $3)`;
export async function listDiscounts(input: ListQuery): Promise<{ rows: AdminDiscount[]; total: number }> {
  const params = [input.q ? likePattern(input.q) : null, input.status, input.id];
  const [list, total] = await Promise.all([
    query<Row>(`select ${columns.replaceAll(/(\w+)/g, "d.$1")} from discount_codes d where ${filter} order by d.created_at desc, d.id desc limit $4 offset $5`,
      [...params, adminListPageSize, (input.page - 1) * adminListPageSize]),
    query<Row>(`select count(*) as count from discount_codes d where ${filter}`, params),
  ]);
  return { rows: list.rows.map(toDiscount), total: num(total.rows[0]?.count) };
}

export type DiscountWriteResult = { status: "ok"; id: string } | { status: "duplicate" | "not_found" | "limit_below_usage" | "invalid" };
export async function createDiscount(input: DiscountCreate): Promise<DiscountWriteResult> {
  const id = randomUUID();
  try {
    await query(`insert into discount_codes (id, code, type, value, min_subtotal, starts_at, ends_at, max_uses, active, note) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, input.code, input.type, input.value, input.minSubtotalKurus, input.startsAt, input.endsAt, input.maxUses, input.active ? 1 : 0, input.note]);
    return { status: "ok", id };
  } catch (error) {
    const code = (error as { code?: string | null }).code;
    if (code === "23505") return { status: "duplicate" };
    if (code === "23514") return { status: "invalid" };
    throw error;
  }
}

/** Kod değişmez; kullanım sayısı panelden değiştirilemez. Verilmeyen alanlar olduğu gibi kalır. */
export async function updateDiscount(patch: DiscountPatch): Promise<DiscountWriteResult> {
  const current = await getDiscountById(patch.id);
  if (!current) return { status: "not_found" };
  const next = { ...current, ...Object.fromEntries(Object.entries(patch).filter(([key, value]) => key !== "id" && value !== undefined)) } as AdminDiscount;
  if (next.maxUses !== null && next.maxUses < current.usedCount) return { status: "limit_below_usage" };
  try {
    const result = await query(`update discount_codes set type = $2, value = $3, min_subtotal = $4, starts_at = $5, ends_at = $6, max_uses = $7, active = $8, note = $9
      where id = $1 and (max_uses is null or max_uses >= used_count)`,
    [patch.id, next.type, next.value, next.minSubtotalKurus, next.startsAt, next.endsAt, next.maxUses, next.active ? 1 : 0, next.note]);
    return result.rowCount > 0 ? { status: "ok", id: patch.id } : { status: "not_found" };
  } catch (error) {
    if ((error as { code?: string | null }).code === "23514") return { status: "invalid" };
    throw error;
  }
}

export const discountRateLimit = { perClient: 10, global: 300, windowMs: 10 * 60 * 1000 } as const;
async function consumeBucket(key: string, now: number, max: number): Promise<boolean> {
  const { rows } = await query<{ count: number }>(`insert into "rateLimit" (id, key, count, "lastRequest") values ($1, $2, 1, $3)
    on conflict (key) do update set
      count = case when $3 - "rateLimit"."lastRequest" > $4 then 1 else "rateLimit".count + 1 end,
      "lastRequest" = case when $3 - "rateLimit"."lastRequest" > $4 then $3 else "rateLimit"."lastRequest" end
    returning count`, [randomUUID(), key, now, discountRateLimit.windowMs]);
  return (rows[0]?.count ?? 1) <= max;
}
/** Kod deneme hız sınırı (kaba kuvvet): istemci başına ve tüm site için. Her deneme (geçerli ya da değil) sayılır. Ham IP saklanmaz. */
export async function consumeDiscountAttempt(clientAddress: string, now = Date.now()): Promise<boolean> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`discount:${clientAddress}`));
  const key = `discount:${[...new Uint8Array(digest)].slice(0, 16).map(byte => byte.toString(16).padStart(2, "0")).join("")}`;
  const own = await consumeBucket(key, now, discountRateLimit.perClient);
  const all = await consumeBucket("discount:global", now, discountRateLimit.global);
  return own && all;
}
