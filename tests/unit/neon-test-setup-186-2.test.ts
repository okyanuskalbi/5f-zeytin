// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bindTestD1, createTestD1 } from "../helpers/d1-sqlite";

describe("local D1 test setup", () => {
  it("gives each test file a migrated in-memory database through the Cloudflare context", async () => {
    const db = (getCloudflareContext().env as { DB: ReturnType<typeof createTestD1> }).DB;
    const tables = (await db.prepare("select name from sqlite_master where type = 'table'").all<{ name: string }>()).results.map(row => row.name);
    expect(tables).toEqual(expect.arrayContaining(["user", "session", "products", "orders", "auth_account_limits"]));
  });
  it("starts every database empty and isolated from other bindings", async () => {
    const first = createTestD1();
    const second = createTestD1();
    await first.prepare("insert into products(id,name,category,weight,price_kurus) values('a','N','zeytinyagi','1',1)").run();
    expect((await second.prepare("select count(*) as n from products").all<{ n: number }>()).results[0].n).toBe(0);
    bindTestD1(first);
    expect((await (getCloudflareContext().env as { DB: typeof first }).DB.prepare("select count(*) as n from products").all<{ n: number }>()).results[0].n).toBe(1);
  });
  it("can remove the binding to simulate an unconfigured deployment", () => {
    bindTestD1(null);
    expect(() => getCloudflareContext()).toThrow();
    bindTestD1(createTestD1());
  });
});
