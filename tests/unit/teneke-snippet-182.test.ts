// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("updates only the two weights, preserves commerce fields, and is repeatable", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create table products (id text primary key, weight text, price_kurus integer, stock integer);
      insert into products values ('sample-green-olive-10kg', 'old', 220000, 6),
      ('sample-brined-green-olive-5kg', 'old', 110000, 8), ('other', '1 L', 35000, 8);`);
    const sql = await readFile("supabase/snippets/teneke-3lt.sql", "utf8");
    expect(sql).toMatch(/begin;/i);
    expect(sql).toMatch(/commit;/i);
    await db.exec(sql);
    await db.exec(sql);
    expect((await db.query("select * from products order by id")).rows).toEqual([
      { id: "other", weight: "1 L", price_kurus: 35000, stock: 8 },
      { id: "sample-brined-green-olive-5kg", weight: "3 L", price_kurus: 110000, stock: 8 },
      { id: "sample-green-olive-10kg", weight: "3 L", price_kurus: 220000, stock: 6 },
    ]);
  } finally { await db.close(); }
});
