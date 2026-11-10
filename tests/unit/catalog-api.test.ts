// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, dynamic } from "@/app/api/products/route";
import { readCatalog, readProductFamilies } from "@/lib/catalog/read";
import { getProducts } from "@/lib/catalog/static-products";
import * as staticCatalog from "@/lib/catalog/static-products";
import { parseCatalogProducts } from "@/lib/contracts/catalog";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("server-only", () => ({}));

const db = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/db", () => db);
const fixtureKey = "private-test-credential";
const product = {
  id: "fixture-green-1kg", name: "Test zeytin", category: "sofralik-zeytin",
  weight: "1 kg", priceKurus: 12500, stock: 3,
  categoryLabel: null, showCategoryLabel: true,
};
const row = {
  id: product.id, name: product.name, category: product.category, weight: product.weight,
  price_kurus: product.priceKurus, stock: product.stock, currency: "TRY", is_active: true,
  category_label: null, show_category_label: true,
};

beforeEach(() => { db.query.mockReset().mockResolvedValue({ rows: [row] }); });
afterEach(() => { vi.restoreAllMocks(); });

describe("public catalog contract", () => {
  it("preserves category settings in its public projection", () => {
    expect(parseCatalogProducts([{ ...product, categoryLabel: "Kahvaltılık", showCategoryLabel: false }]))
      .toEqual([{ ...product, categoryLabel: "Kahvaltılık", showCategoryLabel: false }]);
  });
  it("keeps old static records visible by default and rejects malformed category settings", () => {
    const legacy = { id: "static", name: "Test", category: "zeytinyagi", weight: "1 L", priceKurus: 1, stock: 0 };
    expect(parseCatalogProducts([legacy])).toEqual([{ ...legacy, categoryLabel: null, showCategoryLabel: true }]);
    for (const categoryLabel of ["a".repeat(41), "<b>Zeytin</b>", 1, [], {}]) {
      expect(parseCatalogProducts([{ ...product, categoryLabel }])).toBeNull();
    }
    expect(parseCatalogProducts([{ ...product, showCategoryLabel: "false" }])).toBeNull();
  });
  it("projects only public product fields without changing integer kuruş", () => {
    expect(parseCatalogProducts([{ ...product, service_key: fixtureKey, active_slot: 1 }]))
      .toEqual([product]);
    expect(parseCatalogProducts([])).toEqual([]);
  });

  it.each([
    null, {}, "[]", [null], [true], [{ ...product, id: " " }],
    [{ ...product, name: "" }], [{ ...product, weight: " " }],
    [{ ...product, category: "other" }], [{ ...product, priceKurus: "12500" }],
    [{ ...product, priceKurus: -1 }], [{ ...product, priceKurus: 1.5 }],
    [{ ...product, priceKurus: Infinity }], [{ ...product, priceKurus: 2147483648 }],
    [{ ...product, stock: -1 }], [{ ...product, stock: 0.5 }],
    [{ ...product, stock: NaN }], [{ ...product, stock: 2147483648 }],
    [product, product], Array.from({ length: 7 }, (_, index) => ({ ...product, id: `fixture-${index}` })),
  ])("rejects invalid products, duplicates and more than six records (%#)", input => {
    expect(parseCatalogProducts(input)).toBeNull();
  });

  it("accepts all schema categories, zero and PostgreSQL integer upper bounds", () => {
    for (const category of ["sofralik-zeytin", "salamura-zeytin", "zeytinyagi"]) {
      for (const amount of [0, 2147483647]) {
        const boundary = { ...product, category, priceKurus: amount, stock: amount };
        expect(parseCatalogProducts([boundary])).toEqual([boundary]);
      }
    }
  });
});

