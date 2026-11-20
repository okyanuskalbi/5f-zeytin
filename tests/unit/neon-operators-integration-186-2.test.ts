// @vitest-environment node
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
// @ts-expect-error Standalone operator CLI has no declaration file.
import { seedCatalog } from "../../scripts/db-seed.mjs";
// @ts-expect-error Standalone operator CLI has no declaration file.
import { grantAdmin } from "../../scripts/admin-grant.mjs";
import { createTestD1, type SqliteD1 } from "../helpers/d1-sqlite";
import { fakeExecute } from "../helpers/d1-execute";

let database: SqliteD1;
let run: ReturnType<typeof fakeExecute>;
const target = { remote: false };
const all = (sql: string, ...values: unknown[]) => database.sqlite.prepare(sql).all(...(values as never[])) as Record<string, unknown>[];
const owner = `operator-${randomUUID()}`;
const email = `${owner}@example.test`;
beforeEach(() => { database = createTestD1(); run = fakeExecute(database); });

describe("local D1 seed/admin operators", () => {
  it("keeps dry-run empty, seeds all products, and performs zero row updates on rerun", async () => {
    expect((await seedCatalog({ apply: false }, run)).mode).toBe("dry-run");
    expect(all("select count(*) as n from products")[0].n).toBe(0);
    expect(await seedCatalog({ apply: true, target }, run)).toEqual({ mode: "applied", productChanges: 6, upsellChanges: 0, products: 6, activeProducts: 6 });
    const first = all("select id,active_slot,created_at from products order by id");
    expect(await seedCatalog({ apply: true, target }, run)).toEqual({ mode: "applied", productChanges: 0, upsellChanges: 0, products: 6, activeProducts: 6 });
    expect(all("select id,active_slot,created_at from products order by id")).toEqual(first);
    expect(all("select count(*) as n from products where is_active = 1")[0].n).toBe(6);
    expect(first.map(row => row.active_slot).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it("upserts changes without removing unrelated records and preserves source label defaults", async () => {
    await seedCatalog({ apply: true, target }, run);
    const id = all("select id from products order by id limit 1")[0].id as string;
    database.sqlite.prepare("update products set is_active = 0 where id = ?").run(all("select id from products order by id desc limit 1")[0].id as string);
    database.sqlite.prepare("insert into products(id,name,category,weight,price_kurus) values('operator-extra','Extra','zeytinyagi','1 L',100)").run();
    database.sqlite.prepare("update products set name = 'Changed' where id = ?").run(id);
    expect((await seedCatalog({ apply: true, target }, run)).productChanges).toBe(2);
    expect(all("select id from products where id = 'operator-extra'")).toHaveLength(1);
    expect(all("select category_label,show_category_label from products where id = ?", id)[0]).toEqual({ category_label: null, show_category_label: 1 });
  });
  it("grants only an existing account and verifies its email without creating credentials", () => {
    expect(() => grantAdmin(target, "missing@example.test", run)).toThrow("user_not_found");
    expect(all("select user_id from admin_users")).toEqual([]);
    database.sqlite.prepare('insert into "user"(id,name,email) values(?,?,?)').run(owner, "Owner", email.toUpperCase());
    expect(grantAdmin(target, ` ${email} `, run)).toEqual({ adminAdded: 1, emailVerifiedChanged: 1 });
    const first = all('select "updatedAt" from "user" where id = ?', owner);
    expect(grantAdmin(target, email, run)).toEqual({ adminAdded: 0, emailVerifiedChanged: 0 });
    expect(all('select "updatedAt" from "user" where id = ?', owner)).toEqual(first);
    expect(all('select "emailVerified" from "user" where id = ?', owner)[0].emailVerified).toBe(1);
    expect(all("select user_id from admin_users")).toEqual([{ user_id: owner }]);
    expect(all('select id from account where "userId" = ?', owner)).toEqual([]);
  });
});
