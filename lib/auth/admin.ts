import "server-only";
import { query } from "@/lib/db";
import { getVerifiedSession } from "./server";
import { AuthCoreError, assertRequestOrigin } from "./server";
import { assertAdminConfiguration } from "./admin-config";

type AdminUser = { id: string; email: string };

/** Every protected operation checks the database session and current assignment. */
export async function requireAdmin(_options: { readOnly?: boolean } = {}): Promise<AdminUser> {
  void _options;
  assertAdminConfiguration();
  const session = await getVerifiedSession();
  if (!session) throw new AuthCoreError(401, "unauthenticated");
  const {user} = session;
  if (!user.email || !user.emailVerified) throw new AuthCoreError(403, "forbidden");
  let rows;
  try { rows = (await query<{user_id:string}>("select user_id from admin_users where user_id = $1 limit 1", [user.id])).rows; }
  catch { throw new AuthCoreError(503, "admin_unavailable", 5); }
  if (!rows.some(row => row.user_id === user.id)) throw new AuthCoreError(403, "forbidden");
  return {id:user.id,email:user.email};
}

/** Route Handlers must call this before each write and use authErrorResponse
 * for 401/403/429/503 JSON responses. Server Actions call requireAdmin directly;
 * Next validates their Origin against Host before invoking the action.
 */
export async function requireAdminMutation(request: Request): Promise<AdminUser> {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    throw new AuthCoreError(405, "method_not_allowed");
  }
  assertAdminConfiguration();
  assertRequestOrigin(request);
  return requireAdmin({ readOnly: false });
}
