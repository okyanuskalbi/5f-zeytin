// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { createTestD1, migrationFiles, type SqliteD1 } from "../helpers/d1-sqlite";

const userId = "bd76166a-1e28-40c0-9f5c-2793f401456a";
describe("D1 (SQLite) schema", () => {
  let db: SqliteD1;
  const all = async (sql: string, ...values: unknown[]) => (await db.prepare(sql).bind(...values).all<Record<string, unknown>>()).results;
  beforeAll(async () => {
    db = createTestD1();
    await db.prepare('insert into "user" (id,name,email) values (?1,?2,?3)').bind(userId, "Local", "local@example.test").run();
  });

  it("ships ordered, gap-free migration files", () => {
    const names = migrationFiles();
    expect(names.length).toBeGreaterThan(0);
    names.forEach((name, index) => expect(name.startsWith(String(index + 1).padStart(4, "0"))).toBe(true));
  });

  it("keeps user ids as text and timestamps as UTC ISO text, with no provider roles", async () => {
    const types = await all("select name,type from pragma_table_info('user') where name in ('id','createdAt','emailVerified')");
    expect(Object.fromEntries(types.map(row => [row.name, row.type]))).toEqual({ id: "TEXT", createdAt: "TEXT", emailVerified: "INTEGER" });
    const stored = (await all('select "createdAt" as created from "user" where id = ?1', userId))[0].created as string;
    expect(stored).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("allows six active products, assigns the lowest free slot, and rejects a seventh while preserving hidden drafts", async () => {
    for (let n = 1; n <= 6; n++) {
      await db.prepare("insert into products(id,name,category,weight,price_kurus,is_active) values(?1,?2,?3,?4,?5,?6)").bind(`p${n}`, `Product ${n}`, "zeytinyagi", "1L", 100, 1).run();
    }
    expect((await all("select id,active_slot from products order by active_slot")).map(row => row.active_slot)).toEqual([1, 2, 3, 4, 5, 6]);
    await expect(db.prepare("insert into products(id,name,category,weight,price_kurus,is_active) values('p7','Seventh','zeytinyagi','1L',100,1)").run())
      .rejects.toThrow("At most six products can be active");
    expect(await all("select id from products where id = 'p7'")).toEqual([]);
    await db.prepare("insert into products(id,name,category,weight,price_kurus) values('draft','Draft','zeytinyagi','1L',100)").run();
    await db.prepare("update products set is_active=0 where id='p1'").run();
    expect((await all("select active_slot from products where id='p1'"))[0].active_slot).toBeNull();
    await db.prepare("update products set is_active=1 where id='draft'").run();
    expect((await all("select active_slot from products where id='draft'"))[0].active_slot).toBe(1);
    expect(await all("select id from products where is_active=1")).toHaveLength(6);
    await expect(db.prepare("update products set is_active=1 where id='p1'").run()).rejects.toThrow("At most six products can be active");
  });

  it("enforces product value rules", async () => {
    const bad = (sql: string) => expect(db.prepare(sql).run()).rejects.toThrow(/constraint failed/i);
    await bad("insert into products(id,name,category,weight,price_kurus) values('b1','N','zeytinyagi','1',-1)");
    await bad("insert into products(id,name,category,weight,price_kurus,currency) values('b2','N','zeytinyagi','1',1,'USD')");
    await bad("insert into products(id,name,category,weight,price_kurus,category_label) values('b3','N','zeytinyagi','1',1,'<b>x</b>')");
    await bad("insert into products(id,name,category,weight,price_kurus,category_label) values('b4','N','zeytinyagi','1',1,'" + "a".repeat(41) + "')");
    await bad("insert into products(id,name,category,weight,price_kurus) values('  ','N','zeytinyagi','1',1)");
  });

  it("enforces business ownership references and one default address", async () => {
    await expect(db.prepare("insert into admin_users(user_id) values('missing')").run()).rejects.toThrow();
    await db.prepare("insert into admin_users(user_id) values(?1)").bind(userId).run();
    const address = (title: string, postal = "12345", isDefault = 1) => db.prepare(`insert into customer_addresses(user_id,title,recipient,phone,city,district,line,postal_code,is_default)
      values (?1,?2,'Local','5555555555','City','District','Line',?3,?4)`).bind(userId, title, postal, isDefault).run();
    await address("Home");
    await expect(address("Work")).rejects.toThrow();
    await expect(address("Odd", "1234x", 0)).rejects.toThrow();
    await address("Second", "12345", 0);
    const generated = (await all("select id from customer_addresses"))[0].id as string;
    expect(generated).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("validates order numbers, statuses and JSON delivery addresses", async () => {
    const order = (no: string, status = "pending", address = "{}") => db.prepare("insert into orders(user_id,order_no,status,total_kurus,delivery_address) values(?1,?2,?3,100,?4)").bind(userId, no, status, address).run();
    await order("AF-1001");
    await expect(order("AF-1001")).rejects.toThrow();
    await expect(order("-bad")).rejects.toThrow();
    await expect(order("A!")).rejects.toThrow();
    await expect(order("AF-1002", "unknown")).rejects.toThrow();
    await expect(order("AF-1003", "paid", "[1]")).rejects.toThrow();
    await expect(order("AF-1004", "paid", "not json")).rejects.toThrow();
    await expect(db.prepare('delete from "user" where id = ?1').bind(userId).run()).rejects.toThrow();
  });
});
