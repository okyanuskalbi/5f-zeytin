// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createLocalSupabase } from "../helpers/supabase-local";
import { productInput } from "../fixtures/admin-products";
let db: PGlite;
beforeAll(async () => { db = await createLocalSupabase(); }, 30000);
afterAll(async () => { await db?.close(); });
const save = (id: string, value = productInput, create = true) => db.query("select public.admin_save_product($1, $2::jsonb, $3)", [id, JSON.stringify(value), create]);
it("saves product and upsells atomically, supports edits and the six-active limit", async () => {
  await db.exec("set role service_role");
  for (let i = 0; i < 6; i++) await save(`db-fixture-${i}`, { ...productInput, isActive: true });
  await expect(save("seventh", { ...productInput, isActive: true })).rejects.toThrow();
  await save("draft");
  await save("db-fixture-0", { ...productInput, isActive: true, priceKurus: 0, stock: 0, upsellIds: ["db-fixture-1"] }, false);
  expect((await db.query("select upsell_id from public.product_upsells")).rows).toEqual([{ upsell_id: "db-fixture-1" }]);
  await expect(save("db-fixture-0", { ...productInput, name: "must rollback", upsellIds: ["missing"] }, false)).rejects.toThrow();
  expect((await db.query("select name from public.products where id='db-fixture-0'")).rows).toEqual([{ name: productInput.name }]);
  await expect(save("db-fixture-0", { ...productInput, upsellIds: ["db-fixture-0"] }, false)).rejects.toThrow();
  await expect(save("missing", productInput, false)).rejects.toThrow();
  await db.query("select public.admin_unpublish_product($1)", ["db-fixture-1"]);
  expect((await db.query("select * from public.product_upsells")).rows).toEqual([]);
  await save("draft", { ...productInput, isActive: true }, false);
  expect((await db.query("select count(*)::int as n from public.products where is_active")).rows).toEqual([{ n: 6 }]);
});
it.each(["anon", "authenticated"])("blocks %s from both relation data and privileged functions", async role => {
  await db.exec(`reset role; set role ${role}`);
  await expect(db.query("select * from public.product_upsells")).rejects.toThrow(/permission denied/);
  await expect(save("forged")).rejects.toThrow(/permission denied/);
  await expect(db.query("select public.admin_unpublish_product('db-fixture-0')")).rejects.toThrow(/permission denied/);
});
