import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { operatorConnectionString } from "./db-operator.mjs";

export function parseAdminArguments(args) {
  const email = args.length === 2 && args[0] === "--email" ? args[1].trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Use admin:grant --email <registered email>");
  return email;
}

/** The operator controls the database connection; no HTTP route or password handling. */
export async function grantAdmin(pool, email) {
  const normalized = parseAdminArguments(["--email", email]);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query('SELECT id FROM public."user" WHERE lower(email) = $1 ORDER BY id LIMIT 2 FOR UPDATE', [normalized]);
    if (found.rows.length === 0) throw new Error("user_not_found");
    if (found.rows.length !== 1) throw new Error("ambiguous_user");
    const id = found.rows[0].id;
    const verified = await client.query('UPDATE public."user" SET "emailVerified"=true,"updatedAt"=now() WHERE id=$1 AND "emailVerified" IS DISTINCT FROM true', [id]);
    const granted = await client.query("INSERT INTO public.admin_users(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING", [id]);
    await client.query("COMMIT");
    return { adminAdded: granted.rowCount ?? 0, emailVerifiedChanged: verified.rowCount ?? 0 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let pool;
  try {
    const email = parseAdminArguments(process.argv.slice(2));
    pool = new Pool({ connectionString: operatorConnectionString(), max: 1, connectionTimeoutMillis: 10000 });
    console.log(JSON.stringify({ status: "admin_ready", ...await grantAdmin(pool, email) }));
  } catch (error) {
    const messages = {
      user_not_found: "Registered user not found. Register the intended user first; no admin was added.",
      ambiguous_user: "More than one user matches the email. Resolve the duplicate before assigning an admin.",
    };
    console.error(messages[error?.message] ?? "Admin grant failed. Use --email <registered email> with a reviewed DATABASE_URL_UNPOOLED.");
    process.exitCode = 1;
  } finally { await pool?.end(); }
}
