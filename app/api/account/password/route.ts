import { customerError, customerInput } from "@/lib/account/customer-http";
import { requireCustomer } from "@/lib/account/customer-server";
import {
  assertRequestOrigin,
  AuthCoreError,
  authFailure,
  authResponseHeaders,
  createAuthServerClient,
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
    const client = await createAuthServerClient();
    const verified = await client.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verified.error) throw authFailure(verified.error);
    if (verified.data.user?.id !== user.id)
      throw new AuthCoreError(401, "unauthenticated");
    const result = await client.auth.updateUser({ password });
    if (result.error) throw authFailure(result.error);
    if (result.data.user?.id !== user.id)
      throw new AuthCoreError(503, "auth_unavailable");
    return new Response(null, { status: 204, headers: authResponseHeaders });
  } catch (error) {
    return customerError(error);
  }
}
