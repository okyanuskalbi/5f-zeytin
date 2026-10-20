import { expect, test, type Locator } from "@playwright/test";

const glyphSample = "İŞĞÜÖÇ ışğüöç ₺1.250,00";

async function expectFont(element: Locator, family: string, weight: string): Promise<void> {
  await expect(element).toHaveCSS("font-family", new RegExp(family, "i"));
  await expect(element).toHaveCSS("font-weight", weight);
  expect(await element.evaluate(async (node) => {
    const style = getComputedStyle(node);
    const faces = await document.fonts.load(`${style.fontStyle} ${style.fontWeight} 24px ${style.fontFamily}`, node.textContent ?? "");
    return faces.length > 0 && faces.every((face) => face.status === "loaded");
  })).toBe(true);
}

test("brand typography uses Fraunces headings with Figtree copy and tabular prices", async ({ page }) => {
  await page.goto("/");
  const title = page.getByRole("heading", { level: 1 });
  const headline = page.locator("#hero-title");
  const subtitle = page.getByRole("contentinfo").getByText("Toprağın sunduğu lezzet, Afina’nın özeniyle.", { exact: true });
  for (const heading of [title, headline, page.locator("#urunler").getByRole("heading", { name: "Sofralık Zeytin", exact: true })]) {
    await expectFont(heading, "Fraunces", "500");
    await expect(heading).toHaveCSS("font-variation-settings", '"SOFT" 50');
    await expect(heading).toHaveCSS("font-optical-sizing", "auto");
  }
  await expectFont(subtitle, "Figtree", "400");
  await expectFont(page.locator("body"), "Figtree", "400");
  await expectFont(page.getByRole("region", { name: "Afina Zeytin", exact: true }).getByRole("link", { name: "Ürünleri keşfet", exact: true }), "Figtree", "600");
  await expectFont(page.getByText("Adet", { exact: true }).first(), "Figtree", "600");
  const prices = page.locator("#urunler article .tabular-nums").filter({ hasText: "₺" });
  await expect(prices).toHaveCount(3);
  for (const price of await prices.all()) {
    await expectFont(price, "Figtree", "600");
    await expect(price).toHaveCSS("font-variant-numeric", "tabular-nums");
    // Equal advance widths prove the font's tabular feature works, beyond CSS.
    const widths = await price.evaluate((node) => Array.from("0123456789", (digit) => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.textContent = digit;
      node.append(span);
      const width = span.getBoundingClientRect().width;
      span.remove();
      return width;
    }));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Turkish glyphs and lira render from self-hosted fonts in every brand style", async ({ page, browserName }, testInfo) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await page.evaluate(async (sample) => {
    const panel = document.createElement("section");
    panel.id = "font-glyph-probes";
    panel.style.cssText = "padding:16px;overflow-wrap:anywhere";
    for (const [index, [variable, weight, fontStyle]] of [
      ["--font-display", "500", "normal"], ["--font-display", "400", "italic"],
      ["--font-body", "400", "normal"], ["--font-body", "600", "normal"],
      ["--font-display", "700", "normal"], ["--font-body", "800", "normal"],
    ].entries()) {
      const probe = document.createElement("p");
      probe.id = `font-glyph-${index}`;
      probe.style.cssText = `font-family:var(${variable});font-weight:${weight};font-style:${fontStyle};font-size:24px;font-variation-settings:"SOFT" 50`;
      const [letters, amount] = sample.split("₺");
      for (const [part, text] of [["letters", letters], ["currency", "₺"], ["amount", amount]]) {
        const span = document.createElement("span");
        span.id = `font-glyph-${index}-${part}`;
        span.textContent = text;
        probe.append(span);
      }
      panel.append(probe);
    }
    document.querySelector("main")!.prepend(panel);
    await document.fonts.ready;
  }, glyphSample);
  const probes = page.locator("#font-glyph-probes p");
  await expect(probes).toHaveCount(6);
  for (let index = 0; index < 6; index++) {
    await expect(probes.nth(index)).toHaveText(glyphSample);
    await expectFont(probes.nth(index), index < 2 || index === 4 ? "Fraunces" : "Figtree", ["500", "400", "400", "600", "700", "800"][index]);
  }
  if (browserName === "chromium") {
    // Inspect painted fonts, since CSS alone can hide missing glyphs. Figtree
    // has no ₺ glyph; the retained fallback stack must render that symbol.
    const session = await page.context().newCDPSession(page);
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const { root } = await session.send("DOM.getDocument");
    const evidence = [];
    for (let index = 0; index < 6; index++) {
      for (const part of ["letters", "currency", "amount"]) {
        const { nodeId } = await session.send("DOM.querySelector", { nodeId: root.nodeId, selector: `#font-glyph-${index}-${part}` });
        const { fonts } = await session.send("CSS.getPlatformFontsForNode", { nodeId });
        evidence.push({ index, part, fonts });
        expect(fonts.length).toBeGreaterThan(0);
        for (const font of fonts) {
          expect(font.glyphCount).toBeGreaterThan(0);
          if ([2, 3, 5].includes(index) && part === "currency") {
            expect(font.familyName).toMatch(/Figtree|Helvetica Neue|Arial/i);
          } else {
            expect(font.isCustomFont).toBe(true);
            expect(font.familyName).toMatch(index < 2 || index === 4 ? /Fraunces/i : /Figtree/i);
          }
        }
      }
    }
    await testInfo.attach("rendered-fonts", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
    await session.detach();
  }
  const fontRequests = requests.filter((url) => /\.woff2(?:\?|$)/.test(url));
  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) {
    expect(new URL(url).origin).toBe(new URL(page.url()).origin);
    expect(new URL(url).pathname).toMatch(/^\/_next\/static\/media\//);
  }
  expect(requests.some((url) => /fonts\.(googleapis|gstatic)\.com/.test(url))).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("brand-fonts.png"), fullPage: true });
});

test("fallback stacks keep Turkish content and actions readable when font files fail", async ({ page }) => {
  await page.route("**/*.woff2", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByText("Toprağın sunduğu lezzet, Afina’nın özeniyle.", { exact: true })).toBeVisible();
  await page.getByRole("region", { name: "Afina Zeytin", exact: true }).getByRole("link", { name: "Ürünleri keşfet", exact: true }).click();
  await expect(page.locator("#urunler")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
