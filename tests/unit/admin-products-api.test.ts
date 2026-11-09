// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST, PATCH, DELETE } from "@/app/api/admin/products/route";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { AuthCoreError } from "@/lib/auth/server";
import { query } from "@/lib/db";
import { parseProductInput } from "@/lib/contracts/admin-products";
import { adminProduct, productInput, productRow } from "../fixtures/admin-products";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn(), requireAdminMutation: vi.fn() }));
vi.mock("@/lib/db", () => ({ query: vi.fn() }));
const origin = "https://shop.example.test";
const request = (method: string, body?: unknown, search = "") => new Request(`${origin}/api/admin/products${search}`, {
 method, headers: {origin, "content-type":"application/json"}, body: body === undefined ? undefined : JSON.stringify(body),
});
beforeEach(() => {
 vi.mocked(requireAdmin).mockResolvedValue({id:"admin",email:"admin@example.test"});
 vi.mocked(requireAdminMutation).mockResolvedValue({id:"admin",email:"admin@example.test"});
 vi.mocked(query).mockImplementation(async (sql: string) => ({ rows: sql.includes("count(*)") ? [{count:1}] : sql.includes("admin_") ? [{id:adminProduct.id}] : [productRow] }) as never);
});
afterEach(() => vi.resetAllMocks());
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

describe("Postgres admin endpoint", () => {
 it.each([401,403,503])("blocks every read/write before DB access (%s)", async status => {
  vi.mocked(requireAdmin).mockRejectedValue(new AuthCoreError(status,"forbidden"));
  vi.mocked(requireAdminMutation).mockRejectedValue(new AuthCoreError(status,"forbidden"));
  expect((await GET(request("GET"))).status).toBe(status);
  for(const handler of [POST,PATCH,DELETE]) expect((await handler(request("POST", productInput))).status).toBe(status);
  expect(query).not.toHaveBeenCalled();
 });
 it("projects rows and uses allowlisted server pagination", async () => {
  const response = await GET(request("GET",undefined,"?sort=priceKurus&direction=desc&page=2"));
  expect(response.status).toBe(200); expect((await response.json()).data).toEqual([adminProduct]);
  expect(query).toHaveBeenCalledWith(expect.stringContaining("price_kurus DESC"), [null,20,20]);
 });
 it.each(["?sort=password", "?direction=DROP", "?page=0", "?page=1.5"])("rejects unsafe queries %s",async search => {
  expect((await GET(request("GET",undefined,search))).status).toBe(400); expect(query).not.toHaveBeenCalled();
 });
 it.each([[POST,"POST",productInput,201],[PATCH,"PATCH",{id:adminProduct.id,...productInput},200],[DELETE,"DELETE",{id:adminProduct.id},200]] as const)("performs atomic parameterized mutation %#", async (handler,method,input,status) => {
  const response=await handler(request(method,input)); expect(response.status).toBe(status);
  expect(query).toHaveBeenCalledWith(expect.stringContaining(method === "DELETE" ? "admin_unpublish_product($1)" : "admin_save_product($1, $2::jsonb, $3)"),expect.any(Array));
  expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/");
 });
 it.each(["23514","23505","23503","P0002"])("sanitizes DB conflicts %s",async code=>{
  vi.mocked(query).mockRejectedValue({code,message:"private-db"}); const response=await POST(request("POST",productInput));
  expect(response.status).toBe(code === "P0002" ? 404 :409); expect(await response.text()).not.toContain("private-db");
 });
 it("does not resurrect static data on DB failure",async()=>{
  vi.mocked(query).mockRejectedValue(new Error("private-db")); const response=await GET(request("GET")); expect(response.status).toBe(503); expect(await response.text()).not.toContain("private-db");
 });
 it("validates content type, payload size and mass assignment", async()=>{
  expect((await POST(new Request(origin+"/api/admin/products",{method:"POST",body:"bad"}))).status).toBe(415);
  expect((await POST(request("POST",{...productInput,name:"x".repeat(17000)}))).status).toBe(413);
  expect((await POST(request("POST",{...productInput,active_slot:1}))).status).toBe(400);
  expect((await PATCH(request("PATCH",{id:"self",...productInput,upsellIds:["self"]}))).status).toBe(400);
  expect(query).not.toHaveBeenCalled();
 });
});


