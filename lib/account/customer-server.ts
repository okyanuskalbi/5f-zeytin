import "server-only";
import { AuthCoreError, getVerifiedUser } from "@/lib/auth/server";
import { query, transaction } from "@/lib/db";
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
  coalesce((SELECT jsonb_agg(jsonb_build_object('product_name',i.product_name,'weight',i.weight,
    'quantity',i.quantity,'unit_price_kurus',i.unit_price_kurus) ORDER BY i.id)
    FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb) AS order_items`;
const unavailable = () => new AuthCoreError(503, "customer_data_unavailable", 5);
function customerFailure(error: unknown): never {
  if (error instanceof AuthCoreError) throw error;
  throw unavailable();
}

export async function listCustomerAddresses() {
  const user = await requireCustomer();
  try {
    const { rows } = await query(`SELECT ${addressColumns} FROM public.customer_addresses WHERE user_id = $1 ORDER BY created_at,id LIMIT 20`, [user.id]);
    const addresses = rows.map(parseCustomerAddress);
    if (addresses.some(address => !address)) throw unavailable();
    return addresses.filter(address => address !== null);
  } catch (error) { customerFailure(error); }
}

export async function saveCustomerAddress(input: unknown) {
  const parsed = parseCustomerAddressInput(input);
  if (!parsed.ok) throw Object.assign(new AuthCoreError(400, "validation_error"), { fields: parsed.fields });
  const user = await requireCustomer();
  const { id, ...address } = parsed.data;
  try {
    return await transaction(async client => {
      // Serialize all address changes for this owner, including the first address.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [user.id]);
      if (id) {
        const existing = await client.query("SELECT id FROM public.customer_addresses WHERE id = $2 AND user_id = $1", [user.id, id]);
        if (!existing.rows.length) throw new AuthCoreError(404, "address_not_found");
      }
      const { rows: counts } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM public.customer_addresses WHERE user_id = $1", [user.id]);
      const count = counts[0].count;
      if (!id && count >= 20) throw new AuthCoreError(409, "address_limit");
      const isDefault = address.isDefault || count === (id ? 1 : 0);
      if (isDefault) await client.query("UPDATE public.customer_addresses SET is_default = false WHERE user_id = $1 AND is_default", [user.id]);
      const values = [user.id, address.title, address.recipient, address.phone, address.city, address.district, address.line, address.postalCode, isDefault];
      const saved = id
        ? await client.query(`UPDATE public.customer_addresses SET title=$2,recipient=$3,phone=$4,city=$5,district=$6,line=$7,postal_code=$8,is_default=$9 WHERE user_id = $1 AND id = $10 RETURNING ${addressColumns}`, [...values, id])
        : await client.query(`INSERT INTO public.customer_addresses(user_id,title,recipient,phone,city,district,line,postal_code,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${addressColumns}`, values);
      const row = saved.rows[0];
      if (!row) throw unavailable();
      // Unchecking the only default must still leave one default, as the old RPC did.
      if (!isDefault) {
        const defaults = await client.query("SELECT id FROM public.customer_addresses WHERE user_id = $1 AND is_default", [user.id]);
        if (!defaults.rows.length) {
          await client.query("UPDATE public.customer_addresses SET is_default = true WHERE user_id = $1 AND id = $2", [user.id, row.id]);
          row.is_default = true;
        }
      }
      const result = parseCustomerAddress(row);
      if (!result) throw unavailable();
      return result;
    });
  } catch (error) { customerFailure(error); }
}

export async function deleteCustomerAddress(id: unknown) {
  if (!isCustomerId(id)) throw new AuthCoreError(400, "invalid_address");
  const user = await requireCustomer();
  try {
    await transaction(async client => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [user.id]);
      const deleted = await client.query("DELETE FROM public.customer_addresses WHERE user_id = $1 AND id = $2 RETURNING id", [user.id, id]);
      if (!deleted.rowCount) throw new AuthCoreError(404, "address_not_found");
      await client.query(`UPDATE public.customer_addresses SET is_default = true
        WHERE user_id = $1 AND id = (SELECT id FROM public.customer_addresses WHERE user_id = $1 ORDER BY created_at,id LIMIT 1)
        AND NOT EXISTS (SELECT 1 FROM public.customer_addresses WHERE user_id = $1 AND is_default)`, [user.id]);
    });
  } catch (error) { customerFailure(error); }
}

function parseOrderRow(row: Record<string, unknown>) {
  return parseCustomerOrder({ ...row, created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at });
}
export async function listCustomerOrders(page = 1) {
  if (!Number.isInteger(page) || page < 1 || page > 100000) throw new AuthCoreError(400, "invalid_page");
  const user = await requireCustomer();
  try {
    const { rows: counts } = await query<{ total: number }>("SELECT count(*)::int AS total FROM public.orders WHERE user_id = $1", [user.id]);
    const total = counts[0]?.total;
    if (!Number.isSafeInteger(total) || total < 0) throw unavailable();
    const { rows } = await query(`SELECT ${orderColumns} FROM public.orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC,o.id DESC LIMIT $2 OFFSET $3`, [user.id, customerPageSize, (page - 1) * customerPageSize]);
    const orders = rows.map(parseOrderRow);
    if (orders.some(order => !order)) throw unavailable();
    return { orders: orders.filter(order => order !== null), page, total };
  } catch (error) { customerFailure(error); }
}
export async function readCustomerOrder(no: unknown) {
  if (!isOrderNo(no)) throw new AuthCoreError(404, "order_not_found");
  const user = await requireCustomer();
  try {
    const { rows } = await query(`SELECT ${orderColumns} FROM public.orders o WHERE o.user_id = $1 AND o.order_no = $2`, [user.id, no]);
    if (!rows.length) throw new AuthCoreError(404, "order_not_found");
    const order = parseOrderRow(rows[0]);
    if (!order) throw unavailable();
    return order;
  } catch (error) { customerFailure(error); }
}
