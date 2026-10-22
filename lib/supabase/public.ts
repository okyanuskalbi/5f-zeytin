import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAuthPublicConfig } from "@/lib/auth/config";

/** Anonymous, stateless reads: no user cookies and no RLS bypass. */
export function createSupabasePublicClient() {
  const { url, key } = getAuthPublicConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
