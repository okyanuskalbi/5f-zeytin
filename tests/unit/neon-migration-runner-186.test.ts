// @vitest-environment node
import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
const files = vi.hoisted(() => ({ values: new Map<string,string>() }));
vi.mock("node:fs/promises", () => ({
  readdir: async () => [...files.values.keys()],
  readFile: async (file: URL) => files.values.get(file.pathname.split("/").at(-1)!) ?? "",
}));
// @ts-expect-error Standalone JavaScript migration utility has no declaration file.
import { migrate, migrationConnectionString } from "../../scripts/db-migrate.mjs";
const digest = (sql: string) => createHash("sha256").update(sql).digest("hex");
function fixture(history: Array<{name:string;checksum:string}> = []) {
  const rows = [...history];
  const client = {
    query: vi.fn(async (sql: string, values?: unknown[]) => {
      if (sql.startsWith("select name, checksum")) return {rows:[...rows]};
      if (sql.startsWith("insert into public.schema_migrations")) rows.push({name:String(values![0]),checksum:String(values![1])});
      return {rows:[]};
    }), release:vi.fn(),
  };
  return {client, pool:{connect:vi.fn(async()=>client)}, rows};
}
beforeEach(()=>{ files.values.clear();files.values.set("0001_initial.sql", "select 'first';"); });
describe("ordered PostgreSQL migration runner",()=>{
  it("applies once, records checksum, and performs no migration transaction on rerun",async()=>{
    const {pool,client,rows}=fixture();
    expect(await migrate(pool)).toEqual(["0001_initial.sql"]);
    expect(rows).toEqual([{name:"0001_initial.sql",checksum:digest("select 'first';")}]);
    client.query.mockClear();
    expect(await migrate(pool)).toEqual([]);
    expect(client.query.mock.calls.some(([sql])=>sql === "BEGIN")).toBe(false);
    expect(client.query).toHaveBeenLastCalledWith("select pg_advisory_unlock($1)",[186186]);
    expect(client.release).toHaveBeenCalledTimes(2);
  });
  it("fails closed on edited or missing applied files and releases its lock",async()=>{
    const {pool,client}=fixture([{name:"0001_initial.sql",checksum:digest("different") }]);
    await expect(migrate(pool)).rejects.toThrow("Applied migration changed");
    expect(client.query.mock.calls.some(([sql])=>sql === "BEGIN")).toBe(false);
    expect(client.release).toHaveBeenCalled();
    files.values.clear();
    await expect(migrate(pool)).rejects.toThrow("Migration file missing");
  });
  it("refuses backdated pending migrations instead of applying out of order",async()=>{
    files.values.set("0002_second.sql","select 'second';");
    const {pool,client}=fixture([{name:"0002_second.sql",checksum:digest("select 'second';")}]);
    await expect(migrate(pool)).rejects.toThrow("Migration order changed");
    expect(client.query.mock.calls.some(([sql])=>sql === "BEGIN")).toBe(false);
  });
  it("rolls back a failed migration without advancing history, then unlocks/releases",async()=>{
    const {pool,client,rows}=fixture();
    const actual=client.query.getMockImplementation()!;
    client.query.mockImplementation(async (sql,values)=>{
      if(sql === "select 'first';") throw new Error("Synthetic DDL failure");
      return actual(sql,values);
    });
    await expect(migrate(pool)).rejects.toThrow("Synthetic DDL failure");
    expect(rows).toEqual([]);
    expect(client.query.mock.calls.map(([sql])=>sql).slice(-2)).toEqual(["ROLLBACK","select pg_advisory_unlock($1)"]);
    expect(client.release).toHaveBeenCalled();
  });
  it("uses the unpooled deployment URL but gives a validated local test URL precedence",()=>{
    expect(migrationConnectionString({DATABASE_URL:"pooled",DATABASE_URL_UNPOOLED:"direct"})).toBe("direct");
    expect(migrationConnectionString({TEST_DATABASE_URL:"postgres://postgres@localhost:54329/afina_test",DATABASE_URL_UNPOOLED:"remote"})).toContain("localhost");
    for(const TEST_DATABASE_URL of ["postgres://remote.example.test/db","https://localhost/db","postgres://localhost/db?host=remote.example.test","postgres://localhost/db?hostaddr=203.0.113.1"])
      expect(()=>migrationConnectionString({TEST_DATABASE_URL})).toThrow();
  });
});
