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

  it("lists public home and dealership pages, excluding noindex and product query URLs, with actual content update dates", () => {
    const buildDate = new Date("2026-10-22T12:00:00.000Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(buildDate);

    expect(sitemap()).toEqual([
      {
        url: "https://afinazeytin.com/",
        changeFrequency: "weekly",
        priority: 1,
        lastModified: "2026-11-01",
      },
      {
        url: "https://afinazeytin.com/bayilik",
        changeFrequency: "monthly",
        priority: 0.7,
        lastModified: "2026-11-09",
      },
      ...["hakkimizda", "toptan-satis"].map(path => ({ url: `https://afinazeytin.com/${path}`, changeFrequency: "monthly", priority: 0.7, lastModified: "2026-11-10" })),
      { url: "https://afinazeytin.com/blog", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-11-10" },
      ...blogPosts.map(post => ({ url: `https://afinazeytin.com/blog/${post.slug}`, changeFrequency: "monthly", priority: 0.5, lastModified: "2026-11-10" })),
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