describe("restored administrator endpoint regressions (186-2)", () => {
 const mutations = [[POST,"POST",productInput],[PATCH,"PATCH",{id:adminProduct.id,...productInput}],[DELETE,"DELETE",{id:adminProduct.id}]] as const;
 it.each(mutations)("never invalidates the landing after a failed %s mutation", async (handler, method, input) => {
  for (const failure of [{code:"23514"},{code:"P0002"},new Error("private-sql")]) {
   vi.mocked(query).mockRejectedValueOnce(failure);
   expect((await handler(request(method,input))).status).toBeGreaterThanOrEqual(400);
  }
  expect(revalidatePath).not.toHaveBeenCalled();
 });
 it.each(mutations)("does not report success for an invalid %s database result",async(handler,method,input)=>{
  vi.mocked(query).mockResolvedValueOnce({rows:[{id:null}]} as never);
  expect((await handler(request(method,input))).status).toBe(503);
  expect(revalidatePath).not.toHaveBeenCalled();
 });
 it("projects category settings in reads and binds the same values in writes",async()=>{
  vi.mocked(query).mockImplementation(async(sql:string)=>({rows:sql.includes("count(*)")?[{count:1}]:[{...productRow,category_label:"Kahvaltılık",show_category_label:false}]}) as never);
  expect((await (await GET(request("GET"))).json()).data[0]).toMatchObject({categoryLabel:"Kahvaltılık",showCategoryLabel:false});
  vi.mocked(query).mockResolvedValueOnce({rows:[{id:adminProduct.id}]} as never);
  expect((await PATCH(request("PATCH",{id:adminProduct.id,...productInput,categoryLabel:"Kahvaltılık",showCategoryLabel:false}))).status).toBe(200);
  const args=vi.mocked(query).mock.calls.at(-1)?.[1];
  expect(JSON.parse(String(args?.[1]))).toMatchObject({categoryLabel:"Kahvaltılık",showCategoryLabel:false});
 });
 it("binds the exact ID when reading the created resource Location",async()=>{
  expect((await GET(request("GET",undefined,`?id=${adminProduct.id}`))).status).toBe(200);
  expect(query).toHaveBeenCalledWith(expect.stringContaining("p.id = $1"),[adminProduct.id,20,0]);
  vi.mocked(query).mockResolvedValueOnce({rows:[{id:adminProduct.id}]} as never);
  const created=await POST(request("POST",productInput));
  expect(created.status).toBe(201);expect(created.headers.get("location")).toBe(`/api/admin/products?id=${adminProduct.id}`);
 });
 it("keeps an empty administrator catalog empty with exact totals",async()=>{
  vi.mocked(query).mockImplementation(async(sql:string)=>({rows:sql.includes("count(*)")?[{count:0}]:[]}) as never);
  const response=await GET(request("GET"));expect(response.status).toBe(200);
  expect(await response.json()).toEqual({data:[],total:0,activeCount:0,page:1,options:[]});
 });
 it.each([{...productRow,currency:"USD"},{...productRow,product_upsells:[{upsell_id:productRow.id}]},{...productRow,stock:-1}])("rejects malformed storage rows without falling back to static data (%#)",async row=>{
  vi.mocked(query).mockImplementation(async(sql:string)=>({rows:sql.includes("count(*)")?[{count:1}]:[row]}) as never);
  expect((await GET(request("GET"))).status).toBe(503);
 });
 it.each([-1,7,NaN])("refuses an invalid active product count %s",async count=>{
  vi.mocked(query).mockResolvedValueOnce({rows:[productRow]} as never).mockResolvedValueOnce({rows:[{count:1}]} as never).mockResolvedValueOnce({rows:[{count}]} as never).mockResolvedValueOnce({rows:[productRow]} as never);
  expect((await GET(request("GET"))).status).toBe(503);
 });
});
