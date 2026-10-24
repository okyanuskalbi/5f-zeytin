import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { AuthCoreError, assertRequestOrigin, authFailure, createAuthServerClient } from "./server";
import { assertAdminConfiguration } from "./admin-config";

type AdminUser = { id: string; email: string };
const unavailable = () => new AuthCoreError(503, "admin_unavailable", 5);

/** Call at every protected read/mutation, including each Server Action.
 * Layout checks do not protect nested data loaders, APIs or Actions.
 * No role/identity cache: revocation must take effect on the next call.
 * Actions use readOnly:false so refreshed cookies can be persisted.
 */
export async function requireAdmin(options: { readOnly?: boolean } = {}): Promise<AdminUser> {
  assertAdminConfiguration();
  const user = await (async () => {
    try {
      const client = await createAuthServerClient({ readOnly: options.readOnly ?? true });
      const { data, error } = await client.auth.getUser();
      if (error) {
        if (error.name === "AuthSessionMissingError" ||
          (error.status !== undefined && error.status >= 400 && error.status < 500 && error.status !== 429)) {
          throw new AuthCoreError(401, "unauthenticated");
        }
        throw authFailure(error);
      }
      if (!data.user) throw new AuthCoreError(401, "unauthenticated");
      return data.user;
    } catch (error) {
      throw authFailure(error);
    }
  })();

  if (typeof user.id !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(user.id) ||
    (user.email != null && typeof user.email !== "string")) throw unavailable();
  // Current email and confirmation come only from Auth's /user response,
  // never from cookie contents, user_metadata, app_metadata or role claims.
  if (user.is_anonymous || !user.email || typeof user.email_confirmed_at !== "string" ||
    !Number.isFinite(Date.parse(user.email_confirmed_at))) throw new AuthCoreError(403, "forbidden");

  const admin = { id: user.id, email: user.email };
  let rows: { user_id: string }[];
  try {
    const client = createSupabaseServiceClient({ noStore: true });
    const { data, error } = await client.from("admin_users").select("user_id")
      .eq("user_id", user.id).limit(1).retry(false).abortSignal(AbortSignal.timeout(5000));
    if (error || !Array.isArray(data) || data.length > 1 ||
      data.some(row => !row || typeof row.user_id !== "string")) throw unavailable();
    rows = data;
  } catch {
    // Missing config/table, timeout, network and provider details stay private.
    throw unavailable();
  }
  if (!rows.some(row => row.user_id === user.id)) {
    throw new AuthCoreError(403, "forbidden");
  }
  return admin;
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
