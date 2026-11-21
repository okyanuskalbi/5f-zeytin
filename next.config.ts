import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { legacyProductRoutes } from "./lib/catalog/product-pages";
import { securityHeaders } from "./lib/site/security-headers";

if (process.env.APP_ENV === "production" && process.env.NEXT_PUBLIC_DEMO === "1") {
  throw new Error("Production ortamında demo modu açılamaz. NEXT_PUBLIC_DEMO=1 ayarını kaldırın.");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Task208: the site is one landing page; the retired pages lead to their section (the query travels along).
      { source: "/urunler", destination: "/#urunler", permanent: true },
      { source: "/urunler/:kategori", destination: "/?kategori=:kategori#urunler", permanent: true },
      { source: "/hakkimizda", destination: "/#hikayemiz", permanent: true },
      { source: "/toptan-satis", destination: "/?sekme=toptan#toptan-bayilik", permanent: true },
      { source: "/bayilik", destination: "/?sekme=bayilik#toptan-bayilik", permanent: true },
      { source: "/blog", destination: "/#blog", permanent: true },
      ...Object.entries(legacyProductRoutes).map(([id, destination]) => ({
        source: "/", has: [{ type: "query" as const, key: "urun", value: id }], destination, permanent: true,
      })),
      { source: "/", has: [{ type: "query" as const, key: "urun" }], destination: "/urun/bulunamayan", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env.NODE_ENV === "development") }];
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
    // worker-mailer `cloudflare:sockets` içe aktarır; OpenNext'in esbuild aşaması bunu çözemez (bkz. lib/mail/cf-sockets-shim.ts).
    resolveAlias: { "cloudflare:sockets": "./lib/mail/cf-sockets-shim.ts" },
  },
};

export default nextConfig;

// `next dev` içinde D1 bağlaması için wrangler'ın yerel yansımasını başlatır (üretimde etkisizdir).
if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare").then(module => module.initOpenNextCloudflareForDev());
}
