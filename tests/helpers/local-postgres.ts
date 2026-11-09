/** Refuse network targets before any local integration setup or cleanup. */
export function localTestDatabaseUrl(raw = process.env.TEST_DATABASE_URL): string {
  if (!raw) throw new Error("Local TEST_DATABASE_URL required");
  const url = new URL(raw);
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    [...url.searchParams.keys()].some(key => !["application_name", "sslmode"].includes(key))) {
    throw new Error("Only local test PostgreSQL is permitted");
  }
  return raw;
}
