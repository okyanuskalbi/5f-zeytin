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
    ...blogPosts.map(post => ({ url: `${siteIdentity.origin}/blog/${post.slug}`, lastModified: post.updated, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
