// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createLocalSupabase } from "../helpers/supabase-local";
import { productInput } from "../fixtures/admin-products";

let db: PGlite;
beforeAll(async () => { db = await createLocalSupabase(); }, 30000);
afterAll(async () => { await db?.close(); });
const save = (id: string, fields: Record<string, unknown> = {}, create = true) => db.query(
  "select public.admin_save_product($1, $2::jsonb, $3)", [id, JSON.stringify({ ...productInput, ...fields }), create]);

it("defaults existing-style products to visible, writes and clears both label fields on edit", async () => {
  await db.exec("reset role; set role service_role");
  await save("category-default", { categoryLabel: undefined, showCategoryLabel: undefined });
  expect((await db.query("select category_label, show_category_label from public.products where id='category-default'")).rows)
    .toEqual([{ category_label: null, show_category_label: true }]);
  await db.exec("insert into public.products(id, name, category, weight, price_kurus) values ('category-direct', 'Test', 'sofralik-zeytin', '1 kg', 1)");
  expect((await db.query("select category_label, show_category_label from public.products where id='category-direct'")).rows)
    .toEqual([{ category_label: null, show_category_label: true }]);
  await save("category-custom", { categoryLabel: "  Kahvaltılık  ", showCategoryLabel: false });
  expect((await db.query("select category_label, show_category_label from public.products where id='category-custom'")).rows)
    .toEqual([{ category_label: "Kahvaltılık", show_category_label: false }]);
  await save("category-custom", { categoryLabel: " ", showCategoryLabel: true }, false);
  expect((await db.query("select category_label, show_category_label from public.products where id='category-custom'")).rows)
    .toEqual([{ category_label: null, show_category_label: true }]);
});

it("enforces length, plain text and boolean inputs without partial writes", async () => {
  await db.exec("reset role; set role service_role");
  await save("category-bounds", { categoryLabel: "a".repeat(40), showCategoryLabel: false });
  for (const categoryLabel of ["a".repeat(41), "<b>Zeytin</b>", 1, [], {}]) {
    await expect(save("category-bounds", { categoryLabel }, false)).rejects.toThrow();
  }
  for (const showCategoryLabel of [null, "false", 0]) {
    await expect(save("category-bounds", { showCategoryLabel }, false)).rejects.toThrow();
  }
  await expect(db.query("update public.products set category_label=$1 where id='category-bounds'", ["a".repeat(41)])).rejects.toThrow();
  expect((await db.query("select category_label, show_category_label from public.products where id='category-bounds'")).rows)
    .toEqual([{ category_label: "a".repeat(40), show_category_label: false }]);
});

it.each(["anon", "authenticated"])("allows %s to read published label columns only and denies writes/RPC", async role => {
  await db.exec("reset role; set role service_role");
  await save(`category-public-${role}`, { categoryLabel: "Kahvaltılık", showCategoryLabel: false, isActive: true });
  await db.exec(`reset role; set role ${role}`);
  const select = () => db.query("select category_label, show_category_label from public.products where id=$1", [`category-public-${role}`]);
  expect((await select()).rows).toEqual([{ category_label: "Kahvaltılık", show_category_label: false }]);
  expect((await db.query("select id from public.products where id='category-default'")).rows).toEqual([]);
  await expect(save("category-forged")).rejects.toThrow(/permission denied/);
  await expect(db.exec("insert into public.products(id, name, category, weight, price_kurus, category_label) values ('forged', 'Test', 'sofralik-zeytin', '1 kg', 1, 'forged')")).rejects.toThrow();
  // authenticated has CRUD grants, but no write policies: UPDATE affects zero rows.
  try { await db.exec("update public.products set category_label='forged', show_category_label=true"); }
  catch (error) { expect(String(error)).toContain("permission denied"); }
  expect((await select()).rows).toEqual([{ category_label: "Kahvaltılık", show_category_label: false }]);
});
