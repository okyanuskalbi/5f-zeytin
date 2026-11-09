import "server-only";
export function getAuthConfig() {
  try {
    const preview = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";
    let value = process.env.BETTER_AUTH_URL?.trim();
    if (preview) {
      // Vercel injects this exact deployment hostname. Never trust request Host
      // or a wildcard origin, and never send preview auth back to production.
      const hostname = process.env.VERCEL_URL?.trim();
      if (!hostname || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(hostname)) throw new Error();
      value = `https://${hostname}`;
    }
    const secret = process.env.BETTER_AUTH_SECRET?.trim();
    if (!value || !secret || secret.length < 32) throw new Error();
    const parsed = new URL(value);
    const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if ((parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) throw new Error();
    return { siteOrigin: parsed.origin, secret };
  } catch { throw new Error("Auth configuration unavailable"); }
}


/** Temporary SMTP readiness switch; only an explicit false relaxes this rule. */
export function requireEmailVerification(): boolean {
  const value = process.env.AUTH_REQUIRE_EMAIL_VERIFICATION?.trim();
  if (!value || value === "true") return true;
  if (value === "false") return false;
  throw new Error("Auth verification configuration unavailable");
}
