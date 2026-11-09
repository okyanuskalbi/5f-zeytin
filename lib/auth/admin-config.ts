import "server-only";
import { getAuthConfig } from "./server-config";
import { AuthCoreError } from "./server";

export const adminConfigurationMessage = "Yönetim paneli şu an yapılandırılıyor.";

/** Configuration check only: no identity/role lookup, network call or cached result.
 * Proxy converts this to HTTP 503 before RSC can stream a different status.
 * Every protected operation still verifies the user and admin_users separately.
 */
export function assertAdminConfiguration(): void {
  try {
    getAuthConfig();
    const url = new URL(process.env.DATABASE_URL ?? "");
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname) throw new Error();
  } catch {
    throw new AuthCoreError(503, "admin_configuration_unavailable", 5);
  }
}
