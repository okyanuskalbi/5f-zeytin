// @vitest-environment node
import { expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import config from "@/next.config";
import { GET } from "@/app/llms.txt/route";
import { GET as full } from "@/app/llms-full.txt/route";

it("discovers both editorial pages while keeping catalogue prices outside the sitemap", async () => {
  const urls = sitemap().map(item => item.url);
  expect(urls).toEqual(expect.arrayContaining(["https://afinazeytin.com/hakkimizda", "https://afinazeytin.com/toptan-satis"]));
  expect(urls.some(url => /\/urun(?:ler)?(?:\/|$)/.test(url))).toBe(false);
  for (const response of [await GET(), await full()]) {
    const text = await response.text();
    expect(text).toContain("https://afinazeytin.com/hakkimizda");
    expect(text).toContain("https://afinazeytin.com/toptan-satis");
    expect(text).not.toMatch(/https:\/\/afinazeytin\.com\/#(?:teklif|toptan|tesisimiz|sik-sorulanlar|iletisim)/);
  }
});

it("permanently redirects the legacy quote query before old shop/product query aliases", async () => {
  expect((await config.redirects?.())?.[0]).toEqual({ source: "/", has: [{ type: "query", key: "teklif" }], destination: "/toptan-satis", permanent: true });
});
