// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindTestD1, createTestD1 } from "../helpers/d1-sqlite";
import { query } from "@/lib/db";
import { computeDiscountKurus, istanbulInputToIso, isoToIstanbulInput, kurusToTl, normalizeDiscountCode, parseCartLines, parseDiscountCreate, parseDiscountPatch,
  parseValidateRequest, tlToKurus } from "@/lib/contracts/discounts";
import { consumeDiscountAttempt, createDiscount, discountRateLimit, evaluateDiscount, getDiscountByCode, listDiscounts, redeemStatements, updateDiscount } from "@/lib/db/discounts";
import { createOrder, OrderError } from "@/lib/orders/create-order";
import { quoteDiscount } from "@/lib/orders/discount-quote";
import { parseListQuery } from "@/lib/contracts/admin-panel";
import { batch } from "@/lib/db";
import { POST as validate } from "@/app/api/discount/validate/route";
import { GET as adminGet, PATCH as adminPatch, POST as adminPost } from "@/app/api/admin/discounts/route";
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
const post = (path: string, body: unknown, headers: Record<string, string> = {}, method = "POST") => new Request(`${origin}${path}`, {
  method, headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body),
});
const now = Date.parse("2026-11-21T12:00:00.000Z");
const lines = [{ productId: "p1", quantity: 2 }]; // 2 x 22000 = 44000 kuruş
const base = { code: "ZEYTIN10", type: "percent" as const, value: 10, minSubtotalKurus: 0, startsAt: null, endsAt: null, maxUses: null, note: null, active: true };

beforeEach(async () => {
  bindTestD1(createTestD1());
  vi.mocked(requireAdmin).mockResolvedValue({ id: "admin", email: "admin@example.test" });
  vi.mocked(requireAdminMutation).mockResolvedValue({ id: "admin", email: "admin@example.test" });
  await query(`insert into "user"(id,name,email) values ('u1','Ayşe','ayse@example.test')`);
  await query("insert into products(id,name,category,weight,price_kurus,stock,is_active) values ('p1','Yeşil zeytin','sofralik-zeytin','1 kg',22000,10,1),('p2','Yağ','zeytinyagi','1 L',35000,1,1)");
});

describe("kod ve tutar hesabı", () => {
  it("normalizes case-insensitively and rejects bad characters", () => {
    expect(normalizeDiscountCode("  zeytin10 ")).toBe("ZEYTIN10");
    expect(normalizeDiscountCode("Zeytin-10_x")).toBe("ZEYTIN-10_X");
    for (const bad of ["ab", "a b c", "zeytın%", "x".repeat(33), 5, null, "ZEYT'; DROP"]) expect(normalizeDiscountCode(bad)).toBeNull();
  });
  it("rounds percent half-up in integer kuruş without float drift", () => {
    expect(computeDiscountKurus("percent", 15, 33333)).toBe(5000); // 4999,95
    expect(computeDiscountKurus("percent", 10, 2990)).toBe(299);
    expect(computeDiscountKurus("percent", 15, 1999)).toBe(300); // 299,85
    expect(computeDiscountKurus("percent", 50, 1)).toBe(1);
    expect(computeDiscountKurus("percent", 1, 49)).toBe(0);
    expect(computeDiscountKurus("percent", 100, 12345)).toBe(12345);
  });
  it("matches exact rational half-up for every small subtotal/percent and never exceeds the subtotal", () => {
    for (let subtotal = 1; subtotal <= 1500; subtotal++) {
      for (let value = 1; value <= 100; value++) {
        const exact = Number((BigInt(subtotal * value * 2 + 100) / BigInt(200)));
        const got = computeDiscountKurus("percent", value, subtotal);
        expect(got).toBe(exact);
        expect(got).toBeLessThanOrEqual(subtotal);
      }
    }
  });
  it("caps fixed discounts at the subtotal so the total never goes below zero", () => {
    expect(computeDiscountKurus("fixed", 5000, 3000)).toBe(3000);
    expect(computeDiscountKurus("fixed", 500, 3000)).toBe(500);
    expect(computeDiscountKurus("fixed", 500, 0)).toBe(0);
    expect(computeDiscountKurus("percent", 10, -5)).toBe(0);
  });
  it("converts TL text and Istanbul date inputs", () => {
    expect(tlToKurus("12,50")).toBe(1250); expect(tlToKurus("100")).toBe(10000); expect(tlToKurus("1,234")).toBeNull(); expect(tlToKurus("-1")).toBeNull();
    expect(kurusToTl(1250)).toBe("12,50"); expect(kurusToTl(10000)).toBe("100");
    expect(istanbulInputToIso("2026-11-21T15:00")).toBe("2026-11-21T12:00:00.000Z");
    expect(isoToIstanbulInput("2026-11-21T12:00:00.000Z")).toBe("2026-11-21T15:00");
    expect(istanbulInputToIso("")).toBeNull(); expect(istanbulInputToIso("bozuk")).toBeUndefined();
  });
});

