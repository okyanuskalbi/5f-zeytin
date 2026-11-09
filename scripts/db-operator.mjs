/** Operator commands require the direct server connection; browser configuration is never used. */
export function operatorConnectionString(env = process.env) {
  const raw = env.DATABASE_URL_UNPOOLED;
  if (!raw) throw new Error("DATABASE_URL_UNPOOLED is required");
  const target = new URL(raw);
  const valid = url => ["postgres:", "postgresql:"].includes(url.protocol) && url.hostname &&
    [...url.searchParams.keys()].every(key => ["application_name", "sslmode", "channel_binding"].includes(key));
  if (!valid(target)) throw new Error("Invalid operator database connection");
  if (env.TEST_DATABASE_URL) {
    const local = new URL(env.TEST_DATABASE_URL);
    if (!valid(local) || !["localhost", "127.0.0.1", "[::1]"].includes(local.hostname) ||
      target.hostname !== local.hostname || (target.port || "5432") !== (local.port || "5432") || target.pathname !== local.pathname) {
      throw new Error("Operator target must match the local TEST_DATABASE_URL");
    }
  }
  return raw;
}
