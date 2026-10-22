import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthConfig, getAuthCookieOptions } from "./config";

export const authResponseHeaders = {
  "Cache-Control": "private, no-store",
  "Pragma": "no-cache",
  "Expires": "0",
  "Referrer-Policy": "no-referrer",
};

export class AuthCoreError extends Error {
  constructor(public status: number, public code: string, public retryAfter?: number) {
    super(code);
  }
}

/** Auth's shared provider enforces rate limits, including PKCE/refresh and /user.
 * No process-local counters: those would fail open across Vercel instances.
 */
export function authFailure(error: unknown, invalidStatus = 401): AuthCoreError {
  if (error instanceof AuthCoreError) return error;
  const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
  if (status === 429) return new AuthCoreError(429, "auth_rate_limited", 60);
  if (typeof status !== "number" || status >= 500 || status === 0) return new AuthCoreError(503, "auth_unavailable", 5);
  return new AuthCoreError(invalidStatus, invalidStatus === 400 ? "invalid_callback" : "unauthenticated");
}

export function authErrorResponse(error: unknown) {
  const failure = authFailure(error);
  const message = failure.status === 429 ? "Çok fazla deneme. Daha sonra yeniden deneyin."
    : failure.status === 503 ? "Üyelik hizmeti şu anda kullanılamıyor."
      : "İşlem doğrulanamadı. Yeniden deneyin.";
  return NextResponse.json({ error: { code: failure.code, message } }, {
    status: failure.status,
    headers: { ...authResponseHeaders, ...(failure.retryAfter ? { "Retry-After": String(failure.retryAfter) } : {}) },
  });
}

/** A fresh client per request; default writes are for Route Handlers/Actions.
 * Server Components use readOnly after proxy.ts has persisted any token rotation.
 */
export async function createAuthServerClient(options: { readOnly?: boolean; cookies?: CookieMethodsServer } = {}) {
  const { url, key } = getAuthConfig();
  const store = options.cookies ? null : await cookies();
  return createServerClient(url, key, {
    cookieOptions: getAuthCookieOptions(),
    cookies: options.cookies ?? {
      getAll: () => store!.getAll(),
      setAll: values => {
        if (options.readOnly) return;
        for (const { name, value, options: cookieOptions } of values) store!.set(name, value, cookieOptions);
      },
    },
    global: {
      fetch: async (input, init) => {
        try {
          const response = await fetch(input, {
            ...init, cache: "no-store",
            signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(5000)]) : AbortSignal.timeout(5000),
          });
          // The SDK can log refresh failures internally. Keep upstream details
          // out of those logs as well as our HTTP responses, preserving status.
          return response.ok ? response : Response.json({ msg: "Auth request failed" }, { status: response.status });
        } catch {
          throw new Error("Auth request unavailable");
        }
      },
    },
  });
}

/** Validates with Auth, never getSession() or client-supplied role metadata.
 * Membership confers no admin permission; task 062 owns that separate gate.
 */
export async function getVerifiedUser(client?: SupabaseClient): Promise<{ id: string; email: string | null } | null> {
  try {
    const supabase = client ?? await createAuthServerClient({ readOnly: true });
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.name === "AuthSessionMissingError" ||
        (error.status !== undefined && error.status >= 400 && error.status < 500 && error.status !== 429)) return null;
      throw authFailure(error);
    }
    const user = data.user;
    if (!user || typeof user.id !== "string" || !user.id.trim() ||
      (user.email != null && typeof user.email !== "string")) throw new AuthCoreError(503, "auth_unavailable", 5);
    return { id: user.id, email: user.email ?? null };
  } catch (error) {
    throw authFailure(error);
  }
}

/** Reject login/logout CSRF before any Auth call. Do not trust forwarded headers. */
export function assertAuthMutation(request: Request) {
  if (request.method !== "POST") throw new AuthCoreError(405, "method_not_allowed");
  const origin = new URL(request.url).origin;
  const site = request.headers.get("sec-fetch-site");
  if (request.headers.get("origin") !== origin || (site !== null && site !== "same-origin")) {
    throw new AuthCoreError(403, "csrf_rejected");
  }
}

export async function logout(request: Request) {
  try {
    assertAuthMutation(request);
    const client = await createAuthServerClient();
    // /user is provider-rate-limited. Validate before allowing the mutation.
    await getVerifiedUser(client);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw authFailure(error);
    return new NextResponse(null, { status: 204, headers: authResponseHeaders });
  } catch (error) {
    return authErrorResponse(error);
  }
}
