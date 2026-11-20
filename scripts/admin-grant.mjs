import { pathToFileURL } from "node:url";
import { execute, parseTarget, sqlText } from "./d1.mjs";

export function parseAdminArguments(args) {
  const email = args.length === 2 && args[0] === "--email" ? args[1].trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Use admin:grant --email <registered email> --local|--remote");
  return email;
}

/** Yetkiyi operatör verir: HTTP yolu ya da şifre işlemi yoktur. Yazma tek toplu çağrıdır (atomik). */
export function grantAdmin(target, email, run = execute) {
  const normalized = parseAdminArguments(["--email", email]);
  const found = run(target, { command: `SELECT id FROM "user" WHERE lower(email) = ${sqlText(normalized)} ORDER BY id LIMIT 2` })[0]?.results ?? [];
  if (found.length === 0) throw new Error("user_not_found");
  if (found.length !== 1) throw new Error("ambiguous_user");
  const id = sqlText(found[0].id);
  const [verified, granted] = run(target, { command: `UPDATE "user" SET "emailVerified"=1,"updatedAt"=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=${id} AND "emailVerified" IS NOT 1;
    INSERT INTO admin_users(user_id) VALUES(${id}) ON CONFLICT(user_id) DO NOTHING;` });
  return { adminAdded: granted?.meta?.changes ?? 0, emailVerifiedChanged: verified?.meta?.changes ?? 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const target = parseTarget(process.argv.slice(2));
    console.log(JSON.stringify({ status: "admin_ready", ...grantAdmin(target, parseAdminArguments(target.rest)) }));
  } catch (error) {
    const messages = {
      user_not_found: "Registered user not found. Register the intended user first; no admin was added.",
      ambiguous_user: "More than one user matches the email. Resolve the duplicate before assigning an admin.",
    };
    console.error(messages[error?.message] ?? "Admin grant failed. Use --email <registered email> with --local or --remote.");
    process.exitCode = 1;
  }
}
