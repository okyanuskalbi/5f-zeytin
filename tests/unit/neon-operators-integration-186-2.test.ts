// @vitest-environment node
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { localTestDatabaseUrl } from "../helpers/local-postgres";
// @ts-expect-error Standalone migration CLI has no declaration file.
import { migrate } from "../../scripts/db-migrate.mjs";
// @ts-expect-error Standalone operator CLI has no declaration file.
import { seedCatalog } from "../../scripts/db-seed.mjs";
// @ts-expect-error Standalone operator CLI has no declaration file.
import { grantAdmin } from "../../scripts/admin-grant.mjs";
let control:Pool|undefined,pool:Pool|undefined;
const name=`afina_ops_${randomUUID().replaceAll("-","")}`;
let created=false;
describe.skipIf(!process.env.TEST_DATABASE_URL)("local Postgres seed/admin operators",()=>{
 beforeAll(async()=>{
  const url=new URL(localTestDatabaseUrl());
  control=new Pool({connectionString:url.href,max:1});
  // The identifier is generated locally, never supplied by the user or SQL input.
  if(!/^afina_ops_[a-f0-9]{32}$/.test(name))throw Error("Invalid local database name");
  await control.query(`CREATE DATABASE "${name}"`);created=true;
  url.pathname=`/${name}`;pool=new Pool({connectionString:url.href,max:1});
  await migrate(pool);
 });
 afterAll(async()=>{
  await pool?.end();
  try{if(created)await control?.query(`DROP DATABASE "${name}"`);}finally{await control?.end();}
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
  expect((await pool!.query("SELECT user_id FROM admin_users")).rows).toEqual([]);
  await pool!.query('INSERT INTO "user"(id,name,email) VALUES($1,$2,$3)',["operator-owner","Owner","OWNER@example.test"]);
  expect(await grantAdmin(pool," owner@example.test ")).toEqual({adminAdded:1,emailVerifiedChanged:1});
  const first=(await pool!.query('SELECT xmin::text AS version,"updatedAt" FROM "user" WHERE id=$1',["operator-owner"])).rows;
  expect(await grantAdmin(pool,"owner@example.test")).toEqual({adminAdded:0,emailVerifiedChanged:0});
  expect((await pool!.query('SELECT xmin::text AS version,"updatedAt" FROM "user" WHERE id=$1',["operator-owner"])).rows).toEqual(first);
  expect((await pool!.query('SELECT "emailVerified" FROM "user" WHERE id=$1',["operator-owner"])).rows[0].emailVerified).toBe(true);
  expect((await pool!.query('SELECT user_id FROM admin_users')).rows).toEqual([{user_id:"operator-owner"}]);
  expect((await pool!.query('SELECT id FROM account')).rows).toEqual([]);
 });
});
