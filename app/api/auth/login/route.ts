import { NextResponse, type NextRequest } from "next/server";
import { loginInvalidCredentials, magicLinkConfirmation, validateLoginRequest, type LoginResponse } from "@/lib/contracts/login";
import { assertAuthMutation, AuthCoreError, authErrorResponse, authResponseHeaders, authRateLimitError, authRequest, copyAuthCookies } from "@/lib/auth/server";
import { assertAuthEmailConfigured } from "@/lib/auth/email";
export const dynamic = "force-dynamic";
const maxBodyBytes = 8192;

async function readInput(request: Request): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) throw new AuthCoreError(415, "unsupported_media_type");
  if (Number(request.headers.get("content-length")) > maxBodyBytes) throw new AuthCoreError(413, "payload_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new AuthCoreError(400, "invalid_request");
  let size = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new AuthCoreError(413, "payload_too_large");
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch (error) {
    if (error instanceof AuthCoreError) throw error;
    throw new AuthCoreError(400, "invalid_request");
  } finally { reader.releaseLock(); }
}

export async function POST(request: NextRequest) {
 try {
  assertAuthMutation(request);
  const parsed = validateLoginRequest(await readInput(request));
  if (!parsed.ok) return NextResponse.json<LoginResponse>({ error: { code: "validation_error", message: "Lütfen alanları kontrol edin.", fields: parsed.fields } }, { status: 400, headers: authResponseHeaders });
  const input = parsed.data;
  if (input.method === "magic_link") {
   try { assertAuthEmailConfigured(); } catch { throw new AuthCoreError(503, "email_not_configured"); }
  }
  const result = await authRequest(request, input.method === "password" ? "/sign-in/email" : "/sign-in/magic-link", input.method === "password"
    ? { email: input.email, password: input.password, callbackURL: input.next }
    : { email: input.email, callbackURL: input.next, errorCallbackURL: "/giris" });
  if (result.status === 429) throw authRateLimitError(result);
  if (!result.ok) {
   if (input.method === "password" && [400,401,403,422].includes(result.status)) return NextResponse.json<LoginResponse>({ error: { code: "invalid_credentials", message: loginInvalidCredentials } }, { status: 401, headers: authResponseHeaders });
   throw new AuthCoreError(503, "auth_unavailable", 5);
  }
  if (input.method === "password") {
   const payload: unknown = await result.json().catch(() => null);
   const data = payload && typeof payload === "object" ? payload as {token?:unknown;user?:{id?:unknown;email?:unknown}} : null;
   const sessionCookie = result.headers.getSetCookie().some(value => /^(?:__Secure-)?better-auth\.session_token=[^;]+;/.test(value) && /;\s*HttpOnly(?:;|$)/i.test(value));
   if (!data || typeof data.token !== "string" || !data.token || typeof data.user?.id !== "string" || !data.user.id ||
     typeof data.user.email !== "string" || data.user.email.trim().toLowerCase() !== input.email || !sessionCookie) throw new AuthCoreError(503, "auth_unavailable", 5);
  }
  const response = input.method === "password"
   ? NextResponse.json<LoginResponse>({ data: { status: "signed_in", redirectTo: input.next } }, { headers: authResponseHeaders })
   : NextResponse.json<LoginResponse>({ data: { status: "link_requested", message: magicLinkConfirmation } }, { status: 202, headers: authResponseHeaders });
  return copyAuthCookies(result, response);
 } catch (error) { return authErrorResponse(error); }
}
