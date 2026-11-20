// @vitest-environment node
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error Standalone JavaScript migration utility has no declaration file.
import { listMigrations, migrateArguments } from "../../scripts/db-migrate.mjs";
// @ts-expect-error Standalone JavaScript helper has no declaration file.
import { executeArguments, parseTarget, sqlText } from "../../scripts/d1.mjs";
import { createTestD1, migrationFiles } from "../helpers/d1-sqlite";

describe("D1 migration runner", () => {
  it("lists the checked-in migrations in order", () => {
    expect(listMigrations()).toEqual(migrationFiles());
  });
  it("refuses a numbering gap", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "d1-gap-"));
    writeFileSync(path.join(directory, "0001_first.sql"), "select 1;");
    writeFileSync(path.join(directory, "0003_third.sql"), "select 1;");
    expect(() => listMigrations(new URL(`file://${directory}/`))).toThrow("gap");
  });
  it("applies cleanly to an empty database", () => {
    const database = createTestD1();
    expect(Number(database.sqlite.prepare("select count(*) as n from sqlite_master where type = 'table'").get()?.n)).toBeGreaterThan(10);
  });
  it("requires an explicit local or remote target and never picks one by default", () => {
    expect(() => migrateArguments([])).toThrow("exactly one");
    expect(() => migrateArguments(["--local", "--remote"])).toThrow("exactly one");
    expect(migrateArguments(["--local"])).toEqual(["wrangler", "d1", "migrations", "apply", "afina-zeytin", "--local"]);
    expect(migrateArguments(["--remote"]).at(-1)).toBe("--remote");
    expect(() => migrateArguments(["--local", "--force"])).toThrow();
  });
  it("builds execute arguments only for the afina-zeytin database", () => {
    expect(executeArguments(parseTarget(["--remote"]), { command: "select 1" })).toEqual(["wrangler", "d1", "execute", "afina-zeytin", "--remote", "--json", "--command", "select 1"]);
    expect(executeArguments(parseTarget(["--local"]), { file: "x.sql" })).toContain("x.sql");
  });
  it("quotes SQL text and rejects control characters", () => {
    expect(sqlText("O'Brien")).toBe("'O''Brien'");
    expect(() => sqlText("a\nb")).toThrow();
    expect(() => sqlText(1 as never)).toThrow();
  });
});
