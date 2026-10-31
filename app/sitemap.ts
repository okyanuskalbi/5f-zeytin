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
  ];
}
