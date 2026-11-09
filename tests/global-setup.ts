import { Pool } from "pg";
import { localTestDatabaseUrl } from "./helpers/local-postgres";
// @ts-expect-error The standalone migration CLI intentionally has no generated declaration.
import { migrate } from "../scripts/db-migrate.mjs";

/** Test setup never uses DATABASE_URL or any remote deployment fallback. */
export default async function setup(): Promise<void> {
  if (!process.env.TEST_DATABASE_URL) {
    console.warn("[local-db] TEST_DATABASE_URL yok: yerel Postgres bütünleşik testleri atlanıyor; diğer testler çalışıyor.");
    return;
  }
  const connectionString = localTestDatabaseUrl();
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
  try {
    await migrate(pool);
  } catch {
    throw new Error("Local test database migration failed; check local connectivity and migration history.");
  } finally {
    await pool.end();
  }
}
