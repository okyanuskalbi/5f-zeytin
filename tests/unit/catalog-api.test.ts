// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, dynamic } from "@/app/api/products/route";
import { readCatalog } from "@/lib/catalog/read";
import { getProducts } from "@/lib/catalog/static-products";
import * as staticCatalog from "@/lib/catalog/static-products";
import { parseCatalogProducts } from "@/lib/contracts/catalog";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("server-only", () => ({}));

const fetchMock = vi.fn<typeof fetch>();
const fixtureKey = "sb_publishable_task135_test_only";
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

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", fixtureKey);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "task135-service-must-never-be-used");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async () => Response.json([row]));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

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
  it("reads both category columns and carries them into the public API", async () => {
    fetchMock.mockResolvedValue(Response.json([{ ...row, category_label: "Kahvaltılık", show_category_label: false }]));
    expect((await (await GET()).json()).data[0]).toMatchObject({ categoryLabel: "Kahvaltılık", showCategoryLabel: false });
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("select")).toContain("category_label,show_category_label");
  });
  it("applies only matching database category settings to the landing's approved static products", async () => {
    const families = await getProductFamilies();
    const original = families.flatMap(family => family.variants);
    fetchMock.mockResolvedValue(Response.json([{ ...row, id: original[0].id, category_label: "Kahvaltılık", show_category_label: false }]));
    const home = await Home();
    expect(home.props.products).toEqual(original.map((item, index) => index === 0
      ? { ...item, categoryLabel: "Kahvaltılık", showCategoryLabel: false } : item));
    fetchMock.mockResolvedValue(Response.json([]));
    expect((await Home()).props.products).toEqual(original);
  });
  it("reads published products in slot order with a server-enforced six-product limit", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [product], source: "database" });
    const [url, options] = fetchMock.mock.calls[0];
    const query = new URL(String(url));
    expect(query.origin).toBe("http://127.0.0.1:54321");
    expect(query.pathname).toBe("/rest/v1/products");
    expect(query.searchParams.get("select")).toBe("id,name,category,category_label,show_category_label,weight,price_kurus,currency,stock,is_active");
    expect(query.searchParams.get("is_active")).toBe("eq.true");
    expect(query.searchParams.get("order")).toBe("active_slot.asc");
    expect(query.searchParams.get("limit")).toBe("6");
    expect(options?.method).toBe("GET");
    expect(new Headers(options?.headers).get("apikey") === fixtureKey).toBe(true);
    expect(new Headers(options?.headers).get("authorization") === `Bearer ${fixtureKey}`).toBe(true);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(dynamic).toBe("force-dynamic");
  });

  it("reads published products without a service key or server auth origin", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    vi.stubEnv("SITE_ORIGIN", undefined);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.supabase.co");
    expect(await readCatalog()).toEqual({ data: [product], source: "database" });
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("apikey")).toBe(fixtureKey);
  });

  it("never exposes internal columns or a service credential returned by an upstream", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([{ ...row, active_slot: 1,
      created_at: "2026-10-22", secret: fixtureKey }]));
    const response = await GET();
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ data: [product], source: "database" });
    expect(body.includes(fixtureKey)).toBe(false);
  });

  it("keeps an empty published catalog empty instead of resurrecting static products", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await readCatalog()).toEqual({ data: [], source: "database" });
  });

  it("returns six published products including zero stock and zero price", async () => {
    const rows = Array.from({ length: 6 }, (_, index) => ({ ...row,
      id: `fixture-${index}`, price_kurus: 0, stock: 0 }));
    fetchMock.mockResolvedValueOnce(Response.json(rows));
    const result = await readCatalog();
    expect(result.source).toBe("database");
    expect(result.data).toHaveLength(6);
    expect(result.data[0]).toEqual({ ...product, id: "fixture-0", priceKurus: 0, stock: 0 });
  });

  it.each(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"])("uses the existing static catalog when %s is missing", async variable => {
    vi.stubEnv(variable, undefined);
    const response = await GET();
    expect(await response.json()).toEqual({ data: parseCatalogProducts(await getProducts()), source: "static" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back without a network call when the configured URL is invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://user:password@example.invalid");
    expect((await readCatalog()).source).toBe("static");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([401, 403, 404, 500, 503])("falls back on upstream HTTP %s without leaking error details", async status => {
    fetchMock.mockResolvedValueOnce(Response.json({ message: fixtureKey, details: "private SQL" }, { status }));
    const response = await GET();
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(JSON.parse(body)).toEqual({ data: parseCatalogProducts(await getProducts()), source: "static" });
    expect(body.includes(fixtureKey)).toBe(false);
    expect(body).not.toContain("private SQL");
  });

  it("falls back on a rejected connection", async () => {
    fetchMock.mockRejectedValueOnce(new Error(fixtureKey));
    expect((await readCatalog()).source).toBe("static");
  });

  it("bounds the upstream read and falls back on cancellation", async () => {
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
    fetchMock.mockImplementationOnce(async (_url, options) => {
      expect(options?.signal).toBe(controller.signal);
      controller.abort();
      throw new DOMException("Test timeout", "AbortError");
    });
    expect((await readCatalog()).source).toBe("static");
    expect(timeout).toHaveBeenCalledWith(5000);
  });

  it.each([
    null, {}, [null], [{ ...row, is_active: false }], [{ ...row, currency: "USD" }],
    [{ ...row, price_kurus: "12500" }], [{ ...row, stock: -1 }],
    [{ ...row, category: "unknown" }], [row, row],
    Array.from({ length: 7 }, (_, index) => ({ ...row, id: `fixture-${index}` })),
  ])("uses the static fallback for malformed or unpublished upstream data (%#)", async data => {
    fetchMock.mockResolvedValueOnce(Response.json(data));
    expect(await readCatalog()).toEqual({ data: parseCatalogProducts(await getProducts()), source: "static" });
  });

  it("falls back on invalid JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("invalid JSON", { status: 200 }));
    expect((await readCatalog()).source).toBe("static");
  });

  it("refreshes price, stock and publication state on subsequent reads", async () => {
    expect((await readCatalog()).data).toEqual([product]);
    fetchMock.mockResolvedValueOnce(Response.json([{ ...row, price_kurus: 15000, stock: 0 }]));
    expect((await readCatalog()).data).toEqual([{ ...product, priceKurus: 15000, stock: 0 }]);
    fetchMock.mockResolvedValueOnce(Response.json([]));
    expect(await readCatalog()).toEqual({ data: [], source: "database" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries the database after a transient failure instead of caching the fallback", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ message: "unavailable" }, { status: 503 }));
    expect((await readCatalog()).source).toBe("static");
    expect(await readCatalog()).toEqual({ data: [product], source: "database" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not let caller mutations alter the static fallback", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    const result = await readCatalog();
    const originalPrice = result.data[0].priceKurus;
    Object.assign(result.data[0], { priceKurus: 1 });
    expect((await readCatalog()).data[0].priceKurus).toBe(originalPrice);
  });

  it("returns a sanitized uncached 503 if the fallback also fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    vi.spyOn(staticCatalog, "getProducts").mockRejectedValueOnce(new Error(fixtureKey));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: { code: "catalog_unavailable", message: "Ürünler şu anda yüklenemiyor. Yeniden deneyin." },
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("5");
  });

  it("rejects an invalid static fallback instead of returning invalid prices", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    const products = await getProducts();
    vi.spyOn(staticCatalog, "getProducts").mockResolvedValueOnce(products.map(item => ({ ...item, priceKurus: -1 })));
    expect((await GET()).status).toBe(503);
  });
});
