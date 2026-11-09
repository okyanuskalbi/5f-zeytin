import { customerError, customerInput } from "@/lib/account/customer-http";
import { requireCustomer } from "@/lib/account/customer-server";
import {
  assertRequestOrigin,
  AuthCoreError,
  authResponseHeaders,
  authRequest,
  copyAuthCookies,
} from "@/lib/auth/server";
import { validateCredentials } from "@/lib/auth/adapter";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    assertRequestOrigin(request);
    const input = await customerInput(request);
    const currentPassword =
        typeof input.currentPassword === "string" ? input.currentPassword : "",
      password = typeof input.password === "string" ? input.password : "";
    const fields: Record<string, string> = {};
    if (!currentPassword || currentPassword.length > 128)
      fields.currentPassword = "Mevcut şifrenizi girin.";
    const invalid = validateCredentials(
      { email: "validation@example.test", password },
      true,
    );
    if (invalid.password) fields.password = invalid.password;
    if (password === currentPassword)
      fields.password = "Yeni şifreniz mevcut şifrenizden farklı olmalı.";
    if (
      Object.keys(fields).length ||
      Object.keys(input).some(
        (key) => !["currentPassword", "password"].includes(key),
      )
    )
      throw Object.assign(new AuthCoreError(400, "validation_error"), {
        fields,
      });
    const user = await requireCustomer();
    if (!user.email) throw new AuthCoreError(400, "email_required");
    const result = await authRequest(request, "/change-password", { currentPassword, newPassword: password, revokeOtherSessions: true });
    if (!result.ok) throw new AuthCoreError(result.status === 429 ? 429 : result.status >= 500 ? 503 : 401, result.status === 429 ? "auth_rate_limited" : result.status >= 500 ? "auth_unavailable" : "unauthenticated");
    return copyAuthCookies(result,new Response(null, { status: 204, headers: authResponseHeaders }));
  } catch (error) {
    return customerError(error);
  }
}
