import { expect } from "vitest";

/** Check every serialized Supabase cookie, including PKCE and deletion cookies. */
export function expectHttpOnlyAuthCookies(headers: Headers) {
  const cookies = headers.getSetCookie().filter(cookie => cookie.startsWith("sb-"));
  expect(cookies.length).toBeGreaterThan(0);
  for (const cookie of cookies) expect(cookie).toMatch(/;\s*HttpOnly(?:;|$)/i);
}
