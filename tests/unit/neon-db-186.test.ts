// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindTestD1, createTestD1 } from "../helpers/d1-sqlite";

vi.mock("server-only", () => ({}));
import { DbError, asBoolean, batch, getDb, isDatabaseConfigured, query, toD1Sql, toD1Value, toDbError } from "@/lib/db";

beforeEach(() => bindTestD1(createTestD1()));

describe("D1 data layer", () => {
  it("fails with a safe message when the D1 binding is absent", async () => {
    bindTestD1(null);
    expect(isDatabaseConfigured()).toBe(false);
    await expect(query("select 1")).rejects.toThrow();
  });
  it("reports a configured binding and returns the same database object", () => {
    expect(isDatabaseConfigured()).toBe(true);
    expect(getDb()).toBe(getDb());
  });
  it("turns $n placeholders into numbered D1 placeholders and keeps values out of the SQL text", async () => {
    expect(toD1Sql("select $1, $2, $1")).toBe("select ?1, ?2, ?1");
    const injected = "'; drop table products; --";
    const { rows } = await query<{ value: string }>("select $1 as value", [injected]);
    expect(rows).toEqual([{ value: injected }]);
    expect((await query("select count(*) as n from sqlite_master where name = 'products'")).rows[0].n).toBe(1);
  });
  it("converts booleans, dates, objects and undefined for D1", () => {
    expect(toD1Value(true)).toBe(1);
    expect(toD1Value(false)).toBe(0);
    expect(toD1Value(undefined)).toBeNull();
    expect(toD1Value(new Date("2026-11-19T10:00:00.000Z"))).toBe("2026-11-19T10:00:00.000Z");
    expect(toD1Value({ a: 1 })).toBe('{"a":1}');
    expect(asBoolean(1)).toBe(true);
    expect(asBoolean(0)).toBe(false);
    expect(asBoolean("x")).toBe("x");
  });
  it("reports row counts for writes and returning clauses", async () => {
    const created = await query("insert into products(id,name,category,weight,price_kurus) values($1,$2,$3,$4,$5)", ["p1", "Zeytin", "zeytinyagi", "1 L", 100]);
    expect(created.rowCount).toBe(1);
    const removed = await query("delete from products where id = $1 returning id", ["p1"]);
    expect(removed.rows).toEqual([{ id: "p1" }]);
    expect(removed.rowCount).toBe(1);
  });
  it("runs a batch atomically: one failing statement leaves nothing behind", async () => {
    const insert = (id: string) => ({ text: "insert into products(id,name,category,weight,price_kurus) values($1,'N','zeytinyagi','1 L',1)", values: [id] });
    await expect(batch([insert("a"), insert("a")])).rejects.toMatchObject({ code: "23505" });
    expect((await query("select count(*) as n from products")).rows[0].n).toBe(0);
    await batch([insert("a"), insert("b")]);
    expect((await query("select count(*) as n from products")).rows[0].n).toBe(2);
    expect(await batch([])).toEqual([]);
  });
  it("maps SQLite failures to the old SQLSTATE codes without leaking details", async () => {
    await expect(query("insert into products(id,name,category,weight,price_kurus) values('x','N','bad','1',1)")).rejects.toMatchObject({ code: "23514" });
    await expect(query("insert into admin_users(user_id) values('missing')")).rejects.toMatchObject({ code: "23503" });
    expect(toDbError(new Error("NOT NULL constraint failed: user.name")).code).toBe("23502");
    expect(toDbError(new Error("something else")).code).toBeNull();
    expect(toDbError(new Error("x"))).toBeInstanceOf(DbError);
  });
});
