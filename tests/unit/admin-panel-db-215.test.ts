// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindTestD1, createTestD1, migrationFiles } from "../helpers/d1-sqlite";
import { query } from "@/lib/db";
import { getCustomer, getOrder, getPanelCounts, listCustomers, listLeads, listOrders, updateLead, updateOrderStatus } from "@/lib/db/admin-panel";
import { consumeContactAttempt, contactRateLimit, createLead } from "@/lib/db/leads";
import { parseListQuery, orderStatuses, adminListPageSize } from "@/lib/contracts/admin-panel";
vi.mock("server-only", () => ({}));

const listQuery = (search = "") => parseListQuery(new URLSearchParams(search), orderStatuses)!;
async function seed() {
  await query(`insert into "user"(id,name,email,phone) values ('u1','Ayşe Yılmaz','ayse@example.test','+905551112233'),('u2','Mehmet Kaya','mehmet@example.test',null)`);
  await query(`insert into customer_addresses(id,user_id,title,recipient,phone,city,district,line,postal_code,is_default) values ('a1','u1','Ev','Ayşe Yılmaz','+905551112233','Osmaniye','Düziçi','Zeytin Sk. 1','80600',1)`);
  const address = JSON.stringify({ recipient: "Ayşe Yılmaz", line: "Zeytin Sk. 1", district: "Düziçi", city: "Osmaniye", postalCode: "80600", phone: "+905551112233" });
  for (const [id, user, no, status, total] of [["o1", "u1", "AZ-1001", "paid", 25000], ["o2", "u1", "AZ-1002", "pending", 10000], ["o3", "u2", "AZ-1003", "shipped", 5000]] as const) {
    await query("insert into orders(id,user_id,order_no,status,total_kurus,delivery_address,created_at) values ($1,$2,$3,$4,$5,$6,$7)", [id, user, no, status, total, address, `2026-11-0${id.slice(1)}T10:00:00.000Z`]);
  }
  await query("insert into order_items(id,order_id,product_name,weight,quantity,unit_price_kurus) values ('i1','o1','Yeşil zeytin','1 kg',2,12500)");
}
beforeEach(() => { bindTestD1(createTestD1()); });

describe("0002_panel migration", () => {
  it("is applied after 0001 and only adds leads and indexes", async () => {
    expect(migrationFiles()).toEqual(["0001_init.sql", "0002_panel.sql", "0003_discounts.sql", "0004_visits.sql"]);
    const tables = await query<{ name: string }>("select name from sqlite_master where type = 'table' and name = 'leads'");
    expect(tables.rows).toHaveLength(1);
  });
  it("enforces the leads status, contact and length constraints", async () => {
    await expect(query("insert into leads(name,email,status) values ('Ali','a@b.co','bogus')")).rejects.toMatchObject({ code: "23514" });
    await expect(query("insert into leads(name) values ('Ali')")).rejects.toMatchObject({ code: "23514" });
    await query("insert into leads(name,phone) values ('Ali','+905550000000')");
    expect((await query<{ status: string }>("select status from leads")).rows[0].status).toBe("new");
  });
});

describe("orders", () => {
  beforeEach(seed);
  it("lists newest first with customer, filters by status and escapes search wildcards", async () => {
    const all = await listOrders(listQuery());
    expect(all.total).toBe(3);
    expect(all.rows.map(row => row.orderNo)).toEqual(["AZ-1003", "AZ-1002", "AZ-1001"]);
    expect(all.rows[2]).toMatchObject({ customerName: "Ayşe Yılmaz", customerEmail: "ayse@example.test", itemCount: 1, totalKurus: 25000 });
    expect((await listOrders(listQuery("status=paid"))).rows.map(row => row.orderNo)).toEqual(["AZ-1001"]);
    expect((await listOrders(listQuery("q=mehmet"))).rows.map(row => row.orderNo)).toEqual(["AZ-1003"]);
    expect((await listOrders(listQuery("q=%25"))).total).toBe(0);
    expect((await listOrders(listQuery("q=_Z-100"))).total).toBe(0);
  });
  it("returns detail with items and parsed address, and null for an unknown id", async () => {
    const order = await getOrder("o1");
    expect(order?.items).toEqual([{ id: "i1", productName: "Yeşil zeytin", weight: "1 kg", quantity: 2, unitPriceKurus: 12500 }]);
    expect(order?.deliveryAddress).toMatchObject({ city: "Osmaniye", postalCode: "80600" });
    expect(await getOrder("none")).toBeNull();
  });
  it("applies only allowed transitions and keeps other columns untouched", async () => {
    expect(await updateOrderStatus({ id: "o1", status: "shipped", shippingCarrier: "Yurtiçi", trackingNo: "TR123" })).toBe("ok");
    expect(await getOrder("o1")).toMatchObject({ status: "shipped", shippingCarrier: "Yurtiçi", trackingNo: "TR123", totalKurus: 25000 });
    expect(await updateOrderStatus({ id: "o1", status: "preparing" })).toBe("conflict");
    expect(await updateOrderStatus({ id: "o2", status: "shipped" })).toBe("conflict");
    expect(await updateOrderStatus({ id: "o2", status: "cancelled" })).toBe("ok");
    expect(await updateOrderStatus({ id: "o3", status: "delivered" })).toBe("ok");
    expect(await updateOrderStatus({ id: "missing", status: "delivered" })).toBe("not_found");
  });
  it("paginates with a fixed page size", async () => {
    for (let index = 0; index < adminListPageSize + 2; index++) await query("insert into orders(user_id,order_no,total_kurus) values ('u2',$1,100)", [`BULK-${index}`]);
    const first = await listOrders(listQuery());
    const second = await listOrders(listQuery("page=2"));
    expect(first.rows).toHaveLength(adminListPageSize);
    expect(first.total).toBe(25);
    expect(second.rows).toHaveLength(5);
  });
});