describe("girdi doğrulama", () => {
  it("accepts only product id and quantity in the cart and rejects client-sent prices or totals", () => {
    expect(parseCartLines(lines)).toEqual(lines);
    for (const bad of [[], [{ productId: "p1", quantity: 0 }], [{ productId: "p1", quantity: 1.5 }], [{ productId: "p1", quantity: 1, priceKurus: 1 }],
      [{ productId: "p1", quantity: 1 }, { productId: "p1", quantity: 2 }], [{ productId: "a b", quantity: 1 }], "x"]) expect(parseCartLines(bad)).toBeNull();
    expect(parseValidateRequest({ code: "ab12", items: lines })).toEqual({ code: "AB12", items: lines });
    expect(parseValidateRequest({ code: "AB12", items: lines, totalKurus: 1 })).toBeNull();
    expect(parseValidateRequest({ code: "AB12", items: lines, discountKurus: 99999 })).toBeNull();
  });
  it("validates admin create and patch strictly", () => {
    expect(parseDiscountCreate({ code: "yaz-25", type: "fixed", value: 2500 })).toMatchObject({ code: "YAZ-25", minSubtotalKurus: 0, maxUses: null, active: true });
    for (const bad of [{ ...base, value: 101 }, { ...base, value: 0 }, { ...base, type: "x" }, { ...base, extra: 1 }, { ...base, maxUses: 0 }, { ...base, usedCount: 5 },
      { ...base, startsAt: "2026-12-01T00:00:00Z", endsAt: "2026-11-01T00:00:00Z" }, { ...base, startsAt: "yarın" }]) expect(parseDiscountCreate(bad)).toBeNull();
    expect(parseDiscountPatch({ id: "d1", active: false })).toEqual({ id: "d1", active: false });
    expect(parseDiscountPatch({ id: "d1", code: "YENI" })).toBeNull();
    expect(parseDiscountPatch({ id: "d1", usedCount: 0 })).toBeNull();
    expect(parseDiscountPatch({ id: "d1" })).toBeNull();
  });
});

