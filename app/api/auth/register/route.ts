import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { registrationConfirmation, registrationPasswordError, validateRegisterRequest, type RegisterErrors, type RegisterResponse } from "@/lib/contracts/register";
import { assertAuthMutation, AuthCoreError, authErrorResponse, authResponseHeaders, createAuthServerClient } from "@/lib/auth/server";

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
    // Only PKCE cookies are published. Never start a session before email confirmation.
    // Retain the generated verifier on duplicate errors too, keeping response shape neutral.
    const verifiers = new Map<string, { name: string; value: string; options: CookieOptions }>();
    const incoming = request.cookies.getAll().filter(cookie => /-code-verifier(?:\.\d+)?$/.test(cookie.name));
    const cookieState = new Map(incoming.map(cookie => [cookie.name, cookie]));
    let signupCleanup = false;
    const client = await createAuthServerClient({ cookies: {
      getAll: () => [...cookieState.values()],
      setAll: values => {
        // Snapshot before SDK error cleanup removes this newly generated flow.
        // Keep normal eviction of old flows, including deletion cookies, intact.
        if (values.some(cookie => !cookie.value && /-flow-[A-Za-z0-9_-]{8,64}-code-verifier(?:\.\d+)?$/.test(cookie.name) &&
          verifiers.has(cookie.name) && !incoming.some(prior => prior.name === cookie.name))) signupCleanup = true;
        if (signupCleanup) return;
        values.forEach(cookie => {
          if (!/-code-verifier(?:\.\d+)?$/.test(cookie.name)) return;
          verifiers.set(cookie.name, cookie);
          if (!cookie.value || cookie.options.maxAge === 0) cookieState.delete(cookie.name);
          else cookieState.set(cookie.name, { name: cookie.name, value: cookie.value });
        });
      },
    } });
    const { name, email, password, marketing } = parsed.data;
    const { data, error } = await client.auth.signUp({ email, password, options: {
      emailRedirectTo: new URL("/auth/callback?next=/hesabim", request.url).href,
      // Preferences only, never an authorization or authoritative consent ledger.
      data: { name, privacy_acknowledged: true, membership_consent: true, marketing_consent: marketing, consent_recorded_at: new Date().toISOString() },
    } });
    const duplicate = error && ["user_already_exists", "email_exists"].includes(error.code ?? "");
    if (error && !duplicate) {
      if (error.status === 429) throw new AuthCoreError(429, "auth_rate_limited", 60);
      if (error.code === "weak_password") return invalidFields({ password: registrationPasswordError }, 422);
      throw new AuthCoreError(503, "auth_unavailable", 5);
    }
    // Confirm email must be enabled on the approved target (task 077).
    if (!duplicate && (typeof data.user?.id !== "string" || !data.user.id.trim() || data.session)) throw new AuthCoreError(503, "auth_unavailable", 5);
    const response = NextResponse.json<RegisterResponse>({ data: { status: "confirmation_required", message: registrationConfirmation } }, { status: 202, headers: authResponseHeaders });
    verifiers.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
