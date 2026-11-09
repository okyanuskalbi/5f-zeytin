import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";

const migrationsDirectory = new URL("../db/migrations/", import.meta.url);

/** Ordered, atomic migrations with drift checks and a connection-scoped lock. */
export async function migrate(pool, directory = migrationsDirectory) {
  const client = await pool.connect();
  let locked = false;
  const applied = [];
  try {
    await client.query("select pg_advisory_lock($1)", [186186]);
    locked = true;
    await client.query(`create table if not exists public.schema_migrations (
      name text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )`);
    await client.query("revoke all on public.schema_migrations from public");
    const history = await client.query("select name, checksum from public.schema_migrations order by name");
    const completed = new Map(history.rows.map(row => [row.name, row.checksum]));
    const names = (await readdir(directory)).filter(name => /^\d[\w-]*\.sql$/.test(name)).sort();
    for (const name of completed.keys()) {
      if (!names.includes(name)) throw new Error(`Migration file missing: ${name}`);
    }
    for (const name of names) {
      const sql = await readFile(new URL(name, directory), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      if (completed.has(name)) {
        if (completed.get(name) !== checksum) throw new Error(`Applied migration changed: ${name}`);
        continue;
      }
      if ([...completed.keys()].some(previous => previous > name)) {
        throw new Error(`Migration order changed: ${name}`);
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("insert into public.schema_migrations(name, checksum) values($1,$2)", [name, checksum]);
        await client.query("COMMIT");
        applied.push(name);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    return applied;
  } finally {
    try {
      if (locked) await client.query("select pg_advisory_unlock($1)", [186186]);
    } finally {
      client.release();
    }
  }
}

/** TEST_DATABASE_URL deliberately takes precedence and may only be loopback. */
export function migrationConnectionString(env = process.env) {
  if (env.TEST_DATABASE_URL) {
    const url = new URL(env.TEST_DATABASE_URL);
    if (!["postgres:", "postgresql:"].includes(url.protocol)
      || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      // pg accepts query-string host/port overrides; checking URL.hostname alone
      // could connect to a remote database despite an apparently local URL.
      || [...url.searchParams.keys()].some(key => !["application_name", "sslmode"].includes(key))
      || (url.searchParams.has("sslmode") && !["disable", "prefer", "require", "verify-ca", "verify-full", "no-verify"].includes(url.searchParams.get("sslmode")))) {
      throw new Error("TEST_DATABASE_URL must point to local PostgreSQL");
    }
    return env.TEST_DATABASE_URL;
  }
  const connectionString = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
  return connectionString;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let pool;
  try {
    pool = new Pool({ connectionString: migrationConnectionString(), max: 1, connectionTimeoutMillis: 10_000 });
    const applied = await migrate(pool);
    console.log(applied.length ? `Applied ${applied.length} migration(s): ${applied.join(", ")}` : "No pending migrations.");
  } catch {
    // Never print driver errors, which can contain credentials or connection URLs.
    console.error("Database migration failed. Check target, connectivity and migration history.");
    process.exitCode = 1;
  } finally {
    await pool?.end();
  }
}
