import { getAuth } from "@/lib/auth/better-auth";
import { authErrorResponse, authResponseHeaders } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  try {
    const response = await getAuth().handler(request);
    Object.entries(authResponseHeaders).forEach(([key,value]) => response.headers.set(key,value));
    return response;
  } catch (error) { return authErrorResponse(error); }
}
export const GET = handle;
export const POST = handle;
