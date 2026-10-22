import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/sepet",
        "/odeme",
        "/odeme-onizleme",
        "/hesabim",
        "/giris",
        "/siparis-takip",
        "/__demo",
        "/%5F%5Fdemo",
      ],
    },
    sitemap: "https://afinazeytin.com/sitemap.xml",
  };
}
