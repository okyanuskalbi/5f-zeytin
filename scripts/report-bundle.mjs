import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { JSDOM } from "jsdom";

const root = resolve(import.meta.dirname, "..");
export async function summarizeBundle(html, readAsset) {
  const dom = new JSDOM(html);
  try {
    const doc = dom.window.document;
    const scripts = new Set([...doc.querySelectorAll('script[src]:not([nomodule]), link[rel="preload"][as="script"], link[rel="modulepreload"]')]
      .map(node => node.getAttribute("src") ?? node.getAttribute("href")));
    const sizes = async src => {
      const bytes = await readAsset(src);
      return { src, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
    };
    const initialScripts = await Promise.all([...scripts].map(sizes));
    const stylesheets = await Promise.all([...new Set([...doc.querySelectorAll('link[rel="stylesheet"]')].map(node => node.getAttribute("href")))].map(sizes));
    const inlineCss = [...doc.querySelectorAll("style")].map(node => Buffer.from(node.textContent));
    const inlineJs = Buffer.from([...doc.querySelectorAll('script:not([src]):not([type="application/ld+json"])')].map(node => node.textContent).join("\n"));
    const initialImages = await Promise.all([...new Set([...doc.querySelectorAll('img:not([loading="lazy"])')]
      .filter(node => !node.closest("[data-hero-photo]"))
      .map(node => node.getAttribute("src")))].map(async src => ({ src, bytes: (await readAsset(src)).length })));
    const total = { count: initialScripts.length, bytes: initialScripts.reduce((sum, entry) => sum + entry.bytes, 0), gzipBytes: initialScripts.reduce((sum, entry) => sum + entry.gzipBytes, 0) };
    const css = {
      bytes: stylesheets.reduce((sum, entry) => sum + entry.bytes, 0) + inlineCss.reduce((sum, bytes) => sum + bytes.length, 0),
      gzipBytes: stylesheets.reduce((sum, entry) => sum + entry.gzipBytes, 0) + inlineCss.reduce((sum, bytes) => sum + gzipSync(bytes).length, 0),
    };
    return { initialScripts, total, stylesheets, css, initialImages,
      inlineScripts: { bytes: inlineJs.length, gzipBytes: inlineJs.length ? gzipSync(inlineJs).length : 0 },
      initialTransferBytes: total.gzipBytes + css.gzipBytes + initialImages.reduce((sum, entry) => sum + entry.bytes, 0),
      notes: ["First-load JS is the sum of unique executable script resources in the built SSR HTML (including script preloads); legacy noModule is excluded.",
        "Inline bootstrap/RSC data is reported separately; inline CSS is included. Initial images are eager non-hero img resources; all other media is lazy. AVIF/WebP alternatives are checked separately by verify-v4-page.",
        "Node gzip estimates are build evidence, not browser transfer or Lighthouse measurements."] };
  } finally { dom.window.close(); }
}

export async function reportBundle({ buildDirectory = resolve(root, ".next") } = {}) {
  const html = await readFile(resolve(buildDirectory, "server/app/index.html"), "utf8");
  return summarizeBundle(html, async src => {
    assert(src.startsWith("/") && !src.startsWith("//") && !src.includes(".."), `Only local build assets: ${src}`);
    return readFile(src.startsWith("/_next/") ? resolve(buildDirectory, src.slice(7)) : resolve(root, "public", src.slice(1)));
  });
}

export function verifyBundleBudget(report) {
  assert(report.total.gzipBytes <= 200000, `First-load JS ${report.total.gzipBytes} > 200000 bytes gzip`);
  assert(report.initialTransferBytes + report.inlineScripts.gzipBytes <= 450000, "Initial JS + CSS + images excluding hero > 450000 bytes");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = await reportBundle();
  console.log(JSON.stringify(report, null, 2));
  if (process.argv.includes("--check")) {
    verifyBundleBudget(report);
  }
}
