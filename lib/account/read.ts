import "server-only";
import { AuthCoreError, authFailure, createAuthServerClient } from "@/lib/auth/server";
import type { AccountProfile } from "@/lib/contracts/account";

function displayText(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;
}

/** No target id argument or privileged client: /user verifies this request's session.
 * User-editable name/phone are display text, never authorization evidence.
 */
export async function readOwnAccount(): Promise<AccountProfile | null> {
  try {
    const client = await createAuthServerClient({ readOnly: true });
    const { data, error } = await client.auth.getUser();
    if (error) {
      if (error.name === "AuthSessionMissingError" ||
        (error.status !== undefined && error.status >= 400 && error.status < 500 && error.status !== 429)) return null;
      throw authFailure(error);
    }
    const user = data.user;
    if (!user || typeof user.id !== "string" || !user.id.trim() ||
      (user.email != null && typeof user.email !== "string")) throw new AuthCoreError(503, "auth_unavailable", 5);
    const metadata: unknown = user.user_metadata;
    const fields = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata as Record<string, unknown> : {};
    return { name: displayText(fields.name, 100), email: displayText(user.email, 254), phone: displayText(fields.phone, 20) };
  } catch (error) {
    throw authFailure(error);
  }
}
