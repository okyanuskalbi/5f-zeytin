import type { MetadataRoute } from "next";
import { siteIdentity } from "@/lib/site/identity";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://afinazeytin.com/",
      lastModified: siteIdentity.contentUpdated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteIdentity.origin}/bayilik`,
      lastModified: "2026-11-09",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
