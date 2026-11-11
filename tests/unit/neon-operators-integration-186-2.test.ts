// @vitest-environment node
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { localTestDatabaseUrl } from "../helpers/local-postgres";
// @ts-expect-error Standalone operator CLI has no declaration file.
import { seedCatalog } from "../../scripts/db-seed.mjs";
// @ts-expect-error Standalone operator CLI has no declaration file.
import { grantAdmin } from "../../scripts/admin-grant.mjs";
let control: Pool | undefined, client: PoolClient | undefined;
let pool: { connect: () => Promise<{ query: (sql: string, values?: unknown[]) => ReturnType<PoolClient["query"]>; release: () => void }>; query: PoolClient["query"] };
const owner = `operator-${randomUUID()}`;
const email = `${owner}@example.test`;
let originalProducts: unknown;
describe.skipIf(!process.env.TEST_DATABASE_URL)("local Postgres seed/admin operators",()=>{
 beforeAll(async()=>{
  // Stay inside TEST_DATABASE_URL; no secondary database is created or opened.
  control = new Pool({ connectionString: localTestDatabaseUrl(), max: 1 });
  client = await control.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock($1)", [640064]);
  // Other suites own transient rows; only the six shared catalogue rows are stable across suites.
  originalProducts = (await client.query("SELECT * FROM public.products WHERE id LIKE $1 ORDER BY id", ["sample-%"])).rows;
  await client.query("DELETE FROM public.product_upsells");
  await client.query("DELETE FROM public.products");
  const nestedQuery = (sql: string, values?: unknown[]) => {
    const mapped = sql === "BEGIN" ? "SAVEPOINT operator_call" : sql === "COMMIT" ? "RELEASE SAVEPOINT operator_call" : sql === "ROLLBACK" ? "ROLLBACK TO SAVEPOINT operator_call" : sql;
    return client!.query(mapped, values);
  };
  pool = { connect: async () => ({ query: nestedQuery, release() {} }), query: client.query.bind(client) };
 });
 afterAll(async()=>{
  try {
    if(client) {
      await client.query("ROLLBACK");
      expect((await client.query("SELECT * FROM public.products WHERE id LIKE $1 ORDER BY id", ["sample-%"])).rows).toEqual(originalProducts);
      expect((await client.query("SELECT id FROM public.products WHERE id=$1", ["operator-extra"])).rowCount).toBe(0);
    }
  } finally { client?.release(); await control?.end(); }
 });
 it("keeps dry-run empty, seeds all products, and performs zero row updates on rerun",async()=>{
  const dry=await seedCatalog(pool);expect(dry.mode).toBe("dry-run");
  expect((await pool!.query("SELECT count(*)::int AS count FROM products")).rows[0].count).toBe(0);
  expect(await seedCatalog(pool,{apply:true})).toEqual({mode:"applied",productChanges:6,upsellChanges:0,products:6});
  const first=(await pool!.query("SELECT id,xmin::text AS version,active_slot,created_at FROM products ORDER BY id")).rows;
  expect(await seedCatalog(pool,{apply:true})).toEqual({mode:"applied",productChanges:0,upsellChanges:0,products:6});
  expect((await pool!.query("SELECT id,xmin::text AS version,active_slot,created_at FROM products ORDER BY id")).rows).toEqual(first);
  expect((await pool!.query("SELECT count(*)::int AS count FROM products WHERE is_active")).rows[0].count).toBe(6);
 });
 it("upserts changes without deleting unrelated records and preserves source label defaults",async()=>{
  await pool!.query("INSERT INTO products(id,name,category,weight,price_kurus) VALUES($1,$2,$3,$4,$5)",["operator-extra","Extra","zeytinyagi","1 L",100]);
  await pool!.query("UPDATE products SET name=$1 WHERE id=$2",["Changed","sample-green-olive-1kg"]);
  expect((await seedCatalog(pool,{apply:true})).productChanges).toBe(1);
  expect((await pool!.query("SELECT id FROM products WHERE id=$1",["operator-extra"])).rowCount).toBe(1);
  expect((await pool!.query("SELECT category_label,show_category_label FROM products WHERE id=$1",["sample-green-olive-1kg"])).rows[0]).toEqual({category_label:null,show_category_label:true});
 });
 it("grants only an existing account and verifies its email atomically without creating credentials",async()=>{
  await expect(grantAdmin(pool,"missing@example.test")).rejects.toThrow("user_not_found");
  expect((await pool!.query("SELECT user_id FROM admin_users WHERE user_id=$1", [owner])).rows).toEqual([]);
  await pool!.query('INSERT INTO "user"(id,name,email) VALUES($1,$2,$3)',[owner,"Owner",email.toUpperCase()]);
  expect(await grantAdmin(pool,` ${email} `)).toEqual({adminAdded:1,emailVerifiedChanged:1});
  const first=(await pool!.query('SELECT xmin::text AS version,"updatedAt" FROM "user" WHERE id=$1',[owner])).rows;
  expect(await grantAdmin(pool,email)).toEqual({adminAdded:0,emailVerifiedChanged:0});
  expect((await pool!.query('SELECT xmin::text AS version,"updatedAt" FROM "user" WHERE id=$1',[owner])).rows).toEqual(first);
  expect((await pool!.query('SELECT "emailVerified" FROM "user" WHERE id=$1',[owner])).rows[0].emailVerified).toBe(true);
  expect((await pool!.query('SELECT user_id FROM admin_users WHERE user_id=$1', [owner])).rows).toEqual([{user_id:owner}]);
  expect((await pool!.query('SELECT id FROM account WHERE "userId"=$1', [owner])).rows).toEqual([]);
 });
});
