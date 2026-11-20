import {
  CompiledQuery, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler,
  type DatabaseConnection, type Dialect, type Driver, type Kysely, type QueryResult,
} from "kysely";
import { toD1Value } from "./index";
import type { D1DatabaseLike } from "./types";

/** Better Auth için Kysely-D1 köprüsü. D1'de etkileşimli işlem yoktur; işlem açmaya çalışmak hata verir. */
class D1Connection implements DatabaseConnection {
  constructor(private readonly db: D1DatabaseLike) {}
  async executeQuery<R>(compiled: CompiledQuery): Promise<QueryResult<R>> {
    const prepared = this.db.prepare(compiled.sql);
    const values = compiled.parameters.map(toD1Value);
    const result = await (values.length ? prepared.bind(...values) : prepared).all<Record<string, unknown>>();
    const rows = (result.results ?? []) as R[];
    const changes = result.meta?.changes;
    return {
      rows,
      numAffectedRows: rows.length === 0 && typeof changes === "number" ? BigInt(changes) : undefined,
      insertId: typeof result.meta?.last_row_id === "number" ? BigInt(result.meta.last_row_id) : undefined,
    };
  }
  async *streamQuery(): AsyncIterableIterator<never> { throw new Error("D1 akış sorgusunu desteklemez."); }
}

class D1Driver implements Driver {
  constructor(private readonly db: D1DatabaseLike) {}
  async init() {}
  async acquireConnection() { return new D1Connection(this.db); }
  async beginTransaction(): Promise<void> { throw new Error("D1 etkileşimli işlem desteklemez."); }
  async commitTransaction(): Promise<void> { throw new Error("D1 etkileşimli işlem desteklemez."); }
  async rollbackTransaction(): Promise<void> { throw new Error("D1 etkileşimli işlem desteklemez."); }
  async releaseConnection() {}
  async destroy() {}
}

export function createD1Dialect(db: D1DatabaseLike): Dialect {
  return {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new D1Driver(db),
    createQueryCompiler: () => new SqliteQueryCompiler(),
    createIntrospector: (kysely: Kysely<unknown>) => new SqliteIntrospector(kysely),
  };
}
