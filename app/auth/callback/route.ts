import { NextResponse } from "next/server";
import { safeAuthRedirect } from "@/lib/auth/config";
import { AuthCoreError, authErrorResponse, authFailure, authResponseHeaders, createAuthServerClient, getAuthSiteOrigin } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const flowId = url.searchParams.get("sb_flow_id");
    if (!code || !/^[A-Za-z0-9_-]{1,2048}$/.test(code) || url.searchParams.has("error") ||
      ["code", "next", "sb_flow_id"].some(key => url.searchParams.getAll(key).length > 1) ||
      (flowId !== null && !/^[A-Za-z0-9_-]{8,64}$/.test(flowId))) {
      throw new AuthCoreError(400, "invalid_callback");
    }
    const client = await createAuthServerClient();
    // PKCE requires the verifier cookie from the browser that started the flow.
    const { data, error } = await client.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (error) throw authFailure(error, 400);
    if (!data.session || !data.user) throw new AuthCoreError(400, "invalid_callback");
    return new NextResponse(null, {
      status: 303,
      headers: { ...authResponseHeaders, Location: new URL(safeAuthRedirect(url.searchParams.get("next")), getAuthSiteOrigin(request)).href },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
