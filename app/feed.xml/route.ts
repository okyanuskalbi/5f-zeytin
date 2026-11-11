import { siteIdentity } from "@/lib/site/identity";
import { blogPosts } from "@/lib/blog/posts";

export const dynamic = "force-static";
const xml = (value: string) => value.replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

/** Preserve the source-dated homepage revision alongside the authored blog entries. */
export function GET(): Response {
  const origin = siteIdentity.origin;
  const homeUpdated = `${siteIdentity.contentUpdated}T00:00:00Z`;
  const updated = `${[siteIdentity.contentUpdated, ...blogPosts.map(post => post.updated)].sort().at(-1)}T00:00:00Z`;
  const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="tr">
  <id>${origin}/</id><title>${xml(siteIdentity.name)} içerik güncellemeleri</title>
  <link href="${origin}/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${origin}/"/><updated>${updated}</updated>
  <author><name>${xml(siteIdentity.name)}</name></author>
  <entry><id>${origin}/#guncelleme-${siteIdentity.contentUpdated}</id>
    <title>AFİNA ZEYTİN: üretim yeri, ürünler ve kurumsal talep</title>
    <link href="${origin}/"/><updated>${homeUpdated}</updated>
    <summary>${xml(siteIdentity.description)}</summary>
  </entry>
  ${blogPosts.map(post => `<entry>
    <id>${origin}/blog/${xml(post.slug)}</id><title>${xml(post.title)}</title>
    <link href="${origin}/blog/${xml(post.slug)}"/>
    <published>${post.date}T00:00:00Z</published><updated>${post.updated}T00:00:00Z</updated>
    <author><name>AFİNA ZEYTİN</name></author><summary>${xml(post.excerpt)}</summary>
  </entry>`).join("\n  ")}
</feed>`;
  return new Response(body, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
