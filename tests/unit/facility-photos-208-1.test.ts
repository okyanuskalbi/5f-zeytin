import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

// Task208-1: on a phone the three facility photographs stack, each as wide as the content.
const css = readFileSync("components/storefront/StoreHome.module.css", "utf8");
const home = readFileSync("components/storefront/StoreHome.tsx", "utf8");
const block = (query: string): string => {
  const start = css.indexOf(`@media ${query} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("\n}", start));
};
const facilityRules = (source: string): string[] => source.split("\n").map(line => line.trim()).filter(line => line.startsWith(".facilityPhoto"));

it("stacks the facility photographs in one column of low landscape cards on a phone", () => {
  expect(facilityRules(block("(max-width: 767px)"))).toEqual([
    ".facilityPhotos { grid-template-columns: minmax(0, 1fr); gap: 12px; }",
    ".facilityPhoto { aspect-ratio: 16 / 10; }",
    ".facilityPhoto::after { background: linear-gradient(to top, rgba(26, 43, 30, .9), rgba(26, 43, 30, .74) 26%, rgba(26, 43, 30, 0) 64%); }",
  ]);
});

it("keeps the 22 px caption and its 16 px inset on every phone: no leftovers of the three-column row", () => {
  expect(facilityRules(block("(max-width: 359px)"))).toEqual([]);
  expect(css).not.toMatch(/\.facilityPhoto figcaption \{[^}]*font-size: 1[0-9]px/);
  expect(css.match(/\.facilityPhoto figcaption \{/g)).toHaveLength(1);
});

it("leaves the tablet and desktop rules as they were", () => {
  const before = css.slice(0, css.indexOf("@media (max-width: 767px) {"));
  expect(facilityRules(before)).toEqual([
    ".facilityPhotos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }",
    ".facilityPhoto { position: relative; aspect-ratio: 3 / 4; overflow: hidden; min-width: 0; margin: 0; border-radius: var(--sf-radius-card); background: var(--sf-green-deep); }",
    ".facilityPhoto picture { position: absolute; inset: 0; }",
    ".facilityPhoto img { width: 100%; height: 100%; object-fit: cover; }",
    '.facilityPhoto::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(26, 43, 30, .55), rgba(26, 43, 30, 0) 38%), var(--sf-overlay); pointer-events: none; }',
    ".facilityPhoto figcaption { position: absolute; z-index: 1; inset: auto 16px 16px; font-family: var(--font-display); font-size: 22px; font-weight: 600; line-height: 1.1; color: var(--sf-ivory); }",
    ".facilityPhoto { aspect-ratio: 4 / 3; }",
    ".facilityPhoto::after { background: linear-gradient(to top, rgba(26, 43, 30, .92), rgba(26, 43, 30, .78) 46%, rgba(26, 43, 30, 0) 90%); }",
  ]);
});

it("asks for a rendition as wide as the stacked card on a phone and keeps the wider breakpoints", () => {
  expect(home).toContain('sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1375px) 20vw, 250px"');
});