describe("0003 göçü ve kodun uygunluğu", () => {
  it("enforces uppercase codes, ranges and the uses ceiling in the table itself", async () => {
    await expect(query("insert into discount_codes(code,type,value) values ('küçük','percent',10)")).rejects.toMatchObject({ code: "23514" });
    await expect(query("insert into discount_codes(code,type,value) values ('ABC','percent',101)")).rejects.toMatchObject({ code: "23514" });
    await expect(query("insert into discount_codes(code,type,value,max_uses,used_count) values ('ABC','fixed',100,1,2)")).rejects.toMatchObject({ code: "23514" });
    await query("insert into discount_codes(code,type,value) values ('ABC','fixed',100)");
    await expect(query("insert into discount_codes(code,type,value) values ('ABC','fixed',100)")).rejects.toMatchObject({ code: "23505" });
  });
  it("evaluates active, window, limit and minimum subtotal without telling them apart", async () => {
    await createDiscount({ ...base, startsAt: "2026-11-20T00:00:00.000Z", endsAt: "2026-11-22T00:00:00.000Z", maxUses: 2, minSubtotalKurus: 10000 });
    const code = (await getDiscountByCode("ZEYTIN10"))!;
    expect(evaluateDiscount(code, 44000, now)).toBe(4400);
    expect(evaluateDiscount(code, 9999, now)).toBeNull();
    expect(evaluateDiscount(code, 44000, Date.parse("2026-11-19T00:00:00Z"))).toBeNull();
    expect(evaluateDiscount(code, 44000, Date.parse("2026-11-22T00:00:00Z"))).toBeNull();
    expect(evaluateDiscount({ ...code, active: false }, 44000, now)).toBeNull();
    expect(evaluateDiscount({ ...code, usedCount: 2 }, 44000, now)).toBeNull();
    expect(evaluateDiscount(null, 44000, now)).toBeNull();
  });
  it("creates, rejects duplicates in any case, updates and never lowers the limit below usage", async () => {
    expect((await createDiscount(base)).status).toBe("ok");
    expect((await createDiscount({ ...base, code: "ZEYTIN10" })).status).toBe("duplicate");
    const row = (await getDiscountByCode("ZEYTIN10"))!;
    await createOrder({ userId: "u1", orderNo: "AZ-1", deliveryAddress: {}, items: lines, discountCode: "zeytin10", now });
    await createOrder({ userId: "u1", orderNo: "AZ-2", deliveryAddress: {}, items: lines, discountCode: "ZEYTIN10", now });
    expect((await updateDiscount({ id: row.id, maxUses: 1 })).status).toBe("limit_below_usage");
    expect((await updateDiscount({ id: row.id, maxUses: 2, active: false, value: 20 })).status).toBe("ok");
    expect(await getDiscountByCode("ZEYTIN10")).toMatchObject({ maxUses: 2, usedCount: 2, active: false, value: 20 });
    expect((await updateDiscount({ id: "yok", active: true })).status).toBe("not_found");
    const listed = await listDiscounts(parseListQuery(new URLSearchParams("status=passive"), ["active", "passive"])!);
    expect(listed.total).toBe(1);
  });
});

describe("sunucu tarafı fiyat ve teklif", () => {
  beforeEach(async () => { await createDiscount(base); });
  it("prices from the catalog, ignoring any client price, and returns the server discount", async () => {
    expect(await quoteDiscount("ZEYTIN10", lines, now)).toEqual({ ok: true, code: "ZEYTIN10", type: "percent", value: 10, subtotalKurus: 44000, discountKurus: 4400, totalKurus: 39600 });
  });
  it("answers invalid_code for unknown or unusable codes and cart_invalid for unknown products or over-stock", async () => {
    expect(await quoteDiscount("YOKBOYLE", lines, now)).toEqual({ ok: false, reason: "invalid_code" });
    expect(await quoteDiscount("ZEYTIN10", [{ productId: "p2", quantity: 5 }], now)).toEqual({ ok: false, reason: "cart_invalid" });
    expect(await quoteDiscount("ZEYTIN10", [{ productId: "yok", quantity: 1 }], now)).toEqual({ ok: false, reason: "cart_invalid" });
  });
  it("never lets the total drop below zero with a fixed discount larger than the cart", async () => {
    await createDiscount({ ...base, code: "DEVASA", type: "fixed", value: 99_000_000 });
    expect(await quoteDiscount("DEVASA", lines, now)).toMatchObject({ ok: true, discountKurus: 44000, totalKurus: 0 });
    const order = await createOrder({ userId: "u1", orderNo: "AZ-9", deliveryAddress: {}, items: lines, discountCode: "DEVASA", now });
    expect(order).toMatchObject({ discountKurus: 44000, totalKurus: 0 });
    expect((await query<{ total_kurus: number }>("select total_kurus from orders where order_no = 'AZ-9'")).rows[0].total_kurus).toBe(0);
  });
});

