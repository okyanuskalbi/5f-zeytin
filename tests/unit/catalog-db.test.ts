// @vitest-environment node
import { readFile } from "node:fs/promises";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLocalSupabase } from "../helpers/supabase-local";

describe("catalog migration on the approved memory-only PostgreSQL target", () => {
  let db: PGlite;

  beforeAll(async () => { db = await createLocalSupabase(); }, 30_000);
  afterAll(async () => { await db?.close(); });

  it("executes the SQL access, constraint and six-active-product acceptance suite", async () => {
    const sql = await readFile(new URL("../db/catalog.sql", import.meta.url), "utf8");
    const results = await db.exec(sql);
    const lines = results.flatMap(result => result.rows)
      .map(row => row.result).filter((line): line is string => typeof line === "string");
    const assertions = lines.slice(0, -1);
    expect(assertions.length).toBeGreaterThanOrEqual(50);
    assertions.forEach((line, index) => expect(line).toMatch(new RegExp(`^ok ${index + 1} - `)));
    expect(lines.at(-1)).toBe(`1..${assertions.length}`);
    // SQL fixtures and test functions are rolled back, never production seeds.
    expect((await db.query("select count(*)::int as count from public.products")).rows)
      .toEqual([{ count: 0 }]);
  });

  it("reapplies repository migrations to an independent empty database", async () => {
    const fresh = await createLocalSupabase();
    try {
      expect((await fresh.query("select count(*)::int as count from public.products")).rows)
        .toEqual([{ count: 0 }]);
      await fresh.exec("set role anon");
      expect((await fresh.query("select id from public.products")).rows).toEqual([]);
    } finally {
      await fresh.close();
    }
  }, 30_000);
});
