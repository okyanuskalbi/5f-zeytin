// @vitest-environment node
import { expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import config from "@/next.config";
import { GET } from "@/app/llms.txt/route";
import { GET as full } from "@/app/llms-full.txt/route";

// Task208: the editorial pages are sections of the home page now.
it("points discovery at the home sections while keeping catalogue prices and retired pages outside the sitemap", async () => {
  const urls = sitemap().map(item => item.url);
  expect(urls).toContain("https://afinazeytin.com/");
  expect(urls.some(url => /\/(?:urun(?:ler)?|hakkimizda|toptan-satis|bayilik)(?:\/|$)/.test(url))).toBe(false);
  for (const response of [await GET(), await full()]) {
    const text = await response.text();
    expect(text).toContain("https://afinazeytin.com/#hikayemiz");
    expect(text).toContain("https://afinazeytin.com/?sekme=toptan#toptan-bayilik");
    expect(text).not.toMatch(/https:\/\/afinazeytin\.com\/(?:urunler|hakkimizda|toptan-satis|bayilik|blog)(?:[)#\s]|$)/m);
  }
});

it("answers the legacy quote query on the home page instead of redirecting it", async () => {
  const redirects = await config.redirects?.() ?? [];
  expect(redirects.some(rule => rule.has?.some(condition => condition.type === "query" && condition.key === "teklif"))).toBe(false);
  expect(redirects).toContainEqual({ source: "/toptan-satis", destination: "/?sekme=toptan#toptan-bayilik", permanent: true });
});
