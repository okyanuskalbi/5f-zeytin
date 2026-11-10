// @vitest-environment jsdom
import { expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { GET as discovery } from "@/app/llms.txt/route";
import { GET as feed } from "@/app/feed.xml/route";
import { blogPosts } from "@/lib/blog/posts";
import { siteIdentity } from "@/lib/site/identity";

it("discovers the blog and every working article without publishing catalogue prices in the sitemap", async () => {
  const urls = sitemap().map(item => item.url);
  expect(urls).toContain(`${siteIdentity.origin}/blog`);
  expect(urls.some(url => /\/urun(?:ler)?(?:\/|$)/.test(url))).toBe(false);
  const text = await (await discovery()).text();
  for (const post of blogPosts) {
    const url = `${siteIdentity.origin}/blog/${post.slug}`;
    expect(urls).toContain(url);
    expect(text).toContain(`[${post.title}](${url})`);
  }
});

it("serves valid Atom with four dated articles and the existing original homepage revision", () => {
  const response = feed();
  expect(response.headers.get("content-type")).toContain("application/atom+xml");
  return response.text().then(xml => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.localName).toBe("feed");
    expect(doc.documentElement.namespaceURI).toBe("http://www.w3.org/2005/Atom");
    const entries = [...doc.querySelectorAll("entry")];
    expect(entries).toHaveLength(5);
    expect(new Set(entries.map(entry => entry.querySelector("id")?.textContent)).size).toBe(5);
    expect(entries[0].querySelector("id")?.textContent).toBe(`${siteIdentity.origin}/#guncelleme-${siteIdentity.contentUpdated}`);
    expect(entries[0].querySelector("updated")?.textContent).toBe(`${siteIdentity.contentUpdated}T00:00:00Z`);
    for (const post of blogPosts) {
      const url = `${siteIdentity.origin}/blog/${post.slug}`;
      const entry = entries.find(entry => entry.querySelector("id")?.textContent === url)!;
      expect(entry.querySelector("title")?.textContent).toBe(post.title);
      expect(entry.querySelector("link")?.getAttribute("href")).toBe(url);
      expect(entry.querySelector("published")?.textContent).toBe(`${post.date}T00:00:00Z`);
      expect(entry.querySelector("summary")?.textContent).toBe(post.excerpt);
    }
    expect(doc.documentElement.querySelector(":scope > updated")?.textContent).toBe("2026-11-10T00:00:00Z");
  });
});