describe("server-only catalog read and products GET", () => {
  it("projects both category columns through the public API", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ ...row, category_label: "Kahvaltılık", show_category_label: false }] });
    expect((await (await GET()).json()).data[0]).toMatchObject({ categoryLabel: "Kahvaltılık", showCategoryLabel: false });
    expect(db.query.mock.calls[0][0]).toContain("category_label,show_category_label");
  });
  it("applies only matching database category settings to the landing's approved static products", async () => {
    const original = (await getProductFamilies()).flatMap(family => family.variants);
    db.query.mockResolvedValueOnce({ rows: [{ ...row, id: original[0].id, category_label: "Kahvaltılık", show_category_label: false }] });
    expect((await readProductFamilies()).flatMap(family => family.variants)).toEqual(original.map((item, index) => index === 0
      ? { ...item, categoryLabel: "Kahvaltılık", showCategoryLabel: false } : item));
    db.query.mockResolvedValueOnce({ rows: [] });
    expect((await readProductFamilies()).flatMap(family => family.variants)).toEqual(original);
  });
  it("enforces published products, slot order and six-product limit in SQL", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [product], source: "database" });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE is_active = $1 ORDER BY active_slot ASC LIMIT $2"), [true, 6]);
    const columns = db.query.mock.calls[0][0];
    expect(columns).toContain("category_label,show_category_label");
    expect(columns).not.toContain("SELECT *");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(dynamic).toBe("force-dynamic");
  });
  it("never exposes internal columns or database credentials", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ ...row, active_slot: 1, secret: fixtureKey }] });
    const body = await (await GET()).text();
    expect(JSON.parse(body)).toEqual({ data: [product], source: "database" });
    expect(body).not.toContain(fixtureKey);
  });
  it("keeps an empty published catalog empty", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    expect(await readCatalog()).toEqual({ data: [], source: "database" });
  });
  it("accepts six published products with zero stock and zero price", async () => {
    db.query.mockResolvedValueOnce({ rows: Array.from({ length: 6 }, (_, i) => ({ ...row, id: `fixture-${i}`, price_kurus: 0, stock: 0 })) });
    const result = await readCatalog();
    expect(result.source).toBe("database"); expect(result.data).toHaveLength(6);
    expect(result.data[0]).toMatchObject({ priceKurus: 0, stock: 0 });
  });
  it("sanitizes database failures and does not cache fallback", async () => {
    db.query.mockRejectedValueOnce(new Error(`private SQL ${fixtureKey}`));
    const response = await GET();
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ data: parseCatalogProducts(await getProducts()), source: "static" });
    expect(body).not.toContain(fixtureKey); expect(body).not.toContain("private SQL");
    expect(await readCatalog()).toEqual({ data: [product], source: "database" });
    expect(db.query).toHaveBeenCalledTimes(2);
  });
  it.each([
    null, {}, [null], [{ ...row, is_active: false }], [{ ...row, currency: "USD" }],
    [{ ...row, price_kurus: "12500" }], [{ ...row, stock: -1 }],
    [{ ...row, category: "unknown" }], [row, row],
    Array.from({ length: 7 }, (_, i) => ({ ...row, id: `fixture-${i}` })),
  ])("uses fallback for malformed or unpublished storage data (%#)", async rows => {
    db.query.mockResolvedValueOnce({ rows });
    expect(await readCatalog()).toEqual({ data: parseCatalogProducts(await getProducts()), source: "static" });
  });
  it("refreshes price, stock and publication state on every read", async () => {
    expect((await readCatalog()).data).toEqual([product]);
    db.query.mockResolvedValueOnce({ rows: [{ ...row, price_kurus: 15000, stock: 0 }] });
    expect((await readCatalog()).data).toEqual([{ ...product, priceKurus: 15000, stock: 0 }]);
    db.query.mockResolvedValueOnce({ rows: [] });
    expect(await readCatalog()).toEqual({ data: [], source: "database" });
  });
  it("does not let caller mutations alter static fallback", async () => {
    db.query.mockRejectedValue(new Error("unconfigured"));
    const result = await readCatalog(); const price = result.data[0].priceKurus;
    Object.assign(result.data[0], { priceKurus: 1 });
    expect((await readCatalog()).data[0].priceKurus).toBe(price);
  });
  it("returns a sanitized uncached 503 if fallback also fails", async () => {
    db.query.mockRejectedValue(new Error("unconfigured"));
    vi.spyOn(staticCatalog, "getProducts").mockRejectedValueOnce(new Error(fixtureKey));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: { code: "catalog_unavailable", message: "Ürünler şu anda yüklenemiyor. Yeniden deneyin." } });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("5");
  });
  it("rejects invalid static fallback prices", async () => {
    db.query.mockRejectedValue(new Error("unconfigured"));
    const products = await getProducts();
    vi.spyOn(staticCatalog, "getProducts").mockResolvedValueOnce(products.map(item => ({ ...item, priceKurus: -1 })));
    expect((await GET()).status).toBe(503);
  });
});


describe("restored catalog failure regressions (186-2)",()=>{
 it.each([Object.assign(new Error("private cancelled SQL"),{code:"57014"}),Object.assign(new Error("private refused connection"),{code:"ECONNREFUSED"}),new TypeError("private invalid storage response")])("sanitizes cancelled, refused and invalid reads then retries storage (%#)",async error=>{
  db.query.mockRejectedValueOnce(error);
  const response=await GET();expect(response.status).toBe(200);expect((await response.clone().json()).source).toBe("static");
  expect(await response.text()).not.toContain("private");expect((await readCatalog()).source).toBe("database");
 });
 it.each(["invalid rows",42,[true],[{}]])("falls back for malformed database output (%#)",async rows=>{
  db.query.mockResolvedValueOnce({rows});expect((await readCatalog()).source).toBe("static");
 });
});
