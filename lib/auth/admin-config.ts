import "server-only";
import { getAuthConfig } from "./config";
import { AuthCoreError } from "./server";

export const adminConfigurationMessage = "Yönetim paneli şu an yapılandırılıyor.";

/** Configuration check only: no identity/role lookup, network call or cached result.
 * Proxy converts this to HTTP 503 before RSC can stream a different status.
 * Every protected operation still verifies the user and admin_users separately.
 */
export function assertAdminConfiguration(): void {
  try {
    getAuthConfig();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!key) throw new Error();
    if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(key)) {
      const parts = key.split(".");
      if (parts.length !== 3 || JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))).role !== "service_role") throw new Error();
    }
  } catch {
    throw new AuthCoreError(503, "admin_configuration_unavailable", 5);
  }
}
