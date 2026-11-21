import "server-only";
import { query, type Row } from "@/lib/db";
import { adminListPageSize, likePattern, type AdminCustomerDetail, type AdminCustomerRow, type AdminLead, type AdminOrderDetail, type AdminOrderRow,
  type LeadPatch, type LeadStatus, type ListQuery, type OrderPatch, type OrderStatus } from "@/lib/contracts/admin-panel";

/** Yönetim paneli okuma/yazma sorguları. Tüm değerler parametrelidir; sıralama ve sütunlar sabittir. */
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const text = (value: unknown) => (typeof value === "string" ? value : "");
const textOrNull = (value: unknown) => (typeof value === "string" ? value : null);
const offset = (page: number) => (page - 1) * adminListPageSize;
const search = (q: string | null) => (q ? likePattern(q) : null);

export type PanelCounts = { activeProducts: number; awaitingPayment: number; readyToShip: number; orders: number; customers: number; newLeads: number };
export async function getPanelCounts(): Promise<PanelCounts> {
  const { rows } = await query<Row>(`select
    (select count(*) from products where is_active = 1) as active_products,
    (select count(*) from orders where status = 'pending') as awaiting_payment,
    (select count(*) from orders where status in ('paid', 'preparing')) as ready_to_ship,
    (select count(*) from orders) as orders,
    (select count(*) from "user") as customers,
    (select count(*) from leads where status = 'new') as new_leads`);
  const row = rows[0] ?? {};
  return { activeProducts: num(row.active_products), awaitingPayment: num(row.awaiting_payment), readyToShip: num(row.ready_to_ship),
    orders: num(row.orders), customers: num(row.customers), newLeads: num(row.new_leads) };
}

const orderFilter = `($1 is null or o.status = $1)
  and ($2 is null or o.order_no like $2 escape '\\' or u.email like $2 escape '\\' or u.name like $2 escape '\\')
  and ($3 is null or o.id = $3)`;
const toOrderRow = (row: Row): AdminOrderRow => ({ id: text(row.id), orderNo: text(row.order_no), status: text(row.status) as OrderStatus,
  totalKurus: num(row.total_kurus), createdAt: text(row.created_at), customerName: text(row.customer_name), customerEmail: text(row.customer_email), itemCount: num(row.item_count) });

export async function listOrders(input: ListQuery): Promise<{ rows: AdminOrderRow[]; total: number }> {
  const params = [input.status, search(input.q), input.id];
  const [list, total] = await Promise.all([
    query<Row>(`select o.id, o.order_no, o.status, o.total_kurus, o.created_at, u.name as customer_name, u.email as customer_email,
      (select count(*) from order_items i where i.order_id = o.id) as item_count
      from orders o join "user" u on u.id = o.user_id where ${orderFilter}
      order by o.created_at desc, o.id desc limit $4 offset $5`, [...params, adminListPageSize, offset(input.page)]),
    query<Row>(`select count(*) as count from orders o join "user" u on u.id = o.user_id where ${orderFilter}`, params),
  ]);
  return { rows: list.rows.map(toOrderRow), total: num(total.rows[0]?.count) };
}

function parseAddress(value: unknown): AdminOrderDetail["deliveryAddress"] {
  let source: Record<string, unknown> = {};
  try { const parsed = typeof value === "string" ? JSON.parse(value) : value; if (parsed && typeof parsed === "object") source = parsed as Record<string, unknown>; } catch { /* boş adres */ }
  return { recipient: text(source.recipient), line: text(source.line), district: text(source.district), city: text(source.city),
    postalCode: text(source.postalCode), phone: text(source.phone) };
}
export async function getOrder(id: string): Promise<AdminOrderDetail | null> {
  const [head, items] = await Promise.all([
    query<Row>(`select o.id, o.order_no, o.status, o.total_kurus, o.currency, o.created_at, o.delivery_address, o.shipping_carrier, o.tracking_no,
      u.name as customer_name, u.email as customer_email, (select count(*) from order_items i where i.order_id = o.id) as item_count
      from orders o join "user" u on u.id = o.user_id where o.id = $1`, [id]),
    query<Row>("select id, product_name, weight, quantity, unit_price_kurus from order_items where order_id = $1 order by id", [id]),
  ]);
  const row = head.rows[0];
  if (!row) return null;
  return { ...toOrderRow(row), currency: text(row.currency), shippingCarrier: textOrNull(row.shipping_carrier), trackingNo: textOrNull(row.tracking_no),
    deliveryAddress: parseAddress(row.delivery_address),
    items: items.rows.map(item => ({ id: text(item.id), productName: text(item.product_name), weight: text(item.weight), quantity: num(item.quantity), unitPriceKurus: num(item.unit_price_kurus) })) };
}

/** İzinli geçişler: ödeme durumları (pending/paid/refunded) ödeme akışına aittir; panel yalnız lojistiği yürütür.
 * İptal yalnız ödemesi alınmamış (pending) siparişte; ödenmiş siparişin iadesi ödeme akışıyla yapılır. */
