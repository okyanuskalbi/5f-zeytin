/** Cloudflare D1 yüzeyinin bu projede kullanılan en küçük hâli (testlerde SQLite dolgusu aynı şekli taşır). */
export interface D1Meta { changes?: number; last_row_id?: number; rows_read?: number; rows_written?: number }
export interface D1Result<T = Record<string, unknown>> { results: T[]; success: boolean; meta: D1Meta }
export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
export interface D1DatabaseLike {
  prepare(sql: string): D1PreparedStatementLike;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatementLike[]): Promise<D1Result<T>[]>;
  exec(sql: string): Promise<unknown>;
}
