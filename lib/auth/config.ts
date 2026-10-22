import type { CookieOptions } from "@supabase/ssr";

/** Public configuration only. Never import the privileged service client here. */
export function getAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  try {
    if (!url || !key) throw new Error();
    const parsed = new URL(url);
    const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if ((parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) ||
      parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) throw new Error();
    // Fail closed if a legacy service JWT or new secret key was misconfigured as public.
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
      const parts = key.split(".");
      if (parts.length !== 3 || JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))).role !== "anon") throw new Error();
    }
    return { url: parsed.origin, key };
  } catch {
    throw new Error("Auth configuration unavailable");
  }
}

export function getAuthCookieOptions(): CookieOptions {
  // Supabase SSR's browser client needs the same cookies to refresh sessions.
  // Lax allows email-link navigation; mutations additionally require exact Origin.
  return { path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", httpOnly: false };
}

export function safeAuthRedirect(path: string | null): string {
  return path && ["/hesabim", "/sepet", "/odeme"].includes(path) ? path : "/hesabim";
}
