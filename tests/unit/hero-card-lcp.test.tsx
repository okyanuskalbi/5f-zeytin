import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/landing/Hero";
// @ts-expect-error The report is a standalone Node ESM script.
import { verifyBundleBudget } from "../../scripts/report-bundle.mjs";

const cardSizes = "(max-width: 900px) 72px, 96px";
const media = ["(max-width: 900px)", "(min-width: 901px)"];
const variants = [[72, 144, 216], [96, 192, 288]];
const widths = (srcset: string): number[] => srcset.split(",").map(candidate => Number(candidate.trim().match(/ (\d+)w$/)?.[1]));
function heroDocument(): Document {
  return new DOMParser().parseFromString(renderToStaticMarkup(<Hero />), "text/html");
}

describe("hero purchase card LCP", () => {
  it("discovers the card eagerly with high priority and asynchronous decoding", () => {
    const card = heroDocument().querySelector("[data-hero-card] img")!;
    expect(card.getAttribute("loading")).toBe("eager");
    expect(card.getAttribute("fetchpriority")).toBe("high");
    expect(card.getAttribute("decoding")).toBe("async");
    expect(card.getAttribute("sizes")).toBe(cardSizes);
  });

  it("offers correctly sized 1x/2x/3x mobile and desktop candidates in both formats", async () => {
    const picture = heroDocument().querySelector("[data-hero-card] picture")!;
    const sources = [...picture.querySelectorAll("source"), picture.querySelector("img")!];
    expect(sources).toHaveLength(4);
    for (const [index, element] of sources.entries()) {
      expect(widths(element.getAttribute("srcset")!)).toEqual(variants[index < 2 ? 0 : 1]);
      expect(element.getAttribute("sizes")).toBe(cardSizes);
      for (const candidate of element.getAttribute("srcset")!.split(",")) {
        const [file, descriptor] = candidate.trim().split(/\s+/);
        const metadata = await sharp(await readFile(resolve(process.cwd(), `public${file}`))).metadata();
        expect(metadata.width).toBe(Number(descriptor.slice(0, -1)));
        expect(metadata.hasAlpha).toBe(true);
      }
    }
  });

  it("preloads only the background and card with the same responsive sources", () => {
    const doc = heroDocument();
    const preloads = [...doc.querySelectorAll('link[rel="preload"][as="image"]')];
    expect(preloads).toHaveLength(4);
    for (const selector of ["[data-hero-photo]", "[data-hero-card]"]) {
      const sources = [...doc.querySelectorAll(`${selector} source[type="image/avif"]`)];
      expect(sources).toHaveLength(2);
      for (const [index, source] of sources.entries()) {
        const matches = preloads.filter(preload => preload.getAttribute("imagesrcset") === source.getAttribute("srcset"));
        expect(matches).toHaveLength(1);
        expect(matches[0].getAttribute("media")).toBe(media[index]);
        expect(matches[0].getAttribute("imagesizes")).toBe(source.getAttribute("sizes"));
        expect(matches[0].getAttribute("fetchpriority")).toBe("high");
        expect(matches[0].getAttribute("type")).toBe("image/avif");
      }
    }
    expect(doc.querySelectorAll('img[loading="eager"]')).toHaveLength(5);
  });
});

describe("first-load transfer budgets", () => {
  const report = (gzipBytes: number, transferBytes = 450_000) => ({
    total: { gzipBytes }, initialTransferBytes: transferBytes - 10_000, inlineScripts: { gzipBytes: 10_000 },
  });
  it("accepts 200000 bytes gzip and includes inline scripts in the unchanged transfer limit", () => {
    expect(() => verifyBundleBudget(report(200_000))).not.toThrow();
  });
  it("rejects a byte above either budget", () => {
    expect(() => verifyBundleBudget(report(200_001))).toThrow(/200000 bytes gzip/);
    expect(() => verifyBundleBudget(report(200_000, 450_001))).toThrow(/450000 bytes/);
  });
});
