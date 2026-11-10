// @vitest-environment node
import { expect, it } from "vitest";
import { verifiedFaqs } from "@/lib/site/faqs";
import { siteIdentity } from "@/lib/site/identity";
import { GET as fullText } from "@/app/llms-full.txt/route";
import { GET as updates } from "@/app/feed.xml/route";

it("publishes the same verified answers and meaningful purchase paths without offers or invented claims", async () => {
  const response = await fullText();
  const body = await response.text();
  expect(response.headers.get("content-type")).toContain("text/markdown");
  for (const faq of verifiedFaqs) expect(body).toContain(faq.answer);
  for (const path of ["/#urunler", "/toptan-satis", "/hakkimizda#tesisimiz"]) expect(body).toContain(`${siteIdentity.origin}${path}`);
  expect(body).toContain("Gönderimi e-posta uygulamanızda siz tamamlarsınız.");
  expect(body).not.toMatch(/₺|\bTRY\b|%100|garantili|5 yıldız|<script/i);
});

it("describes one real homepage revision in the update feed with a stable source date", async () => {
  const response = updates();
  const body = await response.text();
  expect(response.headers.get("content-type")).toContain("application/atom+xml");
  expect(body).toContain('xmlns="http://www.w3.org/2005/Atom"');
  expect(body.match(/<entry>/g)).toHaveLength(1);
  expect(body).toContain(`<updated>${siteIdentity.contentUpdated}T00:00:00Z</updated>`);
  expect(body).toContain(`<summary>${siteIdentity.description}</summary>`);
  expect(body).toContain(`href="${siteIdentity.origin}/"`);
  expect(body).not.toContain("<Person>");
});
