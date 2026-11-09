// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("plain PostgreSQL schema for Neon", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(await readFile(new URL("../../db/migrations/0001_initial.sql", import.meta.url), "utf8"));
  });
  afterAll(async () => { await db?.close(); });

  it("keeps legacy user UUIDs as text without provider-specific roles or schemas", async () => {
    await db.query('insert into "user" (id,name,email,"emailVerified","createdAt","updatedAt") values ($1,$2,$3,$4,now(),now())',
      ["bd76166a-1e28-40c0-9f5c-2793f401456a", "Local", "local@example.test", false]);
    const columns = await db.query<{data_type: string}>("select data_type from information_schema.columns where table_name='user' and column_name='id'");
    expect(columns.rows[0].data_type).toBe("text");
    const policies = await db.query("select * from pg_policies where schemaname='public'");
    expect(policies.rows).toEqual([]);
  });

  it("allows six active products and rejects a seventh while preserving hidden drafts", async () => {
    for (let n = 1; n <= 6; n++) {
      await db.query("insert into products(id,name,category,weight,price_kurus,is_active) values($1,$2,$3,$4,$5,$6)",
        [`p${n}`, `Product ${n}`, "zeytinyagi", "1L", 100, true]);
    }
    await expect(db.query("insert into products(id,name,category,weight,price_kurus,is_active) values('p7','Seventh','zeytinyagi','1L',100,true)"))
      .rejects.toThrow("At most six products can be active");
    await db.query("insert into products(id,name,category,weight,price_kurus) values('draft','Draft','zeytinyagi','1L',100)");
    await db.query("update products set is_active=false where id='p1'");
    await db.query("update products set is_active=true where id='draft'");
    expect((await db.query("select id from products where is_active")).rows).toHaveLength(6);
  });

  it("enforces business ownership references and one default address", async () => {
    await expect(db.query("insert into admin_users(user_id) values('missing')")).rejects.toThrow();
    await db.query("insert into admin_users(user_id) values($1)", ["bd76166a-1e28-40c0-9f5c-2793f401456a"]);
    await db.query(`insert into customer_addresses(user_id,title,recipient,phone,city,district,line,postal_code,is_default)
      values ($1,'Home','Local','5555555555','City','District','Line','12345',true)`, ["bd76166a-1e28-40c0-9f5c-2793f401456a"]);
    await expect(db.query(`insert into customer_addresses(user_id,title,recipient,phone,city,district,line,postal_code,is_default)
      values ($1,'Work','Local','5555555555','City','District','Line','12345',true)`, ["bd76166a-1e28-40c0-9f5c-2793f401456a"]))
      .rejects.toThrow();
  });
});
