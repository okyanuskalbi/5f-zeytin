import { NextResponse } from "next/server";
import { safeAuthRedirect } from "@/lib/auth/config";
import { AuthCoreError, authErrorResponse, authResponseHeaders, getAuthSiteOrigin, getVerifiedSession } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
/** Better Auth consumes OAuth/email tokens in its own callback routes. The old
 * public callback remains a safe landing page, never accepts legacy codes. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.has("error") || url.searchParams.has("code") || !await getVerifiedSession(request.headers)) throw new AuthCoreError(400,"invalid_callback");
    return new NextResponse(null,{ status:303, headers:{...authResponseHeaders,Location:new URL(safeAuthRedirect(url.searchParams.get("next")),getAuthSiteOrigin(request)).href} });
  } catch(error) { return authErrorResponse(error); }
}
