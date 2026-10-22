import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const repositoryMigrations = fileURLToPath(new URL("../../supabase/migrations/", import.meta.url));

/** Test-only Supabase role/auth shim. Each call creates a fresh, memory-only DB. */
export async function createLocalSupabase(migrationsDirectory = repositoryMigrations): Promise<PGlite> {
  const db = await PGlite.create("memory://");
  try {
    await db.exec(`
      create role anon nologin nosuperuser nobypassrls;
      create role authenticated nologin nosuperuser nobypassrls;
      create role service_role nologin nosuperuser bypassrls;

      revoke all on schema public from public;
      grant usage on schema public to anon, authenticated, service_role;
      create schema auth;
      -- Minimal Auth identity relation for application migration foreign keys.
      create table auth.users (id uuid primary key);
      revoke all on schema auth from public;
      grant usage on schema auth to anon, authenticated, service_role;

      create function auth.uid() returns uuid language sql stable as $$
        select coalesce(
          nullif(current_setting('request.jwt.claim.sub', true), ''),
          nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
        )::uuid
      $$;
      revoke all on function auth.uid() from public;
      grant execute on function auth.uid() to anon, authenticated, service_role;
    `);

    const migrations = (await readdir(migrationsDirectory)).filter(name => name.endsWith(".sql")).sort();
    for (const name of migrations) {
      if (!/^\d{14}_[a-zA-Z0-9_-]+\.sql$/.test(name)) {
        throw new Error("Expected Supabase migration filename: YYYYMMDDHHMMSS_name.sql");
      }
      const sql = await readFile(resolve(migrationsDirectory, name), "utf8");
      await db.transaction(async transaction => { await transaction.exec(sql); });
    }
    return db;
  } catch (error) {
    await db.close();
    throw error;
  }
}
