// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST, PATCH, DELETE } from "@/app/api/admin/products/route";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { AuthCoreError } from "@/lib/auth/server";
import { parseProductInput } from "@/lib/contracts/admin-products";
import { adminProduct, productInput, productRow } from "../fixtures/admin-products";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn(), requireAdminMutation: vi.fn() }));
const fetchMock = vi.fn<typeof fetch>();
const origin = "https://shop.example.test";
const request = (method: string, body?: unknown, query = "") => new Request(`${origin}/api/admin/products${query}`, {
  method, headers: { origin, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body),
});
beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue({ id: "fixture-admin", email: "admin@example.test" });
  vi.mocked(requireAdminMutation).mockResolvedValue({ id: "fixture-admin", email: "admin@example.test" });
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_task135_test_only");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_task064_test_only_key");
  vi.stubEnv("SITE_ORIGIN", origin);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async (_url, init) => init?.method === "HEAD"
    ? new Response(null, { headers: { "content-range": "*/0" } })
    : Response.json([productRow], { headers: { "content-range": "0-0/1" } }));
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("strict admin product input", () => {
  it("normalizes category text and accepts a 40 character plain label or a blank default", () => {
    expect(parseProductInput({ ...productInput, categoryLabel: "  Kahvaltılık  ", showCategoryLabel: false }))
      .toEqual({ ...productInput, categoryLabel: "Kahvaltılık", showCategoryLabel: false });
    for (const categoryLabel of ["", "   ", null]) {
      expect(parseProductInput({ ...productInput, categoryLabel, showCategoryLabel: true }))
        .toEqual({ ...productInput, categoryLabel: null, showCategoryLabel: true });
    }
    expect(parseProductInput({ ...productInput, categoryLabel: "a".repeat(40), showCategoryLabel: true })).not.toBeNull();
  });
  it.each(["a".repeat(41), "<b>Zeytin</b>", "<script>alert(1)</script>", 1, [], {}])("rejects invalid category text (%s)", categoryLabel => {
    expect(parseProductInput({ ...productInput, categoryLabel, showCategoryLabel: true })).toBeNull();
  });
  it.each([null, "false", 0])("rejects non-boolean category visibility (%s)", showCategoryLabel => {
    expect(parseProductInput({ ...productInput, categoryLabel: null, showCategoryLabel })).toBeNull();
  });
  it("accepts only explicit catalog values, including zero and max integer", () => {
    expect(parseProductInput(productInput)).toEqual(productInput);
    expect(parseProductInput({ ...productInput, stock: 0, priceKurus: 2147483647 })).not.toBeNull();
  });
  it.each([null, [], {}, { ...productInput, image: "/unapproved.png" }, { ...productInput, active_slot: 1 },
    { ...productInput, name: " " }, { ...productInput, category: "other" }, { ...productInput, category: ["sofralik-zeytin"] }, { ...productInput, stock: -1 },
    { ...productInput, priceKurus: 1.5 }, { ...productInput, priceKurus: "1" },
    { ...productInput, stock: 2147483648 }, { ...productInput, isActive: "true" },
    { ...productInput, upsellIds: ["a", "a"] }, { ...productInput, upsellIds: [null] },
  ])("rejects malformed values and mass assignment (%#)", input => expect(parseProductInput(input)).toBeNull());
});

