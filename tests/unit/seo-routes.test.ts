import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

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
          "/siparis-takip",
          "/__demo",
          "/%5F%5Fdemo",
        ],
      },
      sitemap: "https://afinazeytin.com/sitemap.xml",
    });
  });

  it("lists only the homepage, excluding noindex and product query URLs, with the build date", () => {
    const buildDate = new Date("2026-10-22T12:00:00.000Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(buildDate);

    expect(sitemap()).toEqual([
      {
        url: "https://afinazeytin.com/",
        changeFrequency: "weekly",
        priority: 1,
        lastModified: buildDate,
      },
    ]);
  });
});
