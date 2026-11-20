import type { SqliteD1 } from "./d1-sqlite";

/** `scripts/d1.mjs` içindeki `execute` yerine geçer: komutu SQLite dolgusunda çalıştırır, wrangler çıktısı biçiminde döner. */
export function fakeExecute(database: SqliteD1) {
  return (_target: unknown, input: { command: string }) => {
    const statements = input.command.split(/;\s*(?:\n|$)/).map(part => part.trim()).filter(Boolean);
    return statements.map(sql => {
      const prepared = database.sqlite.prepare(sql);
      if (prepared.columns().length > 0) return { results: prepared.all() as Record<string, unknown>[], success: true, meta: { changes: 0 } };
      return { results: [], success: true, meta: { changes: Number(prepared.run().changes) } };
    });
  };
}
