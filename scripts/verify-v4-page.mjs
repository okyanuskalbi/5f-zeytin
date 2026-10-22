import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import { reportBundle, verifyBundleBudget } from "./report-bundle.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const retired = /Pantry\w*|KraftTag|kiler-duvar|raf-ceviz|kraft-doku|kargo-kolisi/;
export function verifyV4Html(html) {
  const dom = new JSDOM(html);
  try {
    const doc = dom.window.document;
    const preloads = [...doc.querySelectorAll('link[rel="preload"][as="image"]')];
    assert.equal(preloads.length, 4, "Only media-matched background and hero card preloads are allowed");
    const photo = doc.querySelector("[data-hero-photo]");
    assert.equal(photo?.querySelectorAll("img").length, 1, "Hero must have one img");
    const hero = photo.querySelector("img");
    const card = doc.querySelector("[data-hero-card]");
    assert.equal(card?.querySelectorAll("img").length, 1, "Hero card must have one img");
    const cardImage = card.querySelector("img");
    const mobileMedia = "(max-width: 900px)";
    const desktopMedia = "(min-width: 901px)";
    for (const container of [photo, card]) {
      const image = container.querySelector("img");
      assert.equal(image.getAttribute("fetchpriority"), "high");
      assert.equal(image.getAttribute("loading"), "eager");
      const sources = [...container.querySelectorAll('source[type="image/avif"]')];
      assert.equal(sources.length, 2, "Mobile and desktop AVIF sources required");
      assert.equal(sources[0].media, mobileMedia);
      assert.equal(sources[1].media, "");
      for (const [index, source] of sources.entries()) {
        const matching = preloads.filter(preload => preload.getAttribute("imagesrcset") === source.srcset);
        assert.equal(matching.length, 1, "Each hero source must have exactly one matching preload");
        const preload = matching[0];
        assert.equal(preload.media, index === 0 ? mobileMedia : desktopMedia);
        assert.equal(preload.getAttribute("imagesizes"), source.sizes, "Preload must reuse picture sizes");
        assert.equal(preload.getAttribute("fetchpriority"), "high");
        assert.equal(preload.type, "image/avif");
      }
    }
    const cardSources = [...card.querySelectorAll("source"), cardImage];
    assert.equal(cardSources.length, 4, "AVIF/WebP card sources required for both viewports");
    for (const [index, source] of cardSources.entries()) {
      assert.equal(source.getAttribute("sizes"), "(max-width: 900px) 72px, 96px");
      const candidates = source.getAttribute("srcset").split(",").map(candidate => candidate.trim());
      const widths = index < 2 ? [72, 144, 216] : [96, 192, 288];
      const format = index === 1 || index === 3 ? "webp" : "avif";
      assert.deepEqual(candidates, widths.map(width => `/images/v3/urun-01-kirma-10kg-w${width}.${format} ${width}w`), "Hero card density candidates must match their real widths");
    }
    const cards = doc.querySelectorAll("article[data-product-id]").length;
    const steps = doc.querySelectorAll("[data-story-step]").length;
    const faqs = doc.querySelectorAll("[data-faq]").length;
    assert.equal(cards, 6, "Six product cards required");
    assert.equal(steps, 3, "Three story steps required");
    assert.equal(faqs, 3, "Three visible FAQs required");
    for (const id of ["ana-icerik", "urunler", "kiler", "tesisimiz", "toptan-iletisim", "sik-sorulanlar"]) {
      if (id === "ana-icerik" && !doc.querySelector("html[lang]")) continue; // Home-only unit SSR omits the layout.
      assert.equal(doc.querySelectorAll(`[id="${id}"]`).length, 1, `Missing/duplicate anchor: ${id}`);
    }
    const visibleCopy = doc.body.cloneNode(true);
    visibleCopy.querySelectorAll("script, style").forEach(node => node.remove());
    const previewNotes = (visibleCopy.textContent.match(/Önizleme: fiyatlar ve görseller temsilidir\./g) ?? []).length;
    assert.equal(previewNotes, 1, "Exactly one preview note required");
    for (const image of doc.querySelectorAll("img")) {
      assert(Number(image.getAttribute("width")) > 0 && Number(image.getAttribute("height")) > 0, "Every image needs width/height");
      assert(image.hasAttribute("alt"), "Every image needs alt");
      assert.equal(image.getAttribute("decoding"), "async");
      if (image !== hero && image !== cardImage) {
        assert.equal(image.getAttribute("loading"), "lazy", "Non-hero image must be lazy");
        assert.notEqual(image.getAttribute("fetchpriority"), "high", "Non-hero image must not have high priority");
      }
      assert(!/\.png(?:\?|$)/i.test(image.src), "No raw PNG in runtime HTML");
    }
    assert(!retired.test(doc.body.innerHTML), "Retired pantry media in HTML");
    const questions = [...doc.querySelectorAll("[data-faq]")].map(node => ({
      "@type": "Question", name: node.querySelector("summary").textContent.trim(),
      acceptedAnswer: { "@type": "Answer", text: node.querySelector("[data-faq-answer]").textContent.trim() },
    }));
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
    assert.deepEqual(schemas.find(schema => schema["@type"] === "FAQPage")?.mainEntity, questions, "FAQPage must match visible answers");
    assert(schemas.some(schema => schema["@graph"]?.some(item => item["@type"] === "Organization")), "BusinessJsonLd required");
    assert(!/"(?:Product|Offer|offers)"/.test(JSON.stringify(schemas)), "Sample prices must not become offers");
    return { cards, steps, faqs, previewNotes };
  } finally { dom.window.close(); }
}

