import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, authResponseHeaders } from "@/lib/auth/server";
import { adminConfigurationMessage, assertAdminConfiguration } from "@/lib/auth/admin-config";

/** Configuration and optimistic redirects only; protected server code verifies sessions. */
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
    // Every API handler independently verifies the current database session.
    if (adminApi) return NextResponse.next({ headers: authResponseHeaders });
  }
  const response = NextResponse.next({ request });
  Object.entries(authResponseHeaders).forEach(([key, value]) => response.headers.set(key, value));
  // This is only an optimistic redirect. Every protected loader/route verifies
  // the signed token against database sessions; cookie presence grants no access.
  if (path === "/hesabim" || path.startsWith("/hesabim/")) {
    const present = request.cookies.getAll().some(cookie => ["better-auth.session_token", "__Secure-better-auth.session_token"].includes(cookie.name));
    if (!present) return NextResponse.redirect(new URL(`/giris?next=${encodeURIComponent(path)}`, request.url));
  }
  return response;
}

export const config = { matcher: ["/hesabim/:path*", "/api/account/:path*", "/admin/:path*", "/api/admin/:path*", "/sepet", "/odeme", "/giris"] };
