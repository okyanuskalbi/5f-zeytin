import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1DatabaseLike, D1Result } from "./types";

export type { D1DatabaseLike } from "./types";
export type Row = Record<string, unknown>;
export interface QueryResult<T extends Row = Row> { rows: T[]; rowCount: number }
export interface SqlStatement { text: string; values?: readonly unknown[] }

/** Veritabanı hatalarına PostgreSQL ile aynı kodları verir; çağıranlar kod üzerinden karar verir. */
export class DbError extends Error {
  code: string | null;
  constructor(message: string, code: string | null) { super(message); this.name = "DbError"; this.code = code; }
}

/** SQLite/D1 hata metnini eski PostgreSQL SQLSTATE kodlarına eşler. */
export function toDbError(error: unknown): DbError {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const text = `${message} ${cause}`;
  const code = /UNIQUE constraint failed|PRIMARY KEY/i.test(text) ? "23505"
    : /FOREIGN KEY constraint failed/i.test(text) ? "23503"
    : /NOT NULL constraint failed/i.test(text) ? "23502"
    : /CHECK constraint failed|At most six products can be active/i.test(text) ? "23514"
    : null;
  const wrapped = new DbError(message, code);
  wrapped.cause = error;
  return wrapped;
}

/** D1 bağlaması: Workers'ta wrangler bağlaması, testlerde SQLite dolgusu (aynı bağlam sembolü). */
export function getDb(): D1DatabaseLike {
  const db = (getCloudflareContext().env as { DB?: D1DatabaseLike }).DB;
  if (!db) throw new Error("Veritabanı bağlantısı yapılandırılmamış.");
  return db;
}

export function isDatabaseConfigured(): boolean {
  try { getDb(); return true; } catch { return false; }
}

/** `$1` yer tutucularını D1'in numaralı `?1` biçimine çevirir; sorgu SQLite dilinde yazılmış olmalı. */
export function toD1Sql(text: string): string {
  return text.replace(/\$(\d+)/g, "?$1");
}

/** D1 yalnız metin, sayı, boş ve ikili değer kabul eder. */
export function toD1Value(value: unknown): unknown {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  if (value !== null && typeof value === "object" && !(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value)) return JSON.stringify(value);
  return value;
}

function prepare(db: D1DatabaseLike, statement: SqlStatement) {
  const values = (statement.values ?? []).map(toD1Value);
  const prepared = db.prepare(toD1Sql(statement.text));
  return values.length ? prepared.bind(...values) : prepared;
}

function toResult<T extends Row>(result: D1Result<T>): QueryResult<T> {
  const rows = result.results ?? [];
  return { rows, rowCount: rows.length > 0 ? rows.length : (result.meta?.changes ?? 0) };
}

export async function query<T extends Row = Row>(text: string, values: readonly unknown[] = []): Promise<QueryResult<T>> {
  try {
    return toResult(await prepare(getDb(), { text, values }).all<T>());
  } catch (error) { throw toDbError(error); }
}

/** D1'de etkileşimli işlem yoktur: ifadeler tek bir atomik toplu çağrıda çalışır, biri hata verirse hiçbiri uygulanmaz. */
export async function batch(statements: readonly SqlStatement[]): Promise<QueryResult[]> {
  if (statements.length === 0) return [];
  try {
    const db = getDb();
    return (await db.batch(statements.map(statement => prepare(db, statement)))).map(result => toResult(result));
  } catch (error) { throw toDbError(error); }
}

/** Satırdaki 0/1 değerini mantıksal değere çevirir (SQLite'ta boolean sütun yoktur). */
export function asBoolean(value: unknown): boolean | unknown {
  return value === 1 || value === 0 ? value === 1 : value;
}
