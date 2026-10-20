import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
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