const allowedFrom: Record<string, readonly OrderStatus[]> = {
  preparing: ["paid"], shipped: ["paid", "preparing"], delivered: ["shipped"], cancelled: ["pending"],
};
export type OrderUpdateResult = "ok" | "not_found" | "conflict";
export async function updateOrderStatus(patch: OrderPatch): Promise<OrderUpdateResult> {
  const from = allowedFrom[patch.status] ?? [];
  const result = await query(`update orders set status = $2,
      shipping_carrier = case when $5 = 1 then $3 else shipping_carrier end,
      tracking_no = case when $6 = 1 then $4 else tracking_no end
    where id = $1 and status in (${from.map((_, index) => `$${index + 7}`).join(", ") || "''"})`,
    [patch.id, patch.status, patch.shippingCarrier ?? null, patch.trackingNo ?? null,
      patch.shippingCarrier !== undefined ? 1 : 0, patch.trackingNo !== undefined ? 1 : 0, ...from]);
  if (result.rowCount > 0) return "ok";
  const exists = await query("select 1 from orders where id = $1", [patch.id]);
  return exists.rows.length ? "conflict" : "not_found";
}

const customerFilter = `($1 is null or u.name like $1 escape '\\' or u.email like $1 escape '\\' or coalesce(u.phone, '') like $1 escape '\\') and ($2 is null or u.id = $2)`;
const toCustomerRow = (row: Row): AdminCustomerRow => ({ id: text(row.id), name: text(row.name), email: text(row.email), phone: textOrNull(row.phone),
  createdAt: text(row.created_at), orderCount: num(row.order_count), totalKurus: num(row.total_kurus), addressCount: num(row.address_count) });
const customerColumns = `u.id, u.name, u.email, u.phone, u."createdAt" as created_at,
  (select count(*) from orders o where o.user_id = u.id) as order_count,
  (select coalesce(sum(o.total_kurus), 0) from orders o where o.user_id = u.id and o.status in ('paid', 'preparing', 'shipped', 'delivered')) as total_kurus,
  (select count(*) from customer_addresses a where a.user_id = u.id) as address_count`;

export async function listCustomers(input: ListQuery): Promise<{ rows: AdminCustomerRow[]; total: number }> {
  const params = [search(input.q), input.id];
  const [list, total] = await Promise.all([
    query<Row>(`select ${customerColumns} from "user" u where ${customerFilter} order by u."createdAt" desc, u.id desc limit $3 offset $4`, [...params, adminListPageSize, offset(input.page)]),
    query<Row>(`select count(*) as count from "user" u where ${customerFilter}`, params),
  ]);
  return { rows: list.rows.map(toCustomerRow), total: num(total.rows[0]?.count) };
}
export async function getCustomer(id: string): Promise<AdminCustomerDetail | null> {
  const [head, addresses] = await Promise.all([
    query<Row>(`select ${customerColumns} from "user" u where u.id = $1`, [id]),
    query<Row>("select id, title, recipient, phone, city, district, line, postal_code, is_default from customer_addresses where user_id = $1 order by is_default desc, created_at", [id]),
  ]);
  if (!head.rows[0]) return null;
  return { ...toCustomerRow(head.rows[0]), addresses: addresses.rows.map(row => ({ id: text(row.id), title: text(row.title), recipient: text(row.recipient), phone: text(row.phone),
    city: text(row.city), district: text(row.district), line: text(row.line), postalCode: text(row.postal_code), isDefault: row.is_default === 1 })) };
}

const leadFilter = `($1 is null or l.status = $1)
  and ($2 is null or l.name like $2 escape '\\' or coalesce(l.email, '') like $2 escape '\\' or coalesce(l.phone, '') like $2 escape '\\' or l.message like $2 escape '\\')
  and ($3 is null or l.id = $3)`;
const toLead = (row: Row): AdminLead => ({ id: text(row.id), createdAt: text(row.created_at), name: text(row.name), email: textOrNull(row.email), phone: textOrNull(row.phone),
  message: text(row.message), source: text(row.source), status: text(row.status) as LeadStatus, note: textOrNull(row.note) });
export async function listLeads(input: ListQuery): Promise<{ rows: AdminLead[]; total: number }> {
  const params = [input.status, search(input.q), input.id];
  const [list, total] = await Promise.all([
    query<Row>(`select l.id, l.created_at, l.name, l.email, l.phone, l.message, l.source, l.status, l.note from leads l where ${leadFilter}
      order by l.created_at desc, l.id desc limit $4 offset $5`, [...params, adminListPageSize, offset(input.page)]),
    query<Row>(`select count(*) as count from leads l where ${leadFilter}`, params),
  ]);
  return { rows: list.rows.map(toLead), total: num(total.rows[0]?.count) };
}
export async function updateLead(patch: LeadPatch): Promise<boolean> {
  const result = await query(`update leads set status = case when $2 = 1 then $3 else status end, note = case when $4 = 1 then $5 else note end where id = $1`,
    [patch.id, patch.status !== undefined ? 1 : 0, patch.status ?? null, patch.note !== undefined ? 1 : 0, patch.note ?? null]);
  return result.rowCount > 0;
}
