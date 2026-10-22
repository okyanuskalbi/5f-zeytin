"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getAuthConfig, getAuthCookieOptions } from "./config";

/** Browser cookie/PKCE client. Its session is never authorization evidence. */
export function createAuthBrowserClient() {
  if (typeof window === "undefined") throw new Error("Browser auth client requires a browser");
  const { url, key } = getAuthConfig();
  return createBrowserClient(url, key, {
    cookieOptions: getAuthCookieOptions(),
    // Only our server callback exchanges codes; never accept implicit URL tokens.
    auth: { detectSessionInUrl: false },
  });
}
