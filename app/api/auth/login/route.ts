import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { loginInvalidCredentials, magicLinkConfirmation, validateLoginRequest, type LoginResponse } from "@/lib/contracts/login";
import { assertAuthMutation, AuthCoreError, authErrorResponse, authResponseHeaders, createAuthServerClient } from "@/lib/auth/server";

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
    // Stage SDK writes until success. Never refresh an unrelated existing session.
    const incoming = request.cookies.getAll().filter(cookie => /-code-verifier(?:\.\d+)?$/.test(cookie.name));
    const state = new Map(incoming.map(cookie => [cookie.name, cookie]));
    const pending = new Map<string, { name: string; value: string; options: CookieOptions }>();
    let neutralCleanup = false;
    const client = await createAuthServerClient({ cookies: {
      getAll: () => [...state.values()],
      setAll: values => {
        // Keep new verifiers on neutral OTP errors too, hiding user existence.
        // Preserve SDK eviction of old flows, including deletion cookies.
        if (input.method === "magic_link" && values.some(cookie => !cookie.value &&
          /-flow-[A-Za-z0-9_-]{8,64}-code-verifier(?:\.\d+)?$/.test(cookie.name) &&
          pending.has(cookie.name) && !incoming.some(prior => prior.name === cookie.name))) neutralCleanup = true;
        if (neutralCleanup) return;
        values.forEach(cookie => {
          if (input.method === "magic_link" && !/-code-verifier(?:\.\d+)?$/.test(cookie.name)) return;
          pending.set(cookie.name, cookie);
          if (!cookie.value || cookie.options.maxAge === 0) state.delete(cookie.name);
          else state.set(cookie.name, { name: cookie.name, value: cookie.value });
        });
      },
    } });
    let response: NextResponse;
    if (input.method === "password") {
      const { data, error } = await client.auth.signInWithPassword({ email: input.email, password: input.password });
      if (error) {
        if (error.status === 429) throw new AuthCoreError(429, "auth_rate_limited", 60);
        if (error.status && [400, 401, 403, 422].includes(error.status)) return NextResponse.json<LoginResponse>({ error: { code: "invalid_credentials", message: loginInvalidCredentials } }, { status: 401, headers: authResponseHeaders });
        throw new AuthCoreError(503, "auth_unavailable", 5);
      }
      if (typeof data.user?.id !== "string" || !data.user.id.trim() || (data.user.email != null && typeof data.user.email !== "string") ||
        !data.session?.access_token || !data.session.refresh_token) throw new AuthCoreError(503, "auth_unavailable", 5);
      response = NextResponse.json<LoginResponse>({ data: { status: "signed_in", redirectTo: input.next } }, { headers: authResponseHeaders });
    } else {
      const callback = new URL("/auth/callback", request.url);
      callback.searchParams.set("next", input.next);
      const { error } = await client.auth.signInWithOtp({ email: input.email, options: { shouldCreateUser: false, emailRedirectTo: callback.href } });
      if (error?.status === 429) throw new AuthCoreError(429, "auth_rate_limited", 60);
      // Account-specific refusals have the same response as accepted requests.
      if (error && (!error.status || ![400, 403, 404, 422].includes(error.status))) throw new AuthCoreError(503, "auth_unavailable", 5);
      response = NextResponse.json<LoginResponse>({ data: { status: "link_requested", message: magicLinkConfirmation } }, { status: 202, headers: authResponseHeaders });
    }
    pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
