import { customerError, customerInput } from "@/lib/account/customer-http";
import { requireCustomer } from "@/lib/account/customer-server";
import {
  assertRequestOrigin,
  AuthCoreError,
  authFailure,
  authResponseHeaders,
  createAuthServerClient,
} from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export async function PATCH(request: Request) {
  try {
    assertRequestOrigin(request);
    const input = await customerInput(request);
    const name = typeof input.name === "string" ? input.name.trim() : "",
      phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const fields: Record<string, string> = {};
    if (typeof input.name !== "string" || name.length < 2 || name.length > 100)
      fields.name = "Ad soyad 2–100 karakter olmalı.";
    if (
      typeof input.phone !== "string" ||
      (phone &&
        (!/^[+\d\s()-]{10,20}$/.test(phone) ||
          phone.replace(/\D/g, "").length < 10 ||
          phone.replace(/\D/g, "").length > 15))
    )
      fields.phone = "Geçerli bir telefon numarası girin.";
    if (
      Object.keys(fields).length ||
      Object.keys(input).some((key) => !["name", "phone"].includes(key))
    )
      throw Object.assign(new AuthCoreError(400, "validation_error"), {
        fields,
      });
    const user = await requireCustomer();
    const client = await createAuthServerClient();
    const { data, error } = await client.auth.updateUser({
      data: { name, phone },
    });
    if (error) throw authFailure(error);
    if (data.user?.id !== user.id)
      throw new AuthCoreError(503, "auth_unavailable");
    return Response.json(
      { data: { name, phone: phone || null, email: user.email } },
      { headers: authResponseHeaders },
    );
  } catch (error) {
    return customerError(error);
  }
}
