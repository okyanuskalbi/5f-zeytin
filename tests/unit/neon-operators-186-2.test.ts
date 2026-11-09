// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getProducts } from "@/lib/catalog/static-products";
// @ts-expect-error Standalone operator scripts do not have generated declarations.
import { loadStaticCatalog, seedCatalog, parseSeedArguments } from "../../scripts/db-seed.mjs";
// @ts-expect-error Standalone operator script does not have generated declarations.
import { grantAdmin, parseAdminArguments } from "../../scripts/admin-grant.mjs";
// @ts-expect-error Standalone operator helper does not have generated declarations.
import { operatorConnectionString } from "../../scripts/db-operator.mjs";
afterEach(()=>vi.restoreAllMocks());
const local="postgres://postgres@localhost:54329/afina_test";
describe("catalog and admin operator boundaries",()=>{
 it("uses the approved static catalog as its only product value source",async()=>{
  const products=await getProducts();const plan=await loadStaticCatalog();
  expect(plan.products.map((p:Record<string,unknown>)=>({id:p.id,name:p.name,category:p.category,weight:p.weight,priceKurus:p.price_kurus,stock:p.stock})))
   .toEqual(products.map(({id,name,category,weight,priceKurus,stock})=>({id,name,category,weight,priceKurus,stock})));
  expect(plan.products).toHaveLength(6);expect(plan.upsells).toEqual([]);
 });
 it("defaults to a dry plan and never opens a database connection",async()=>{
  const pool={connect:vi.fn()};const result=await seedCatalog(pool);
  expect(result.mode).toBe("dry-run");expect(result.products).toHaveLength(6);expect(pool.connect).not.toHaveBeenCalled();
 });
 it("rejects ambiguous arguments and unsafe connection targets before connecting",()=>{
  expect(parseSeedArguments([])).toEqual({apply:false});expect(parseSeedArguments(["--apply"])).toEqual({apply:true});
  expect(()=>parseSeedArguments(["--force"])).toThrow();expect(()=>parseSeedArguments(["--apply","--dry-run"])).toThrow();
  expect(parseAdminArguments(["--email"," A@Example.test "])).toBe("a@example.test");
  for(const args of [[],["--email","bad"],["--email","a@example.test","--force"]]) expect(()=>parseAdminArguments(args)).toThrow();
  expect(()=>operatorConnectionString({DATABASE_URL:local})).toThrow("DATABASE_URL_UNPOOLED");
  expect(operatorConnectionString({DATABASE_URL_UNPOOLED:local,TEST_DATABASE_URL:local})).toBe(local);
  for(const url of ["postgres://remote.example/db",local+"?host=remote.example"]) expect(()=>operatorConnectionString({DATABASE_URL_UNPOOLED:url,TEST_DATABASE_URL:local})).toThrow();
 });
 it("rejects unknown or ambiguous users without assigning any permission",async()=>{
  for(const rows of [[],[{id:"one"},{id:"two"}]]){
   const client={query:vi.fn(async(sql:string)=>({rows:sql.includes('SELECT id')?rows:[],rowCount:0})),release:vi.fn()};
   await expect(grantAdmin({connect:async()=>client},"nobody@example.test")).rejects.toThrow(rows.length?"ambiguous_user":"user_not_found");
   expect(client.query.mock.calls.some(([sql])=>sql.includes("INSERT INTO public.admin_users"))).toBe(false);
   expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");expect(client.release).toHaveBeenCalled();
  }
 });
 it("rolls back verification if assigning the admin row fails",async()=>{
  const client={query:vi.fn(async(sql:string)=>{if(sql.includes('SELECT id')) return {rows:[{id:"member"}],rowCount:1};if(sql.includes("INSERT INTO public.admin_users"))throw Error("private");return {rows:[],rowCount:1};}),release:vi.fn()};
  await expect(grantAdmin({connect:async()=>client},"a@example.test")).rejects.toThrow();
  expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");expect(client.release).toHaveBeenCalled();
 });
});
