import "server-only";
import { AuthCoreError, getVerifiedUser } from "@/lib/auth/server";
import { randomUUID } from "node:crypto";
import { asBoolean, batch, query } from "@/lib/db";
import {
  customerPageSize,
  isCustomerId,
  isOrderNo,
  parseCustomerAddress,
  parseCustomerAddressInput,
  parseCustomerOrder,
} from "@/lib/contracts/customer";

export async function requireCustomer() {
  const user = await getVerifiedUser();
  if (!user) throw new AuthCoreError(401, "unauthenticated");
  return user;
}
const addressColumns = "id,title,recipient,phone,city,district,line,postal_code,is_default";
// Items are joined through an already owner-filtered order. No private payment fields.
const orderColumns = `o.order_no,o.status,o.created_at,o.total_kurus,o.delivery_address,
  o.shipping_carrier,o.tracking_no,o.tracking_url,
  coalesce((SELECT json_group_array(json_object('product_name',s.product_name,'weight',s.weight,
    'quantity',s.quantity,'unit_price_kurus',s.unit_price_kurus))
    FROM (SELECT i.product_name,i.weight,i.quantity,i.unit_price_kurus FROM order_items i WHERE i.order_id = o.id ORDER BY i.id) s), '[]') AS order_items`;
const unavailable = () => new AuthCoreError(503, "customer_data_unavailable", 5);
function customerFailure(error: unknown): never {
  if (error instanceof AuthCoreError) throw error;
  throw unavailable();
}

/** D1 satırı: mantıksal sütun 0/1 gelir; sözleşme ayrıştırıcısı gerçek boolean bekler. */
const addressRow = (row: Record<string, unknown>) => ({ ...row, is_default: asBoolean(row.is_default) });

export async function listCustomerAddresses() {
  const user = await requireCustomer();
  try {
    const { rows } = await query(`SELECT ${addressColumns} FROM customer_addresses WHERE user_id = $1 ORDER BY created_at,id LIMIT 20`, [user.id]);
    const addresses = rows.map(row => parseCustomerAddress(addressRow(row)));
    if (addresses.some(address => !address)) throw unavailable();
    return addresses.filter(address => address !== null);
  } catch (error) { customerFailure(error); }
}

function guardFailure(error: unknown): never {
  const code = /guard:(\w+)/.exec(error instanceof Error ? error.message : "")?.[1];
  if (code === "address_not_found") throw new AuthCoreError(404, "address_not_found");
  if (code === "address_limit") throw new AuthCoreError(409, "address_limit");
  throw error;
}
const guardStatement = (code: string, condition: string, values: readonly unknown[]) =>
  ({ text: `INSERT INTO sql_guard(code, ok) SELECT '${code}', CASE WHEN ${condition} THEN 1 ELSE 0 END`, values });

/** Önceki sürümde sahip başına danışma kilidi + işlem vardı. D1'de aynı kurallar tek atomik `batch` içindedir:
 * koşullar (sayım, varsayılan seçimi) ifadelerin içinde hesaplanır, D1 toplu çağrıyı bölmeden çalıştırır. */
