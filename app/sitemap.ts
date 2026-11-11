import type { MetadataRoute } from "next";
import { siteIdentity } from "@/lib/site/identity";
import { blogPosts } from "@/lib/blog/posts";

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
      lastModified: "2026-11-11",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...["hakkimizda", "toptan-satis"].map(path => ({ url: `${siteIdentity.origin}/${path}`, lastModified: "2026-11-10", changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${siteIdentity.origin}/blog`, lastModified: "2026-11-11", changeFrequency: "monthly", priority: 0.6 },
    ...blogPosts.map(post => ({ url: `${siteIdentity.origin}/blog/${post.slug}`, lastModified: post.updated, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
