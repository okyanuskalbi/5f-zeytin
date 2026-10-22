import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import Home from "@/app/page";
import { Footer } from "@/components/site/Footer";
import { verifiedFaqs } from "@/components/landing/Faq";
// @ts-expect-error The gate is a standalone Node ESM script.
import { verifyV4Html, verifyV4Assets, verifyV4Runtime } from "../../scripts/verify-v4-page.mjs";
// @ts-expect-error The report is a standalone Node ESM script.
import { summarizeBundle } from "../../scripts/report-bundle.mjs";

async function pageHtml(): Promise<string> {
  return renderToStaticMarkup(<>{await Home()}<Footer /></>);
}

describe("v4 offline quality gate", () => {
  let awaitableHtml: string;
  beforeAll(async () => { awaitableHtml = await pageHtml(); });
  it("accepts the real SSR, all approved media budgets and the runtime source tree", async () => {
    expect(verifyV4Html(await pageHtml())).toMatchObject({ cards: 6, steps: 3, faqs: 3, previewNotes: 1 });
    expect(await verifyV4Assets()).toMatchObject({ products: 6, heroDesktopBudget: 180000, heroMobileBudget: 120000, productBudget: 60000 });
    await expect(verifyV4Runtime()).resolves.toBeUndefined();
  });

  it("counts the visible preview note once when Next repeats it in inline RSC data", async () => {
    const html = await pageHtml();
    expect(verifyV4Html(html + '<script>self.__next_f.push("Önizleme: fiyatlar ve görseller temsilidir.")</script>')).toMatchObject({ previewNotes: 1 });
  });

  it.each([
    ["missing hero preload", (html: string) => html.replaceAll('rel="preload"', 'rel="unused"')],
    ["missing card", (html: string) => html.replace('data-product-id=', 'data-unused=')],
    ["missing step", (html: string) => html.replace('data-story-step=', 'data-unused=')],
    ["duplicate preview note", (html: string) => html + "<p>Önizleme: fiyatlar ve görseller temsilidir.</p>"],
    ["missing anchor", (html: string) => html.replace('id="urunler"', 'id="unused"')],
    ["unsized image", (html: string) => html.replace(/width="\d+"/, "")],
    ["eager non-hero image", (html: string) => html.replace('loading="lazy"', 'loading="eager"')],
    ["raw PNG", (html: string) => html.replace(/src="\/images\/v3\/[^\"]+\.webp"/, 'src="/images/raw.png"')],
  ])("rejects %s", async (_name, mutate) => {
    expect(() => verifyV4Html(mutate(awaitableHtml))).toThrow();
  });

  it.each([
    ["lazy hero card", "[data-hero-card] img", "loading", "lazy"],
    ["low-priority hero card", "[data-hero-card] img", "fetchpriority", "auto"],
    ["mismatched preload sizes", 'link[rel="preload"][as="image"]', "imagesizes", "1px"],
    ["high-priority below-fold image", "article[data-product-id] img", "fetchpriority", "high"],
    ["missing mobile density candidates", '[data-hero-card] source[type="image/avif"]', "srcset", "/images/v3/urun-01-kirma-10kg-w72.avif 72w"],
  ])("rejects %s", (_name, selector, attribute, value) => {
    const doc = new DOMParser().parseFromString(awaitableHtml, "text/html");
    doc.querySelector(selector)!.setAttribute(attribute, value);
    expect(() => verifyV4Html(doc.documentElement.outerHTML)).toThrow();
  });

  it("rejects a missing card preload even when the background preloads remain", () => {
    const doc = new DOMParser().parseFromString(awaitableHtml, "text/html");
    doc.querySelector('link[imagesizes="(max-width: 900px) 72px, 96px"]')?.remove();
    expect(() => verifyV4Html(doc.documentElement.outerHTML)).toThrow();
  });
  it("keeps one h1 and no skipped heading levels, with labelled sections", async () => {
    const doc = new DOMParser().parseFromString(await pageHtml(), "text/html");
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    let previous = 0;
    for (const heading of doc.querySelectorAll("h1,h2,h3")) {
      const level = Number(heading.tagName.slice(1));
      expect(level, heading.textContent ?? "").toBeLessThanOrEqual(previous + 1);
      previous = level;
    }
    for (const section of doc.querySelectorAll("section")) {
      const label = section.getAttribute("aria-labelledby");
      expect(label).toBeTruthy();
      expect(doc.getElementById(label!)?.textContent).toBeTruthy();
    }
  });

  it("publishes only the three visible questions as FAQPage and no sample offers", async () => {
    const doc = new DOMParser().parseFromString(await pageHtml(), "text/html");
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!));
    expect(schemas.find(schema => schema["@type"] === "FAQPage")?.mainEntity).toEqual(verifiedFaqs.map(faq => ({
      "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })));
    expect(JSON.stringify(schemas)).not.toMatch(/"(?:Product|Offer|offers)"/);
  });

  it("counts unique initial scripts, CSS, and only eager non-hero images", async () => {
    const files: Record<string, Buffer> = {
      "/_next/static/a.js": Buffer.from("a".repeat(1000)),
      "/_next/static/a.css": Buffer.from("body{color:green}"),
      "/logo.svg": Buffer.from("<svg/>"),
    };
    const report = await summarizeBundle('<script src="/_next/static/a.js"></script><script src="/_next/static/a.js"></script><script noModule src="legacy.js"></script><link rel="stylesheet" href="/_next/static/a.css"><img src="/logo.svg"><img loading="lazy" src="/lazy.webp"><div data-hero-photo><img src="/hero.webp"></div>', async (path: string) => files[path]);
    expect(report.initialScripts).toHaveLength(1);
    expect(report.total.bytes).toBe(1000);
    expect(report.initialImages).toEqual([{ src: "/logo.svg", bytes: 6 }]);
    expect(report.initialTransferBytes).toBe(report.total.gzipBytes + report.css.gzipBytes + 6);
  });
});
