import "server-only";
import { headers } from "next/headers";
import { getAuth } from "./better-auth";
import { getAuthConfig } from "./server-config";
import { AuthCoreError, authErrorResponse, authFailure, authResponseHeaders } from "./errors";
export { AuthCoreError, authErrorResponse, authFailure, authRateLimitError, authResponseHeaders } from "./errors";


/** Always checks the database session; cookie cache is explicitly disabled. */
export async function getVerifiedSession(requestHeaders?: Headers) {
  try {
    const incoming = requestHeaders ?? await headers();
    if (!incoming.get("cookie")) return null;
    return await getAuth().api.getSession({ headers: incoming, query: { disableCookieCache: true } });
  } catch (error) { throw authFailure(error); }
}
export async function getVerifiedUser() {
  const session = await getVerifiedSession();
  return session ? { id: session.user.id, email: session.user.email } : null;
}
export function getAuthSiteOrigin(request: Request): string {
  void request;
  try { return getAuthConfig().siteOrigin; } catch { throw new AuthCoreError(503, "auth_unavailable", 5); }
}
export function assertRequestOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (request.headers.get("origin") !== getAuthSiteOrigin(request) || (site !== null && site !== "same-origin")) throw new AuthCoreError(403, "csrf_rejected");
}
export function assertAuthMutation(request: Request) {
  if (request.method !== "POST") throw new AuthCoreError(405, "method_not_allowed");
  assertRequestOrigin(request);
}

/** Invoke the HTTP handler so database-backed rate limits are enforced. Server
 * auth.api mutations bypass Better Auth's HTTP limiter. */
export async function authRequest(request: Request, path: string, body?: unknown): Promise<Response> {
  const url = new URL(`/api/auth${path}`, getAuthSiteOrigin(request));
  const incoming = new Headers(request.headers);
  incoming.delete("content-length");
  if (body !== undefined) incoming.set("content-type", "application/json");
  return getAuth().handler(new Request(url, { method: body === undefined ? "GET" : "POST", headers: incoming, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }));
}
export function copyAuthCookies(source: Response, target: Response) {
  for (const cookie of source.headers.getSetCookie()) target.headers.append("set-cookie", cookie);
  return target;
}
export async function logout(request: Request) {
  try {
    assertAuthMutation(request);
    const result = await authRequest(request, "/sign-out", {});
    if (!result.ok) throw new AuthCoreError(result.status === 429 ? 429 : 503, result.status === 429 ? "auth_rate_limited" : "auth_unavailable");
    return copyAuthCookies(result, new Response(null, { status: 204, headers: authResponseHeaders }));
  } catch (error) { return authErrorResponse(error); }
}
