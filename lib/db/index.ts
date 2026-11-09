import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

let pool: Pool | undefined;

/** Lazily initialize: importing a server module must not open a connection at build time. */
export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Veritabanı bağlantısı yapılandırılmamış.");
  pool = new Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 5_000,
    allowExitOnIdle: true,
  });
  // Do not log the error object: driver errors may include connection details.
  pool.on("error", () => { console.error("Veritabanı bağlantısı kapandı."); });
  attachDatabasePool(pool);
  return pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, [...values]);
}

/** Every statement of a transaction runs on the same checked-out connection. */
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  let releaseError: Error | undefined;
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Discard a broken connection instead of returning it to the pool.
      releaseError = new Error("Transaction rollback failed");
    }
    throw error;
  } finally {
    client.release(releaseError);
  }
}

export async function closePool(): Promise<void> {
  const current = pool;
  pool = undefined;
  await current?.end();
}
