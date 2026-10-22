import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Privileged server operations only; never reuse for user sessions. */
export function createSupabaseServiceClient(options: { noStore?: boolean } = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  let parsed: URL;
  try {
    parsed = new URL(url);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if ((parsed.protocol !== "https:" && !(parsed.protocol === "http:" && loopback)) ||
      parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") {
      throw new Error("invalid URL");
    }
  } catch {
    // Never include raw env values or the underlying URL parsing error.
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(parsed.origin, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(options.noStore ? { global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: "no-store" }),
    } } : {}),
  });
}
