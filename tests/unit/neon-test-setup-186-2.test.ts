// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ migrate: vi.fn(), end: vi.fn(), pool: vi.fn() }));
vi.mock("pg", () => ({ Pool: class { constructor(options: unknown) { mocks.pool(options); } end = mocks.end; } }));
vi.mock("../../scripts/db-migrate.mjs", () => ({ migrate: mocks.migrate }));
import setup from "../global-setup";
beforeEach(() => { vi.clearAllMocks(); mocks.migrate.mockResolvedValue([]); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("local database global setup", () => {
  it("explicitly reports skipped integrations without touching any fallback database", async () => {
    vi.stubEnv("TEST_DATABASE_URL", ""); vi.stubEnv("DATABASE_URL", "postgres://remote.example.test/never");
    const message = vi.spyOn(console, "warn").mockImplementation(() => {});
    await setup();
    expect(message).toHaveBeenCalledWith(expect.stringContaining("TEST_DATABASE_URL"));
    expect(mocks.pool).not.toHaveBeenCalled();
  });
  it("migrates the validated local target before suites begin and closes the pool", async () => {
    vi.stubEnv("TEST_DATABASE_URL", "postgres://postgres@localhost:54329/local_test");
    await setup();
    expect(mocks.pool).toHaveBeenCalledWith(expect.objectContaining({ connectionString: process.env.TEST_DATABASE_URL, max: 1 }));
    expect(mocks.migrate).toHaveBeenCalledOnce(); expect(mocks.end).toHaveBeenCalledOnce();
  });
  it("refuses remote connection overrides before creating a pool", async () => {
    vi.stubEnv("TEST_DATABASE_URL", "postgres://localhost/test?host=remote.example.test");
    await expect(setup()).rejects.toThrow(); expect(mocks.pool).not.toHaveBeenCalled();
  });
  it("fails the test run safely if migration fails and still closes the connection", async () => {
    vi.stubEnv("TEST_DATABASE_URL", "postgres://localhost/local_test");
    mocks.migrate.mockRejectedValueOnce(new Error("private connection detail"));
    await expect(setup()).rejects.toThrow("Local test database migration failed");
    expect(mocks.end).toHaveBeenCalledOnce();
  });
});
