// @vitest-environment node
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import config from "@/next.config";
import { blogPosts } from "@/lib/blog/posts";

describe("Task208 redirects", () => {
  it("sends the six retired addresses to their section with a permanent redirect and keeps the hash", async () => {
    const redirects = await config.redirects?.();
    for (const [source, destination] of [
      ["/urunler", "/#urunler"],
      ["/urunler/:kategori", "/?kategori=:kategori#urunler"],
      ["/hakkimizda", "/#hikayemiz"],
      ["/toptan-satis", "/?sekme=toptan#toptan-bayilik"],
      ["/bayilik", "/?sekme=bayilik#toptan-bayilik"],
      ["/blog", "/#blog"],
    ]) expect(redirects).toContainEqual({ source, destination, permanent: true });
  });

  it("drops the home query rules that would loop with the new redirects", async () => {
    const redirects = await config.redirects?.() ?? [];
    const keys = redirects.flatMap(rule => rule.has?.map(item => "key" in item ? item.key : "") ?? []);
    expect(keys).not.toContain("teklif");
    expect(keys).not.toContain("magaza");
  });

  it("keeps product and article pages in the sitemap and removes the retired pages", () => {
    const urls = sitemap().map(entry => entry.url);
    expect(urls).toContain("https://afinazeytin.com/");
    for (const post of blogPosts) expect(urls.some(url => url.endsWith(`/blog/${post.slug}`))).toBe(true);
    for (const path of ["/urunler", "/hakkimizda", "/toptan-satis", "/bayilik", "/blog"]) expect(urls.some(url => url.endsWith(path))).toBe(false);
  });
});
