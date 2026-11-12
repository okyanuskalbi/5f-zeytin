import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { blogPosts } from "@/lib/blog/posts";
import { metadata as kvkkMetadata } from "@/app/kvkk/page";
import { metadata as refundMetadata } from "@/app/iade/page";
import { metadata as salesMetadata } from "@/app/mesafeli-satis/page";

afterEach(() => { vi.useRealTimers(); });

describe("SEO metadata routes", () => {
  it("allows public crawling with only the requested exclusions and sitemap, without Host or bot-specific rules", () => {
    expect(robots()).toEqual({
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
          "/kayit",
          "/admin",
          "/siparis-takip",
          "/__demo",
          "/%5F%5Fdemo",
        ],
      },
      sitemap: "https://afinazeytin.com/sitemap.xml",
    });
  });

  it("lists the home page and the articles, excluding retired pages, noindex and product query URLs, with actual content update dates", () => {
    const buildDate = new Date("2026-10-22T12:00:00.000Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(buildDate);

    expect(sitemap()).toEqual([
      {
        url: "https://afinazeytin.com/",
        changeFrequency: "weekly",
        priority: 1,
        lastModified: "2026-11-11",
      },
      // Task208: dealership, about, wholesale and the blog list are sections of the home page (308 redirects), not sitemap entries.
      ...blogPosts.map(post => ({ url: `https://afinazeytin.com/blog/${post.slug}`, changeFrequency: "monthly", priority: 0.5, lastModified: post.updated })),
    ]);
  });

  it.each([
    ["/kvkk", kvkkMetadata],
    ["/iade", refundMetadata],
    ["/mesafeli-satis", salesMetadata],
  ] as const)("keeps the noindex legal draft %s out of the sitemap", (path, metadata) => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(sitemap().map(entry => new URL(entry.url).pathname)).not.toContain(path);
  });
});
