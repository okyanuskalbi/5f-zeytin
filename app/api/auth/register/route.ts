import { NextResponse, type NextRequest } from "next/server";
import { registrationConfirmation, registrationReady, registrationPasswordError, validateRegisterRequest, type RegisterErrors, type RegisterResponse } from "@/lib/contracts/register";
import { assertAuthMutation, AuthCoreError, authErrorResponse, authResponseHeaders, authRateLimitError, authRequest } from "@/lib/auth/server";
import { requireEmailVerification } from "@/lib/auth/server-config";
import { assertAuthEmailConfigured } from "@/lib/auth/email";
export const dynamic = "force-dynamic";
const maxBodyBytes = 8192;

function invalidFields(fields: RegisterErrors, status = 400) {
  return NextResponse.json<RegisterResponse>({ error: { code: "validation_error", message: "Lütfen alanları kontrol edin.", fields } }, { status, headers: authResponseHeaders });
}

async function readInput(request: Request): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) throw new AuthCoreError(415, "unsupported_media_type");
  if (Number(request.headers.get("content-length")) > maxBodyBytes) throw new AuthCoreError(413, "payload_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new AuthCoreError(400, "invalid_request");
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
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
  const parsed = validateRegisterRequest(await readInput(request));
  if (!parsed.ok) return invalidFields(parsed.fields);
  const verificationRequired = requireEmailVerification();
  if (verificationRequired) { try { assertAuthEmailConfigured(); } catch { throw new AuthCoreError(503, "email_not_configured"); } }
  const { name,email,password,marketing } = parsed.data;
  const result = await authRequest(request, "/sign-up/email", { name,email,password,callbackURL:"/hesabim", privacy: true, consent: true, marketing });
  if (result.status === 429) throw authRateLimitError(result);
  const body = await result.json().catch(() => null);
  if (!result.ok && ["WEAK_PASSWORD", "PASSWORD_TOO_SHORT", "PASSWORD_TOO_LONG"].includes(body?.code)) return invalidFields({password:registrationPasswordError},422);
  if (!result.ok && body?.code !== "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") throw new AuthCoreError(503,"auth_unavailable",5);
  return NextResponse.json<RegisterResponse>({ data: { status: verificationRequired ? "confirmation_required" : "registered", message: verificationRequired ? registrationConfirmation : registrationReady } }, { status: 202, headers: authResponseHeaders });
 } catch(error) { return authErrorResponse(error); }
}