export async function verifyV4Assets({ root = repoRoot } = {}) {
  const manifest = JSON.parse(await readFile(resolve(root, "public/images/v3/manifest.json"), "utf8"));
  const products = Object.keys(manifest.assets).filter(key => key.startsWith("urun-"));
  assert.equal(products.length, 6);
  const limits = { "hero-masaustu": 180000, "hero-mobil": 120000, ...Object.fromEntries(products.map(key => [key, 60000])) };
  const assets = [];
  for (const [key, budget] of Object.entries(limits)) {
    const asset = manifest.assets[key];
    assert.deepEqual([...new Set(asset.outputs.map(output => output.format))].sort(), ["avif", "webp"]);
    for (const output of asset.outputs) {
      assert(/\.(?:avif|webp)$/.test(output.file));
      const bytes = await readFile(resolve(root, `public${output.file}`));
      assert.equal(bytes.length, output.bytes);
      assert(bytes.length <= budget, `${key}: ${bytes.length} > ${budget} bytes`);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), output.sha256);
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.width, output.width);
      assert.equal(metadata.height, output.height);
    }
    assets.push({ key, maxBytes: Math.max(...asset.outputs.map(output => output.bytes)), budget });
  }
  return { products: products.length, heroDesktopBudget: 180000, heroMobileBudget: 120000, productBudget: 60000, assets };
}

export async function verifyV4Runtime({ root = repoRoot } = {}) {
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (/\.(?:tsx?|css|json)$/.test(entry.name)) {
        const content = await readFile(file, "utf8");
        assert(!retired.test(content), `Retired pantry reference in ${file}`);
        assert(!content.includes('@/public/images/v3/manifest.json'), `Full approval manifest in runtime: ${file}`);
      }
    }
  }
  for (const directory of ["app", "components", "lib"]) await walk(resolve(root, directory));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const html = await readFile(resolve(repoRoot, ".next/server/app/index.html"), "utf8");
    const page = verifyV4Html(html);
    const assets = await verifyV4Assets();
    await verifyV4Runtime();
    const bundle = await reportBundle();
    console.log(JSON.stringify({ page, assets, bundle: { firstLoadJsGzipBytes: bundle.total.gzipBytes, initialTransferBytes: bundle.initialTransferBytes + bundle.inlineScripts.gzipBytes }, browser: "Claude doğrulayacak: Lighthouse >=85, LCP <2.5s, CLS <0.1, font CLS <=0.02, A11y >=95" }, null, 2));
    verifyBundleBudget(bundle);
    console.log("PASS: v4 SSR, approved assets and 200000-byte first-load JS gzip budget.");
  } catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
