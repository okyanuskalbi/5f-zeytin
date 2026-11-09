import { authResponseHeaders } from "@/lib/auth/server";
export function GET() {
  return Response.json({ google: Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()) }, { headers: authResponseHeaders });
}
