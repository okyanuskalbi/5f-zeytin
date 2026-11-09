// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const database = vi.hoisted(() => ({
  query: vi.fn(), connect: vi.fn(), on: vi.fn(), end: vi.fn(), release: vi.fn(), attach: vi.fn(), construct: vi.fn(),
}));
vi.mock("@vercel/functions", () => ({ attachDatabasePool: database.attach }));
vi.mock("pg", () => ({ Pool: class {
  constructor(options: unknown) { database.construct(options); }
  query = database.query;
  connect = database.connect;
  on = database.on;
  end = database.end;
} }));
import { closePool, getPool, query, transaction } from "@/lib/db";

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgres://postgres@localhost:54329/afina_test");
  Object.values(database).forEach(mock => mock.mockReset());
  database.query.mockResolvedValue({ rows: [] });
  database.connect.mockResolvedValue({ query: database.query, release: database.release });
});
afterEach(async () => { await closePool(); vi.unstubAllEnvs(); });

describe("server PostgreSQL connection and transactions", () => {
  it("fails before constructing a pool when connection is absent", () => {
    vi.stubEnv("DATABASE_URL", undefined);
    expect(() => getPool()).toThrow("Veritabanı bağlantısı yapılandırılmamış.");
    expect(database.construct).not.toHaveBeenCalled();
  });
  it("creates a single small pool and attaches the Vercel lifecycle hook", () => {
    expect(getPool()).toBe(getPool());
    expect(database.construct).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ max: 2, idleTimeoutMillis: 5000 }));
    expect(database.attach).toHaveBeenCalledExactlyOnceWith(getPool());
  });
  it("passes values separately without changing parameter text", async () => {
    await query("select $1::text as value", ["'; drop table products; --"]);
    expect(database.query).toHaveBeenCalledExactlyOnceWith("select $1::text as value", ["'; drop table products; --"]);
  });
  it("uses one checked-out client, commits and releases after success", async () => {
    const value = await transaction(async client => {
      await client.query("select $1", ["local"]);
      return 42;
    });
    expect(value).toBe(42);
    expect(database.query.mock.calls).toEqual([["BEGIN"], ["select $1", ["local"]], ["COMMIT"]]);
    expect(database.connect).toHaveBeenCalledOnce();
    expect(database.release).toHaveBeenCalledExactlyOnceWith(undefined);
  });
  it("rolls back and releases when work fails, preserving the original error", async () => {
    const failure = new Error("local failure");
    await expect(transaction(async () => { throw failure; })).rejects.toBe(failure);
    expect(database.query.mock.calls).toEqual([["BEGIN"], ["ROLLBACK"]]);
    expect(database.release).toHaveBeenCalledExactlyOnceWith(undefined);
  });
  it("discards the connection when rollback fails", async () => {
    const failure = new Error("local failure");
    database.query.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(new Error("broken connection"));
    await expect(transaction(async () => { throw failure; })).rejects.toBe(failure);
    expect(database.release).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
  });
});
