// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindTestD1, createTestD1 } from "../helpers/d1-sqlite";
import { query } from "@/lib/db";
import { GET as getOrders, PATCH as patchOrders } from "@/app/api/admin/orders/route";
import { GET as getCustomers } from "@/app/api/admin/customers/route";
import { GET as getLeads, PATCH as patchLeads } from "@/app/api/admin/leads/route";
import { POST as postContact } from "@/app/api/contact/route";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { AuthCoreError } from "@/lib/auth/server";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn(), requireAdminMutation: vi.fn() }));
vi.mock("@/lib/auth/server", async importOriginal => {
  const original = await importOriginal<typeof import("@/lib/auth/server")>();
  return { ...original, assertRequestOrigin: (request: Request) => {
    if (request.headers.get("origin") !== "https://shop.example.test") throw new original.AuthCoreError(403, "csrf_rejected");
  } };
});
const origin = "https://shop.example.test";
const get = (path: string) => new Request(`${origin}${path}`);
const send = (path: string, method: string, body?: unknown, headers: Record<string, string> = {}) => new Request(`${origin}${path}`, {
  method, headers: { origin, "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body),
});
const lead = { name: "Ali Veli", email: "ali@example.test", phone: "+90 555 000 00 00", message: "Toptan fiyat", source: "bayilik" };

beforeEach(async () => {
  bindTestD1(createTestD1());
  vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", email: "admin@example.test" });
  vi.mocked(requireAdminMutation).mockResolvedValue({ id: "admin", email: "admin@example.test" });
  await query(`insert into "user"(id,name,email) values ('u1','Ayşe','ayse@example.test')`);
  await query("insert into orders(id,user_id,order_no,status,total_kurus) values ('o1','u1','AZ-1','paid',1000)");
});

describe("admin panel endpoints", () => {
  it.each([401, 403, 503])("block every handler before database access when authorization fails (%s)", async status => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthCoreError(status, "forbidden"));
    vi.mocked(requireAdminMutation).mockRejectedValue(new AuthCoreError(status, "forbidden"));
    for (const response of [await getOrders(get("/api/admin/orders")), await getCustomers(get("/api/admin/customers")), await getLeads(get("/api/admin/leads")),
      await patchOrders(send("/api/admin/orders", "PATCH", { id: "o1", status: "shipped" })), await patchLeads(send("/api/admin/leads", "PATCH", { id: "x", status: "closed" }))]) {
      expect(response.status).toBe(status);
      expect(await response.text()).not.toContain("example.test");
    }
  });
  it("serves orders, a single order and customers with private no-store headers", async () => {
    const list = await getOrders(get("/api/admin/orders?status=paid"));
    expect(list.headers.get("cache-control")).toBe("private, no-store");
    expect(await list.json()).toMatchObject({ total: 1, page: 1, data: [{ orderNo: "AZ-1", customerEmail: "ayse@example.test" }] });
    expect((await (await getOrders(get("/api/admin/orders?id=o1"))).json()).data.items).toEqual([]);
    expect((await getOrders(get("/api/admin/orders?id=zzz"))).status).toBe(404);
    expect((await (await getCustomers(get("/api/admin/customers"))).json()).data[0]).toMatchObject({ email: "ayse@example.test", orderCount: 1 });
    expect((await getCustomers(get("/api/admin/customers?id=zzz"))).status).toBe(404);
  });
  it.each(["?page=0", "?page=1.5", "?status=bogus", "?q=" + "a".repeat(101), "?id=../x", "?id=a%20b"])("rejects unsafe queries %s", async search => {
    expect((await getOrders(get(`/api/admin/orders${search}`))).status).toBe(400);
    expect((await getLeads(get(`/api/admin/leads${search}`))).status).toBe(400);
  });
  it("treats SQL metacharacters in search as plain text", async () => {
    const response = await getOrders(get(`/api/admin/orders?q=${encodeURIComponent("' OR 1=1 --")}`));
    expect((await response.json()).total).toBe(0);
  });
  it("updates order status through the mutation guard and rejects mass assignment", async () => {
    expect((await patchOrders(send("/api/admin/orders", "PATCH", { id: "o1", status: "shipped", trackingNo: "TR1" }))).status).toBe(200);
    expect(requireAdminMutation).toHaveBeenCalledOnce();
    expect((await query<{ status: string; tracking_no: string; total_kurus: number }>("select status, tracking_no, total_kurus from orders where id = 'o1'")).rows[0])
      .toEqual({ status: "shipped", tracking_no: "TR1", total_kurus: 1000 });
    for (const body of [{ id: "o1", status: "paid" }, { id: "o1", status: "refunded" }, { id: "o1", status: "shipped", total_kurus: 1 }, { status: "shipped" }, { id: "o1" }]) {
      expect((await patchOrders(send("/api/admin/orders", "PATCH", body))).status).toBe(400);
    }
    expect((await patchOrders(send("/api/admin/orders", "PATCH", { id: "o1", status: "preparing" }))).status).toBe(409);
    expect((await patchOrders(send("/api/admin/orders", "PATCH", { id: "nope", status: "shipped" }))).status).toBe(404);
    expect((await patchOrders(new Request(`${origin}/api/admin/orders`, { method: "PATCH", headers: { origin, "content-type": "text/plain" }, body: "x" }))).status).toBe(415);
  });
  it("updates lead status and note only", async () => {
    await postContact(send("/api/contact", "POST", lead));
    const id = (await query<{ id: string }>("select id from leads")).rows[0].id;
    expect((await patchLeads(send("/api/admin/leads", "PATCH", { id, status: "contacted", note: "  Arandı " }))).status).toBe(200);
    expect((await query("select status, note from leads")).rows[0]).toEqual({ status: "contacted", note: "Arandı" });
    for (const body of [{ id, status: "weird" }, { id, name: "x" }, { id }, { id, note: "x".repeat(2001) }]) {
      expect((await patchLeads(send("/api/admin/leads", "PATCH", body))).status).toBe(400);
    }
    expect((await patchLeads(send("/api/admin/leads", "PATCH", { id: "missing", status: "closed" }))).status).toBe(404);
  });
});

