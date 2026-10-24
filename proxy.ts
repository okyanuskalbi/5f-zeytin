import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, authResponseHeaders, createAuthServerClient, getVerifiedUser } from "@/lib/auth/server";
import { adminConfigurationMessage, assertAdminConfiguration } from "@/lib/auth/admin-config";

/** Persists rotation before Server Components render; this is not an auth gate. */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const adminApi = path === "/api/admin" || path.startsWith("/api/admin/");
  if (adminApi || path === "/admin" || path.startsWith("/admin/")) {
    try { assertAdminConfiguration(); }
    catch (error) {
      if (adminApi) return authErrorResponse(error);
      return new NextResponse(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Yönetim paneli</title></head><body><main><h1>${adminConfigurationMessage}</h1><a href="/">Ana sayfaya dön</a></main></body></html>`, {
        status: 503,
        headers: { ...authResponseHeaders, "Content-Type": "text/html; charset=utf-8", "Retry-After": "5" },
      });
    }
    // API handlers verify identity themselves; they persist any refreshed cookies.
    if (adminApi) return NextResponse.next({ headers: authResponseHeaders });
  }
  let response = NextResponse.next({ request });
  Object.entries(authResponseHeaders).forEach(([key, value]) => response.headers.set(key, value));
  if (!request.cookies.getAll().some(cookie => /^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name))) return response;
  try {
    const client = await createAuthServerClient({ cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values, headers) => {
        // Forward the new session to both the current render and next request.
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries({ ...authResponseHeaders, ...headers }).forEach(([key, value]) => response.headers.set(key, value));
      },
    } });
    await getVerifiedUser(client);
    return response;
  } catch (error) {
    const failure = authErrorResponse(error);
    response.cookies.getAll().forEach(cookie => failure.cookies.set(cookie));
    return failure;
  }
}

export const config = { matcher: ["/hesabim/:path*", "/admin/:path*", "/api/admin/:path*", "/sepet", "/odeme", "/giris"] };
