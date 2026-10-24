import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

function supabaseConnectSources(): string {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) return "";
    return ` ${url.origin} ${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}`;
  } catch { return ""; }
}

const nextConfig: NextConfig = {
  async headers() {
    // Static/RSC pages emit inline hydration scripts and JSON-LD; inlineCss and
    // Motion also need inline styles. Nonces would require dynamic rendering
    // on every page. Keep these narrow allowances report-only during rollout.
    // PayTR uses /js/iframeResizer.min.js and https://www.paytr.com/odeme/guvenli/*
    // frames; retain its exact origin for frame/form flows before enforcing CSP.
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.paytr.com/js/iframeResizer.min.js${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self'${supabaseConnectSources()}`,
      "img-src 'self' data: blob:", "font-src 'self'", "media-src 'self' blob:",
      "frame-src 'self' https://www.paytr.com", "form-action 'self' https://www.paytr.com",
      "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'",
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy-Report-Only", value: csp },
    ] }];
  },
  experimental: {
    authInterrupts: true,
    inlineCss: true,
    turbopackChunking: { minChunkSize: 100000, maxChunkCountPerGroup: 2, maxMergeChunkSize: 400000 },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