export async function saveCustomerAddress(input: unknown) {
  const parsed = parseCustomerAddressInput(input);
  if (!parsed.ok) throw Object.assign(new AuthCoreError(400, "validation_error"), { fields: parsed.fields });
  const user = await requireCustomer();
  const { id, ...address } = parsed.data;
  try {
    const rowId = id ?? randomUUID();
    const owned = "(SELECT count(*) FROM customer_addresses WHERE user_id = $1)";
    // Yeni kayıt: ilk adres ya da istenmişse varsayılan. Düzenleme: tek adres ya da istenmişse varsayılan.
    const makeDefault = (flag: string) => `(${flag} = 1 OR ${owned} = ${id ? 1 : 0})`;
    const fields = [user.id, address.title, address.recipient, address.phone, address.city, address.district, address.line, address.postalCode, rowId, address.isDefault];
    const statements = [
      id
        ? guardStatement("address_not_found", "EXISTS (SELECT 1 FROM customer_addresses WHERE id = $2 AND user_id = $1)", [user.id, rowId])
        : guardStatement("address_limit", `${owned} < 20`, [user.id]),
      { text: `UPDATE customer_addresses SET is_default = 0 WHERE user_id = $1 AND is_default = 1 AND ${makeDefault("$2")}`, values: [user.id, address.isDefault] },
      id
        ? { text: `UPDATE customer_addresses SET title=$2,recipient=$3,phone=$4,city=$5,district=$6,line=$7,postal_code=$8,
            is_default = CASE WHEN ${makeDefault("$10")} THEN 1 ELSE 0 END WHERE user_id = $1 AND id = $9`, values: fields }
        : { text: `INSERT INTO customer_addresses(id,user_id,title,recipient,phone,city,district,line,postal_code,is_default)
            VALUES ($9,$1,$2,$3,$4,$5,$6,$7,$8, CASE WHEN ${makeDefault("$10")} THEN 1 ELSE 0 END)`, values: fields },
      // Tek varsayılanı kaldırmak da bir varsayılan bırakmalı (eski RPC gibi).
      { text: `UPDATE customer_addresses SET is_default = 1 WHERE user_id = $1 AND id = $2
        AND NOT EXISTS (SELECT 1 FROM customer_addresses WHERE user_id = $1 AND is_default = 1)`, values: [user.id, rowId] },
      { text: `SELECT ${addressColumns} FROM customer_addresses WHERE user_id = $1 AND id = $2`, values: [user.id, rowId] },
    ];
    const results = await batch(statements);
    const row = results[results.length - 1].rows[0];
    if (!row) throw unavailable();
    const result = parseCustomerAddress(addressRow(row));
    if (!result) throw unavailable();
    return result;
  } catch (error) {
    try { guardFailure(error); } catch (mapped) { customerFailure(mapped); }
  }
}

export async function deleteCustomerAddress(id: unknown) {
  if (!isCustomerId(id)) throw new AuthCoreError(400, "invalid_address");
  const user = await requireCustomer();
  try {
    await batch([
      guardStatement("address_not_found", "EXISTS (SELECT 1 FROM customer_addresses WHERE user_id = $1 AND id = $2)", [user.id, id]),
      { text: "DELETE FROM customer_addresses WHERE user_id = $1 AND id = $2", values: [user.id, id] },
      { text: `UPDATE customer_addresses SET is_default = 1
        WHERE user_id = $1 AND id = (SELECT id FROM customer_addresses WHERE user_id = $1 ORDER BY created_at,id LIMIT 1)
        AND NOT EXISTS (SELECT 1 FROM customer_addresses WHERE user_id = $1 AND is_default = 1)`, values: [user.id] },
    ]);
  } catch (error) {
    try { guardFailure(error); } catch (mapped) { customerFailure(mapped); }
  }
}

function parseOrderRow(row: Record<string, unknown>) {
  const json = (value: unknown) => { if (typeof value !== "string") return value; try { return JSON.parse(value); } catch { return value; } };
  return parseCustomerOrder({ ...row, created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    delivery_address: json(row.delivery_address), order_items: json(row.order_items) });
}
export async function listCustomerOrders(page = 1) {
  if (!Number.isInteger(page) || page < 1 || page > 100000) throw new AuthCoreError(400, "invalid_page");
  const user = await requireCustomer();
  try {
    const { rows: counts } = await query<{ total: number }>("SELECT count(*) AS total FROM orders WHERE user_id = $1", [user.id]);
    const total = counts[0]?.total;
    if (!Number.isSafeInteger(total) || total < 0) throw unavailable();
    const { rows } = await query(`SELECT ${orderColumns} FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC,o.id DESC LIMIT $2 OFFSET $3`, [user.id, customerPageSize, (page - 1) * customerPageSize]);
    const orders = rows.map(parseOrderRow);
    if (orders.some(order => !order)) throw unavailable();
    return { orders: orders.filter(order => order !== null), page, total };
  } catch (error) { customerFailure(error); }
}
export async function readCustomerOrder(no: unknown) {
  if (!isOrderNo(no)) throw new AuthCoreError(404, "order_not_found");
  const user = await requireCustomer();
  try {
    const { rows } = await query(`SELECT ${orderColumns} FROM orders o WHERE o.user_id = $1 AND o.order_no = $2`, [user.id, no]);
    if (!rows.length) throw new AuthCoreError(404, "order_not_found");
    const order = parseOrderRow(rows[0]);
    if (!order) throw unavailable();
    return order;
  } catch (error) { customerFailure(error); }
}
