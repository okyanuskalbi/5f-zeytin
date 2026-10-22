import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, authResponseHeaders, createAuthServerClient, getVerifiedUser } from "@/lib/auth/server";

/** Persists rotation before Server Components render; this is not an auth gate. */
export async function proxy(request: NextRequest) {
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

export const config = { matcher: ["/hesabim/:path*", "/admin/:path*", "/sepet", "/odeme", "/giris"] };
