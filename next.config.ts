import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

if (process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_DEMO === "1") {
  throw new Error("Vercel production ortamında demo modu açılamaz. NEXT_PUBLIC_DEMO=1 ayarını kaldırın.");
}

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
  poweredByHeader: false,
  async headers() {
    // Static/RSC pages emit inline hydration scripts and JSON-LD; inlineCss and
    // Motion also need inline styles. Nonces would require dynamic rendering
    // on every page. Keep these narrow allowances in the enforced policy.
    // PayTR uses /js/iframeResizer.min.js and https://www.paytr.com/odeme/guvenli/*
    // frames; retain its exact origin for frame/form flows under enforced CSP.
    const supabaseSources = supabaseConnectSources();
    if (process.env.NODE_ENV === "production" && !supabaseSources) {
      console.warn("[CSP] NEXT_PUBLIC_SUPABASE_URL is missing or invalid; Supabase connections are excluded from the enforced Content-Security-Policy.");
    }
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.paytr.com/js/iframeResizer.min.js${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self'${supabaseSources}`,
      "img-src 'self' data: blob:", "font-src 'self'", "media-src 'self' blob:",
      "frame-src 'self' https://www.paytr.com", "form-action 'self' https://www.paytr.com",
      "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: csp },
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
