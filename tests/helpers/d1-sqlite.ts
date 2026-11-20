import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import path from "node:path";
import type { D1DatabaseLike, D1PreparedStatementLike, D1Result } from "@/lib/db/types";

const migrationsDirectory = path.resolve(process.cwd(), "db/d1") + path.sep;

class Statement implements D1PreparedStatementLike {
  constructor(readonly sqlite: DatabaseSync, readonly sql: string, readonly values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Statement(this.sqlite, this.sql, values); }
  execute<T>(): D1Result<T> {
    const prepared = this.sqlite.prepare(this.sql);
    // ?N yer tutucuları konum numarasıyla bağlanır; atlanan numaralar boş kalır (D1 ile aynı).
    const highest = Math.max(this.values.length, ...[...this.sql.matchAll(/\?(\d+)/g)].map(match => Number(match[1])));
    const positional = Array.from({ length: highest }, (_, index) => (this.values[index] ?? null) as SQLInputValue);
    if (prepared.columns().length > 0) return { results: prepared.all(...positional) as T[], success: true, meta: { changes: 0 } };
    const outcome = prepared.run(...positional);
    return { results: [], success: true, meta: { changes: Number(outcome.changes) } };
  }
  async all<T>() { return this.execute<T>(); }
  async run<T>() { return this.execute<T>(); }
}

export class SqliteD1 implements D1DatabaseLike {
  readonly sqlite = new DatabaseSync(":memory:");
  constructor() { this.sqlite.exec("PRAGMA foreign_keys = ON"); }
  prepare(sql: string) { return new Statement(this.sqlite, sql); }
  // Eşzamanlı çağrılar birbirinin işlemine girmesin diye toplu çağrı bölünmeden (await olmadan) çalışır; D1 de aynısını yapar.
  async batch<T>(statements: D1PreparedStatementLike[]) {
    this.sqlite.exec("BEGIN");
    try {
      const results: D1Result<T>[] = [];
      for (const statement of statements) results.push((statement as Statement).execute<T>());
      this.sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      this.sqlite.exec("ROLLBACK");
      throw error;
    }
  }
  async exec(sql: string) { this.sqlite.exec(sql); return {}; }
}

export function migrationFiles(): string[] {
  return readdirSync(migrationsDirectory).filter(name => name.endsWith(".sql")).sort();
}

/** db/d1 içindeki bütün göçleri sırayla uygulanmış, bellekte çalışan D1 uyumlu veritabanı. */
export function createTestD1(): SqliteD1 {
  const database = new SqliteD1();
  for (const file of migrationFiles()) database.sqlite.exec(readFileSync(migrationsDirectory + file, "utf8"));
  return database;
}

const contextSymbol = Symbol.for("__cloudflare-context__");

/** getCloudflareContext() çağrılarını bu veritabanına bağlar; null verilirse bağlama yokmuş gibi davranır. */
export function bindTestD1(database: D1DatabaseLike | null, extra: Record<string, unknown> = {}): void {
  const target = globalThis as Record<symbol, unknown>;
  if (!database) { delete target[contextSymbol]; return; }
  target[contextSymbol] = { env: { DB: database, ...extra }, ctx: { waitUntil() {}, passThroughOnException() {} }, cf: {} };
}