describe("customers and counts", () => {
  beforeEach(seed);
  it("summarises orders (paid-like only) and addresses per customer", async () => {
    const { rows, total } = await listCustomers(parseListQuery(new URLSearchParams(), [])!);
    expect(total).toBe(2);
    expect(rows.find(row => row.id === "u1")).toMatchObject({ orderCount: 2, totalKurus: 25000, addressCount: 1, phone: "+905551112233" });
    expect(rows.find(row => row.id === "u2")).toMatchObject({ orderCount: 1, totalKurus: 5000, addressCount: 0 });
    expect((await listCustomers(parseListQuery(new URLSearchParams("q=ayse"), [])!)).rows.map(row => row.id)).toEqual(["u1"]);
  });
  it("returns addresses in detail and never exposes credentials", async () => {
    const detail = await getCustomer("u1");
    expect(detail?.addresses).toEqual([expect.objectContaining({ title: "Ev", isDefault: true, postalCode: "80600" })]);
    expect(JSON.stringify(detail)).not.toMatch(/password|token/i);
    expect(await getCustomer("none")).toBeNull();
  });
  it("counts products, orders, customers and new leads", async () => {
    await createLead({ name: "Ali", email: "ali@example.test", phone: null, message: "", source: "iletisim" });
    expect(await getPanelCounts()).toMatchObject({ orders: 3, customers: 2, newLeads: 1, awaitingPayment: 1, readyToShip: 1 });
  });
});

describe("leads", () => {
  it("stores, lists, filters and updates status and note", async () => {
    const id = await createLead({ name: "Ali Veli", email: "ali@example.test", phone: "+90 555 000 00 00", message: "Toptan fiyat", source: "bayilik" });
    await createLead({ name: "Zehra", email: null, phone: "+905550000001", message: "", source: "teklif" });
    expect((await listLeads(parseListQuery(new URLSearchParams(), ["new", "contacted", "closed"])!)).total).toBe(2);
    expect(await updateLead({ id, status: "contacted", note: "Arandı" })).toBe(true);
    const filtered = await listLeads(parseListQuery(new URLSearchParams("status=contacted"), ["new", "contacted", "closed"])!);
    expect(filtered.rows).toEqual([expect.objectContaining({ id, status: "contacted", note: "Arandı", source: "bayilik" })]);
    expect(await updateLead({ id, note: null })).toBe(true);
    expect((await listLeads(parseListQuery(new URLSearchParams(`id=${id}`), ["new", "contacted", "closed"])!)).rows[0]).toMatchObject({ status: "contacted", note: null });
    expect(await updateLead({ id: "missing", status: "closed" })).toBe(false);
  });
  it("rate limits contact attempts per address inside the window without storing the address", async () => {
    for (let index = 0; index < contactRateLimit.max; index++) expect(await consumeContactAttempt("203.0.113.9", 1000)).toBe(true);
    expect(await consumeContactAttempt("203.0.113.9", 2000)).toBe(false);
    expect(await consumeContactAttempt("203.0.113.10", 2000)).toBe(true);
    expect(await consumeContactAttempt("203.0.113.9", 1000 + contactRateLimit.windowMs + 1)).toBe(true);
    expect(JSON.stringify((await query("select key from \"rateLimit\"")).rows)).not.toContain("203.0.113");
  });
});
