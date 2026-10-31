import { readOwnAccount } from "@/lib/account/read";
import { AuthCoreError, authResponseHeaders } from "@/lib/auth/server";
import { customerError } from "@/lib/account/customer-http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const profile = await readOwnAccount();
    if (!profile) throw new AuthCoreError(401, "unauthenticated");
    return Response.json({ data: profile }, { headers: authResponseHeaders });
  } catch (error) {
    return customerError(error);
  }
}
