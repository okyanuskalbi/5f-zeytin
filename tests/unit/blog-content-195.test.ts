import { expect, it } from "vitest";
import { blogPosts } from "@/lib/blog/posts";
import photos from "@/lib/media/classic-photos.json";

const expectedSlugs = ["salamura-zeytin-nasil-hazirlanir", "kirma-zeytin-nedir-nasil-saklanir", "naturel-sizma-zeytinyagi-nasil-saklanmali", "sofralik-zeytin-secerken-nelere-dikkat-edilmeli"];
it("keeps the four approved preview addresses and existing approved cover photographs", () => {
  expect(blogPosts.map(post => post.slug)).toEqual(expectedSlugs);
  expect(new Set(blogPosts.map(post => post.slug)).size).toBe(4);
  for (const post of blogPosts) {
    expect(photos.assets[post.imageKey]).toBeDefined();
    expect(post.date).toBe("2026-11-10");
    expect(post.readingMinutes).toBeGreaterThan(0);
    expect(post.categoryHref).toBe(`/urunler/${post.category}`);
  }
});

it.each(expectedSlugs)("provides an original readable 400–700 word article for %s without unsupported claims or a precise preservation recipe", slug => {
  const post = blogPosts.find(post => post.slug === slug)!;
  expect(post.sections?.length).toBeGreaterThanOrEqual(4);
  const text = post.sections.map(section => [section.heading, ...section.paragraphs, ...(section.items ?? [])].join(" ")).join(" ");
  const words = text.trim().split(/\s+/u);
  expect(words.length).toBeGreaterThanOrEqual(400);
  expect(words.length).toBeLessThanOrEqual(700);
  expect(post.sections.some(section => section.items && section.items.length >= 3)).toBe(true);
  for (const section of post.sections) {
    expect(section.heading.trim()).toBeTruthy();
    expect(section.paragraphs.length).toBeGreaterThan(0);
  }
  expect(JSON.stringify(post)).not.toMatch(/tedavi|iyileştirir|kanser|kolesterol|%|Ayvalık|Köklü|mucize|detoks|bağışıklık|hastalık/iu);
  expect(text).not.toMatch(/\d|https?:\/\//u);
  expect(text).toMatch(/etiket|üreticinin|ambalaj/iu);
});