describe("admin products endpoint", () => {
  it("reads and writes category settings through the authorized endpoint", async () => {
    fetchMock.mockImplementation(async (_url, init) => init?.method === "HEAD"
      ? new Response(null, { headers: { "content-range": "*/0" } })
      : Response.json([{ ...productRow, category_label: "Kahvaltılık", show_category_label: false }], { headers: { "content-range": "0-0/1" } }));
    expect((await (await GET(request("GET"))).json()).data[0]).toMatchObject({ categoryLabel: "Kahvaltılık", showCategoryLabel: false });
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("select")).toContain("category_label,show_category_label");
    fetchMock.mockResolvedValue(Response.json("created-id"));
    expect((await POST(request("POST", { ...productInput, categoryLabel: "Kahvaltılık", showCategoryLabel: false }))).status).toBe(201);
    expect(JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body)).p_product)
      .toMatchObject({ categoryLabel: "Kahvaltılık", showCategoryLabel: false });
  });
  it.each([401, 403, 503])("never reads or writes without authorization (%i)", async status => {
    vi.mocked(requireAdmin).mockRejectedValue(new AuthCoreError(status, "forbidden"));
    vi.mocked(requireAdminMutation).mockRejectedValue(new AuthCoreError(status, "forbidden"));
    expect((await GET(request("GET"))).status).toBe(status);
    for (const handler of [POST, PATCH, DELETE]) expect((await handler(request("POST", productInput))).status).toBe(status);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("returns only projected database rows, exact pagination and no sample fallback", async () => {
    const response = await GET(request("GET"));
    expect(response.headers.get("cache-control")).toContain("no-store");
    const body = await response.json();
    expect(body.data).toEqual([adminProduct]); expect(body.total).toBe(1);
    expect(body.activeCount).toBe(0); expect(body.page).toBe(1);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("limit")).toBe("20");
    expect(url.searchParams.get("order")).toBe("name.asc,id.asc");
  });
  it("applies allowlisted sorting to the full server result", async () => {
    expect((await GET(request("GET", undefined, "?sort=priceKurus&direction=desc&page=2"))).status).toBe(200);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("order")).toBe("price_kurus.desc,id.asc");
    expect(url.searchParams.get("offset")).toBe("20");
  });
  it("supports the created resource Location with an exact server ID filter", async () => {
    expect((await GET(request("GET", undefined, `?id=${adminProduct.id}`))).status).toBe(200);
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("id")).toBe(`eq.${adminProduct.id}`);
  });
  it.each(["?sort=secret", "?page=0", "?page=1.5", "?direction=oops"]) ("rejects invalid queries (%s)", async query => {
    expect((await GET(request("GET", undefined, query))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("creates through a single atomic RPC after checking mutation authorization", async () => {
    fetchMock.mockResolvedValue(Response.json("created-id"));
    const req = request("POST", productInput);
    const response = await POST(req);
    expect(response.status).toBe(201); expect(requireAdminMutation).toHaveBeenCalledWith(req);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/rpc/admin_save_product");
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload.p_product).toEqual(productInput); expect(payload.p_create).toBe(true);
    expect(response.headers.get("location")).toContain("/api/admin/products");
  });
  it("updates without permitting ID changes and unpublishes without deleting records", async () => {
    fetchMock.mockImplementation(async () => Response.json(adminProduct.id));
    expect((await PATCH(request("PATCH", { id: adminProduct.id, ...productInput }))).status).toBe(200);
    expect((await DELETE(request("DELETE", { id: adminProduct.id }))).status).toBe(200);
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain("/rpc/admin_unpublish_product");
  });
  it.each(["23514", "23505", "23503", "P0002"]) ("maps database conflicts without leaking provider details (%s)", async code => {
    fetchMock.mockResolvedValue(Response.json({ code, message: "private-task064-test-only-key" }, { status: 400 }));
    const response = await POST(request("POST", productInput));
    expect(response.status).toBe(code === "P0002" ? 404 : 409);
    expect(await response.text()).not.toContain("private");
  });
  it("fails closed on DB failure instead of showing static catalog data", async () => {
    fetchMock.mockRejectedValue(new Error("private"));
    const response = await GET(request("GET")); expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private");
  });
  it("preserves the existing same-origin CSRF gate before touching the database", async () => {
    const actual = await vi.importActual<typeof import("@/lib/auth/admin")>("@/lib/auth/admin");
    vi.mocked(requireAdminMutation).mockImplementationOnce(actual.requireAdminMutation);
    const response = await POST(new Request(`${origin}/api/admin/products`, {
      method: "POST", headers: { origin: "https://other.example.test", "content-type": "application/json" }, body: JSON.stringify(productInput),
    }));
    expect(response.status).toBe(403); expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([null, [{ ...productRow, currency: "USD" }], [{ ...productRow, product_upsells: [{ upsell_id: productRow.id }] }]])("rejects invalid provider rows (%#)", async rows => {
    fetchMock.mockImplementation(async (_url, init) => init?.method === "HEAD"
      ? new Response(null, { headers: { "content-range": "*/0" } })
      : Response.json(rows, { headers: { "content-range": "0-0/1" } }));
    expect((await GET(request("GET"))).status).toBe(503);
  });
  it("keeps a genuine empty database result empty", async () => {
    fetchMock.mockImplementation(async (_url, init) => init?.method === "HEAD"
      ? new Response(null, { headers: { "content-range": "*/0" } })
      : Response.json([], { headers: { "content-range": "*/0" } }));
    const response = await GET(request("GET"));
    expect(await response.json()).toEqual({ data: [], total: 0, activeCount: 0, options: [], page: 1 });
  });
  it("rejects oversized, non-JSON, unknown fields and self upsell before any write", async () => {
    for (const body of [{ ...productInput, image: "candidate" }, { ...productInput, name: "x".repeat(17000) }]) {
      expect([400, 413]).toContain((await POST(request("POST", body))).status);
    }
    expect((await PATCH(request("PATCH", { id: "self", ...productInput, upsellIds: ["self"] }))).status).toBe(400);
    expect((await POST(new Request(`${origin}/api/admin/products`, { method: "POST", body: "bad" }))).status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
