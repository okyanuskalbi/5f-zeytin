// @vitest-environment node
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalSupabase } from "../helpers/supabase-local";
import { createSupabaseServiceClient } from "../../lib/supabase/server";

vi.mock("server-only", () => ({}));

const firstUser = "00000000-0000-4000-8000-000000000001";
const secondUser = "00000000-0000-4000-8000-000000000002";

describe("in-memory Supabase database", () => {
  let db: PGlite;
  let migrationDirectory: string;

  beforeAll(async () => {
    await mkdir(resolve(".cache"), { recursive: true });
    migrationDirectory = await mkdtemp(resolve(".cache/supabase-local-"));
    // Write out of order: the loader must use Supabase timestamp order.
    await writeFile(resolve(migrationDirectory, "20261022000002_seed.sql"), `
      insert into public.test_owned_rows (id, owner_id) values
        (1, '${firstUser}'), (2, '${secondUser}');
      insert into public.test_server_rows (id) values (1);
    `);
    await writeFile(resolve(migrationDirectory, "20261022000001_schema.sql"), `
      create table public.test_owned_rows (id integer primary key, owner_id uuid not null);
      alter table public.test_owned_rows enable row level security;
      grant select on public.test_owned_rows to anon;
      grant select, insert, update, delete on public.test_owned_rows to authenticated, service_role;
      create policy own_rows on public.test_owned_rows to authenticated
        using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

      create table public.test_server_rows (id integer primary key);
      alter table public.test_server_rows enable row level security;
      revoke all on public.test_server_rows from public, anon, authenticated;
      grant select, insert, update, delete on public.test_server_rows to service_role;
    `);
    db = await createLocalSupabase(migrationDirectory);
  }, 30_000);

  afterEach(async () => {
    await db.exec("reset role; reset request.jwt.claim.sub; reset request.jwt.claims;");
  });

  afterAll(async () => {
    await db?.close();
    if (migrationDirectory) await rm(migrationDirectory, { recursive: true, force: true });
  });

  it("applies SQL migrations in timestamp order", async () => {
    expect((await db.query("select id from public.test_owned_rows order by id")).rows)
      .toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("creates non-superuser roles; only service_role bypasses RLS", async () => {
    const result = await db.query(`
      select rolname, rolsuper, rolbypassrls, rolcanlogin from pg_roles
      where rolname in ('anon', 'authenticated', 'service_role') order by rolname
    `);
    expect(result.rows).toEqual([
      { rolname: "anon", rolsuper: false, rolbypassrls: false, rolcanlogin: false },
      { rolname: "authenticated", rolsuper: false, rolbypassrls: false, rolcanlogin: false },
      { rolname: "service_role", rolsuper: false, rolbypassrls: true, rolcanlogin: false },
    ]);
  });

  it("returns no identity for anon and enforces RLS despite SELECT grant", async () => {
    await db.exec("set role anon");
    expect((await db.query("select auth.uid() as uid")).rows).toEqual([{ uid: null }]);
    expect((await db.query("select * from public.test_owned_rows")).rows).toEqual([]);
    await expect(db.exec("insert into public.test_owned_rows values (3, gen_random_uuid())"))
      .rejects.toMatchObject({ code: "42501" });
  });

  it.each([firstUser, secondUser])("isolates authenticated rows for %s", async userId => {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId]);
    await db.exec("set role authenticated");
    expect((await db.query("select owner_id from public.test_owned_rows")).rows)
      .toEqual([{ owner_id: userId }]);
    await expect(db.query("insert into public.test_owned_rows values (3, $1)", [
      userId === firstUser ? secondUser : firstUser,
    ])).rejects.toMatchObject({ code: "42501" });
    expect((await db.query("update public.test_owned_rows set id = 99 where owner_id <> $1 returning id", [userId])).rows)
      .toEqual([]);
    expect((await db.query("delete from public.test_owned_rows where owner_id <> $1 returning id", [userId])).rows)
      .toEqual([]);
  });

  it("reads the subject from JWT claims as well", async () => {
    await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ sub: firstUser })]);
    await db.exec("set role authenticated");
    expect((await db.query("select auth.uid() as uid")).rows).toEqual([{ uid: firstUser }]);
  });

  it("denies authenticated access without a subject", async () => {
    await db.exec("set role authenticated");
    expect((await db.query("select * from public.test_owned_rows")).rows).toEqual([]);
  });

  it("permits own-row CRUD and rejects ownership changes", async () => {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [firstUser]);
    await db.exec("set role authenticated");
    await db.query("insert into public.test_owned_rows values (3, $1)", [firstUser]);
    await expect(db.query("update public.test_owned_rows set owner_id = $1 where id = 3", [secondUser]))
      .rejects.toMatchObject({ code: "42501" });
    await db.exec("update public.test_owned_rows set id = 4 where id = 3");
    expect((await db.query("delete from public.test_owned_rows where id = 4 returning id")).rows)
      .toEqual([{ id: 4 }]);
  });

  it.each(["anon", "authenticated"])("revokes server-only table access from %s", async role => {
    await db.exec(`set role ${role}`);
    await expect(db.exec("select * from public.test_server_rows")).rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("insert into public.test_server_rows values (2)")).rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("update public.test_server_rows set id = 2")).rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("delete from public.test_server_rows")).rejects.toMatchObject({ code: "42501" });
  });

  it("allows service_role CRUD and RLS bypass without an identity", async () => {
    await db.exec("set role service_role");
    expect((await db.query("select id from public.test_owned_rows order by id")).rows)
      .toEqual([{ id: 1 }, { id: 2 }]);
    await db.exec("insert into public.test_server_rows values (2); update public.test_server_rows set id = 3 where id = 2;");
    expect((await db.query("delete from public.test_server_rows where id = 3 returning id")).rows)
      .toEqual([{ id: 3 }]);
  });

  it("resets into a fresh database using the repository migrations", async () => {
    const fresh = await createLocalSupabase();
    try {
      expect((await fresh.query("select to_regclass('public.test_owned_rows') as relation")).rows)
        .toEqual([{ relation: null }]);
      await fresh.exec("set role anon");
      expect((await fresh.query("select auth.uid() as uid")).rows).toEqual([{ uid: null }]);
    } finally {
      await fresh.close();
    }
  }, 30_000);
});