describe("public contact endpoint", () => {
  it("records a lead and answers success without echoing personal data", async () => {
    const response = await postContact(send("/api/contact", "POST", lead));
    expect(response.status).toBe(201);
    expect(await response.text()).toBe('{"ok":true}');
    expect((await query("select name, email, phone, source, status from leads")).rows).toEqual([{ name: "Ali Veli", email: "ali@example.test", phone: "+90 555 000 00 00", source: "bayilik", status: "new" }]);
  });
  it("drops honeypot submissions silently and rejects invalid, foreign-origin and oversized requests", async () => {
    expect((await postContact(send("/api/contact", "POST", { ...lead, website: "http://spam.test" }))).status).toBe(201);
    expect((await query("select count(*) as n from leads")).rows[0]).toEqual({ n: 0 });
    for (const body of [{ ...lead, email: "bad", phone: "" }, { ...lead, name: "A" }, { name: "Ali Veli", message: "x" }, { ...lead, source: "other" }, { ...lead, role: "admin" }, { ...lead, message: "x".repeat(4001) }]) {
      expect((await postContact(send("/api/contact", "POST", body))).status).toBe(400);
    }
    expect((await postContact(send("/api/contact", "POST", lead, { origin: "https://evil.test" }))).status).toBe(403);
    expect((await postContact(send("/api/contact", "POST", { ...lead, message: "x".repeat(9000) }))).status).toBe(413);
    expect((await query("select count(*) as n from leads")).rows[0]).toEqual({ n: 0 });
  });
  it("rate limits repeated submissions from one address", async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 7; index++) statuses.push((await postContact(send("/api/contact", "POST", lead, { "cf-connecting-ip": "203.0.113.5" }))).status);
    expect(statuses).toEqual([201, 201, 201, 201, 201, 429, 429]);
    const blocked = await postContact(send("/api/contact", "POST", lead, { "cf-connecting-ip": "203.0.113.5" }));
    expect(blocked.headers.get("retry-after")).toBe("600");
    expect((await postContact(send("/api/contact", "POST", lead, { "cf-connecting-ip": "203.0.113.6" }))).status).toBe(201);
  });
  it("reports a generic failure when the database is unavailable", async () => {
    bindTestD1(null);
    const response = await postContact(send("/api/contact", "POST", lead));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("example.test");
  });
});
