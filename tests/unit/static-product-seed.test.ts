// @vitest-environment node
import { readFile, writeFile } from "node:fs/promises";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { getProductFamilies } from "@/lib/catalog/static-products";
import type { ProductFamily } from "@/types/catalog";
import { createLocalSupabase } from "../helpers/supabase-local";

const seedFile = new URL("../../supabase/snippets/seed-static-products.sql", import.meta.url);
const readSeed = () => readFile(seedFile, "utf8");
const sqlText = (value: string) => `'${value.replaceAll("'", "''")}'`;

// Regenerate explicitly: UPDATE_STATIC_PRODUCT_SEED=1 npm test -- tests/unit/static-product-seed.test.ts --maxWorkers=2
function generateSeed(families: readonly ProductFamily[]): string {
  const rows = families.flatMap(family => family.variants.map(product => ({ product, label: family.name })))
    .map(({ product, label }, index) => `  (${[
      sqlText(product.id), sqlText(product.name), sqlText(product.category), sqlText(product.weight),
      product.priceKurus, product.stock, "true", index + 1, sqlText(label),
    ].join(", ")})`);

  return `-- Task 143: operational snippet, NOT a migration or automatic seed.
-- Generated from lib/catalog/static-products.ts; regenerate with:
-- UPDATE_STATIC_PRODUCT_SEED=1 npm test -- tests/unit/static-product-seed.test.ts --maxWorkers=2
-- Existing IDs (including admin edits and unpublished rows) remain unchanged.
-- An occupied active_slot for a missing ID raises products_active_slot_unique;
-- the transaction prevents partial inserts. Resolve the conflict before retrying.
begin;

insert into public.products (
  id, name, category, weight, price_kurus, stock, is_active, active_slot, category_label
)
values
${rows.join(",\n")}
on conflict (id) do nothing;

commit;
`;
}

let db: PGlite;
beforeAll(async () => { db = await createLocalSupabase(); }, 30000);
beforeEach(async () => { await db.exec("set role service_role; delete from public.products"); });
afterAll(async () => { await db?.close(); });

it("keeps the checked-in SQL identical to the current static catalog", async () => {
  const sql = generateSeed(await getProductFamilies());
  if (process.env.UPDATE_STATIC_PRODUCT_SEED === "1") await writeFile(seedFile, sql);
  expect(await readSeed()).toBe(sql);
});

it("seeds the six exact variants in static order and is unchanged on a second run", async () => {
  const expected = (await getProductFamilies()).flatMap(family => family.variants.map(product => ({
    id: product.id, name: product.name, category: product.category, weight: product.weight,
    price_kurus: product.priceKurus, stock: product.stock, currency: "TRY", is_active: true,
    category_label: family.name, show_category_label: true,
  }))).map((product, index) => ({ ...product, active_slot: index + 1 }));
  expect(expected).toHaveLength(6);

  const sql = await readSeed();
  await db.exec(sql);
  const first = (await db.query<(typeof expected)[number] & { created_at: Date }>(
    "select * from public.products order by active_slot")).rows;
  expect(first).toHaveLength(6);
  expect(first.map(({ created_at, ...product }) => {
    expect(created_at).toBeDefined();
    return product;
  })).toEqual(expected);

  await db.exec(sql);
  expect((await db.query("select * from public.products order by active_slot")).rows).toEqual(first);
});

it("preserves existing admin edits and does not reactivate an unpublished variant", async () => {
  const sql = await readSeed();
  await db.exec(sql);
  const [product] = (await getProductFamilies())[0].variants;
  await db.query(`update public.products set name = 'Admin ürünü', category = 'zeytinyagi',
    weight = 'Özel ambalaj', price_kurus = 12345, stock = 2, is_active = false,
    category_label = 'Özel seri', show_category_label = false where id = $1`, [product.id]);
  const before = (await db.query("select * from public.products order by id")).rows;

  await db.exec(sql);
  expect((await db.query("select * from public.products order by id")).rows).toEqual(before);
});

it.each([6, 1])("fails explicitly and rolls back with %i different active products occupying the last slots", async count => {
  for (let slot = 7 - count; slot <= 6; slot++) {
    await db.query(`insert into public.products
      (id, name, category, weight, price_kurus, stock, is_active, active_slot)
      values ($1, 'Mevcut ürün', 'sofralik-zeytin', '1 kg', 100, 1, true, $2)`, [`existing-${slot}`, slot]);
  }
  const before = (await db.query("select * from public.products order by id")).rows;

  await expect(db.exec(await readSeed())).rejects.toMatchObject({
    code: "23505", constraint: "products_active_slot_unique",
  });
  // The failed explicit transaction must be rolled back by the caller before retrying.
  await expect(db.query("select * from public.products")).rejects.toMatchObject({ code: "25P02" });
  await db.exec("rollback");
  expect((await db.query("select * from public.products order by id")).rows).toEqual(before);
});