describe("Supabase service client boundary", () => {
  const fetchMock = vi.fn<typeof fetch>();
  const fixtureKey = "test-only-service-credential";

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", fixtureKey);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-only-publishable-credential");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset().mockResolvedValue(Response.json([]));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])("requires %s without exposing credentials", variable => {
    vi.stubEnv(variable, "  ");
    expect(() => createSupabaseServiceClient()).toThrow(`Missing ${variable}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "invalid-url", "http://example.invalid", "ftp://example.invalid",
    "https://user:password@example.invalid", "https://example.invalid?secret=invalid",
    "https://example.invalid#invalid", "https://example.invalid/rest/v1",
  ])("rejects unsafe or malformed URL %s without reflecting its value", url => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    expect(() => createSupabaseServiceClient()).toThrow(/^Invalid NEXT_PUBLIC_SUPABASE_URL$/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lazily reads env and sends the service credential only in the server request", async () => {
    const client = createSupabaseServiceClient();
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await client.auth.getSession()).data.session).toBeNull();
    const result = await client.from("test_rows").select("id");
    expect(result.error).toBeNull();
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("http://127.0.0.1:54321/rest/v1/test_rows?select=id");
    expect(String(url).includes(fixtureKey)).toBe(false);
    const headers = new Headers(options?.headers);
    expect(headers.get("apikey") === fixtureKey).toBe(true);
    expect(headers.get("authorization") === `Bearer ${fixtureKey}`).toBe(true);
  });

  it("accepts HTTPS and does not require the publishable key for privileged requests", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://example.invalid/ ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
    expect(createSupabaseServiceClient()).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("enforces the real server-only package guard outside server conditions", () => {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", "import('./lib/supabase/server.ts')"], {
      cwd: process.cwd(), encoding: "utf8", env: { NODE_ENV: "test" },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("cannot be imported from a Client Component module");
    expect(result.stdout).toBe("");
  });
});