describe("sipariş ve atomik sayaç", () => {
  it("writes order, items, discount record and counter together; total = subtotal - discount", async () => {
    await createDiscount({ ...base, maxUses: 5 });
    const order = await createOrder({ userId: "u1", orderNo: "AZ-100", deliveryAddress: { city: "Osmaniye" }, items: [...lines, { productId: "p2", quantity: 1 }], discountCode: "zeytin10", now });
    expect(order).toMatchObject({ subtotalKurus: 79000, discountKurus: 7900, totalKurus: 71100 });
    expect((await query("select total_kurus from orders where order_no = 'AZ-100'")).rows[0]).toEqual({ total_kurus: 71100 });
    expect((await query("select count(*) as n from order_items where order_id = $1", [order.orderId])).rows[0]).toEqual({ n: 2 });
    expect((await query("select code, amount_kurus from order_discounts where order_id = $1", [order.orderId])).rows[0]).toEqual({ code: "ZEYTIN10", amount_kurus: 7900 });
    expect((await getDiscountByCode("ZEYTIN10"))!.usedCount).toBe(1);
  });
  it("orders without a code leave counters alone and ignore nothing else", async () => {
    await createDiscount(base);
    const order = await createOrder({ userId: "u1", orderNo: "AZ-101", deliveryAddress: {}, items: lines, now });
    expect(order).toMatchObject({ discountKurus: 0, totalKurus: 44000 });
    expect((await getDiscountByCode("ZEYTIN10"))!.usedCount).toBe(0);
    expect((await query("select count(*) as n from order_discounts")).rows[0]).toEqual({ n: 0 });
  });
  it("lets exactly one of two concurrent orders take the last use; the other gets invalid_code and nothing is written", async () => {
    await createDiscount({ ...base, maxUses: 1 });
    const attempt = (no: string) => createOrder({ userId: "u1", orderNo: no, deliveryAddress: {}, items: lines, discountCode: "ZEYTIN10", now });
    const results = await Promise.allSettled([attempt("AZ-201"), attempt("AZ-202")]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(result => result.status === "rejected") as PromiseRejectedResult;
    expect(rejected.reason).toBeInstanceOf(OrderError);
    expect(rejected.reason.code).toBe("invalid_code");
    expect((await getDiscountByCode("ZEYTIN10"))!.usedCount).toBe(1);
    expect((await query("select count(*) as n from orders")).rows[0]).toEqual({ n: 1 });
    expect((await query("select count(*) as n from order_discounts")).rows[0]).toEqual({ n: 1 });
  });
  it("never exceeds max_uses under many simultaneous orders", async () => {
    await createDiscount({ ...base, maxUses: 3 });
    const results = await Promise.allSettled(Array.from({ length: 8 }, (_, index) => createOrder({ userId: "u1", orderNo: `AZ-3${index}`, deliveryAddress: {}, items: lines, discountCode: "ZEYTIN10", now })));
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(3);
    expect((await getDiscountByCode("ZEYTIN10"))!.usedCount).toBe(3);
  });
  it("counts the same order only once: a duplicate order number rolls the counter back", async () => {
    await createDiscount({ ...base, maxUses: 5 });
    await createOrder({ userId: "u1", orderNo: "AZ-400", deliveryAddress: {}, items: lines, discountCode: "ZEYTIN10", now });
    await expect(createOrder({ userId: "u1", orderNo: "AZ-400", deliveryAddress: {}, items: lines, discountCode: "ZEYTIN10", now })).rejects.toMatchObject({ code: "order_exists" });
    expect((await getDiscountByCode("ZEYTIN10"))!.usedCount).toBe(1);
    await expect(query("insert into order_discounts(order_id,discount_code_id,code,amount_kurus) select order_id, discount_code_id, code, 1 from order_discounts")).rejects.toMatchObject({ code: "23505" });
  });
  it("rejects a code closed, expired or edited after the read but before the write (revalidated inside the batch)", async () => {
    await createDiscount({ ...base, maxUses: 5 });
    const stale = (await getDiscountByCode("ZEYTIN10"))!;
    await updateDiscount({ id: stale.id, value: 50 });
    await expect(batch(redeemStatements(stale, 44000, now))).rejects.toThrow(/guard:discount_unavailable/);
    await updateDiscount({ id: stale.id, value: 10, active: false });
    await expect(batch(redeemStatements(stale, 44000, now))).rejects.toThrow(/guard:discount_unavailable/);
    await updateDiscount({ id: stale.id, active: true, endsAt: "2026-11-21T11:00:00.000Z" });
    await expect(batch(redeemStatements({ ...stale, endsAt: null }, 44000, now))).rejects.toThrow(/guard:discount_unavailable/);
    expect((await getDiscountByCode("ZEYTIN10"))!.usedCount).toBe(0);
  });
  it("refuses an invalid or unknown code at order time with the generic error and writes no order", async () => {
    await expect(createOrder({ userId: "u1", orderNo: "AZ-500", deliveryAddress: {}, items: lines, discountCode: "YOKTUR", now })).rejects.toMatchObject({ code: "invalid_code" });
    await expect(createOrder({ userId: "u1", orderNo: "AZ-501", deliveryAddress: {}, items: [{ productId: "p2", quantity: 9 }], now })).rejects.toMatchObject({ code: "cart_invalid" });
    expect((await query("select count(*) as n from orders")).rows[0]).toEqual({ n: 0 });
  });
});

describe("herkese açık doğrulama ucu", () => {
  beforeEach(async () => { await createDiscount({ ...base, maxUses: 1 }); });
  it("returns the server-computed discount, case-insensitive, with the exact body the cart shows", async () => {
    const response = await validate(post("/api/discount/validate", { code: "zeytin10", items: lines }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { code: "ZEYTIN10", type: "percent", value: 10, subtotalKurus: 44000, discountKurus: 4400, totalKurus: 39600 } });
  });
  it("gives the same generic answer for unknown, closed, expired, exhausted and below-minimum codes", async () => {
    await createDiscount({ ...base, code: "KAPALI", active: false });
    await createDiscount({ ...base, code: "ESKI", endsAt: "2020-01-01T00:00:00.000Z" });
    await createDiscount({ ...base, code: "ALTSINIR", minSubtotalKurus: 99_000_000 });
    await createDiscount({ ...base, code: "DOLU", maxUses: 1 });
    await createOrder({ userId: "u1", orderNo: "AZ-600", deliveryAddress: {}, items: lines, discountCode: "DOLU" });
    const bodies = [];
    for (const [index, code] of ["YOKBOYLE", "KAPALI", "ESKI", "ALTSINIR", "DOLU"].entries()) {
      const response = await validate(post("/api/discount/validate", { code, items: lines }, { "cf-connecting-ip": `10.0.0.${index}` }));
      expect(response.status).toBe(422);
      bodies.push(await response.json());
    }
    for (const body of bodies) expect(body).toEqual({ error: { code: "invalid_code", message: "Kod geçersiz." } });
  });
  it("rejects client-supplied totals/discounts, foreign origins and bad bodies", async () => {
    expect((await validate(post("/api/discount/validate", { code: "ZEYTIN10", items: lines, discountKurus: 40000, totalKurus: 1 }))).status).toBe(400);
    expect((await validate(post("/api/discount/validate", { code: "ZEYTIN10", items: [{ productId: "p1", quantity: 2, priceKurus: 1 }] }))).status).toBe(400);
    expect((await validate(post("/api/discount/validate", { code: "ZEYTIN10", items: lines }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await validate(post("/api/discount/validate", { code: "x", items: lines }))).status).toBe(400);
  });
  it("tells the cart apart from the code: stale cart is 409 without revealing the code", async () => {
    const response = await validate(post("/api/discount/validate", { code: "ZEYTIN10", items: [{ productId: "p2", quantity: 99 }] }));
    expect(response.status).toBe(409);
  });
  it("rate-limits brute-force attempts per client and stays generic", async () => {
    const ip = { "cf-connecting-ip": "203.0.113.9" };
    for (let attempt = 0; attempt < discountRateLimit.perClient; attempt++) {
      expect((await validate(post("/api/discount/validate", { code: `DENEME${attempt}`, items: lines }, ip))).status).toBe(422);
    }
    const blocked = await validate(post("/api/discount/validate", { code: "ZEYTIN10", items: lines }, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBe("600");
    expect((await validate(post("/api/discount/validate", { code: "ZEYTIN10", items: lines }, { "cf-connecting-ip": "203.0.113.10" }))).status).toBe(200);
  });
  it("applies a site-wide ceiling and resets after the window", async () => {
    expect(await consumeDiscountAttempt("a", now)).toBe(true);
    for (let i = 0; i < discountRateLimit.perClient; i++) await consumeDiscountAttempt("a", now + i);
    expect(await consumeDiscountAttempt("a", now + 100)).toBe(false);
    expect(await consumeDiscountAttempt("a", now + discountRateLimit.windowMs + 1000)).toBe(true);
  });
});

describe("panel ucu /api/admin/discounts", () => {
  it.each([401, 403])("blocks every handler when authorization fails (%s)", async status => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthCoreError(status, "forbidden"));
    vi.mocked(requireAdminMutation).mockRejectedValue(new AuthCoreError(status, "forbidden"));
    expect((await adminGet(new Request(`${origin}/api/admin/discounts`))).status).toBe(status);
    expect((await adminPost(post("/api/admin/discounts", base))).status).toBe(status);
    expect((await adminPatch(post("/api/admin/discounts", { id: "x", active: false }, {}, "PATCH"))).status).toBe(status);
    expect((await query("select count(*) as n from discount_codes")).rows[0]).toEqual({ n: 0 });
  });
  it("creates, lists, edits and toggles; duplicates and limits map to short Turkish errors", async () => {
    const created = await adminPost(post("/api/admin/discounts", { ...base, code: "yaz25" }));
    expect(created.status).toBe(201);
    const { id } = await created.json();
    expect((await adminPost(post("/api/admin/discounts", { ...base, code: "YAZ25" }))).status).toBe(409);
    expect((await adminPost(post("/api/admin/discounts", { ...base, usedCount: 3 }))).status).toBe(400);
    const list = await (await adminGet(new Request(`${origin}/api/admin/discounts?page=1&status=active&q=yaz`))).json();
    expect(list).toMatchObject({ total: 1, page: 1, data: [{ code: "YAZ25", usedCount: 0, active: true }] });
    expect((await adminPatch(post("/api/admin/discounts", { id, active: false, value: 15 }, {}, "PATCH"))).status).toBe(200);
    expect(await getDiscountByCode("YAZ25")).toMatchObject({ active: false, value: 15 });
    expect((await adminPatch(post("/api/admin/discounts", { id: "yok", active: true }, {}, "PATCH"))).status).toBe(404);
    expect((await adminPatch(post("/api/admin/discounts", { id, code: "BASKA" }, {}, "PATCH"))).status).toBe(400);
    expect((await adminGet(new Request(`${origin}/api/admin/discounts?status=bogus`))).status).toBe(400);
  });
  it("uses parameters only: SQL metacharacters in search and code stay inert", async () => {
    await createDiscount(base);
    const list = await (await adminGet(new Request(`${origin}/api/admin/discounts?q=${encodeURIComponent("'; drop table discount_codes; --")}`))).json();
    expect(list.total).toBe(0);
    expect((await query("select count(*) as n from discount_codes")).rows[0]).toEqual({ n: 1 });
  });
});
