import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit, devices } from "@playwright/test";

// Local production only. These are browser/device emulations, not physical-device acceptance.
const baseURL = process.env.AUDIT_URL ?? "http://127.0.0.1:3104";
if (!["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) throw new Error("Local production required.");
const out = `test-results/097/${process.argv[2] ?? "after"}-mobile`;
await mkdir(out, { recursive: true });
const results = [];
for (const [name, engine] of [["iPhone 14", webkit], ["iPhone SE", webkit], ["Pixel 7", chromium], ["Galaxy S20", chromium]]) {
  const browser = await engine.launch();
  try {
    for (const landscape of [false, true]) {
      const profile = devices[name] ?? { ...devices["Pixel 7"], viewport: { width: 360, height: 800 },
        deviceScaleFactor: 3, userAgent: devices["Pixel 7"].userAgent.replace("Pixel 7", "SM-G981B") };
      const viewport = landscape ? { width: profile.viewport.height, height: profile.viewport.width } : profile.viewport;
      const context = await browser.newContext({ ...profile, viewport });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(baseURL);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('[data-hero-label]').getAttribute("data-static");
      await page.waitForTimeout(800);
      const id = `${name.replaceAll(" ", "-")}-${landscape ? "landscape" : "portrait"}`;
      const metrics = await page.evaluate(() => {
        const visible = node => node.checkVisibility() && !node.closest('[aria-hidden="true"], [inert]');
        const nodes = [...document.querySelectorAll("h1,h2,h3,p,a,button,label,input,textarea,span")].filter(visible);
        const headings = [...document.querySelectorAll("h1,h2,h3")].filter(visible).map(node => {
          const style = getComputedStyle(node);
          return { text: node.textContent, lines: +(node.offsetHeight / parseFloat(style.lineHeight)).toFixed(2) };
        });
        const targets = [...document.querySelectorAll("a,button,input:not([type=hidden]),textarea")].filter(visible).map(node => {
          const box = node.getBoundingClientRect();
          return { text: node.textContent?.trim() || node.getAttribute("aria-label") || node.id,
            width: +box.width.toFixed(1), height: +box.height.toFixed(1) };
        });
        return { viewport: { width: innerWidth, height: innerHeight }, minText: Math.min(...nodes.map(node => parseFloat(getComputedStyle(node).fontSize))),
          overflow: document.documentElement.scrollWidth - innerWidth, headings, smallTargets: targets.filter(box => box.width < 44 || box.height < 44),
          heroHeight: document.querySelector('[data-hero-label]').getBoundingClientRect().height,
          units: { svh: CSS.supports("height", "100svh"), dvh: CSS.supports("height", "100dvh") },
          videoCount: document.querySelectorAll("video").length };
      });
      for (const [section, selector] of [["fold", null], ["products", "#urunler"], ["facility", "#tesisimiz"], ["moments", "#topraktan-sofraya"], ["wholesale", "#toptan-iletisim"], ["footer", "footer"]]) {
        if (selector) await page.locator(selector).evaluate(node => node.scrollIntoView({ block: "start" }));
        await page.waitForTimeout(750);
        await page.screenshot({ path: `${out}/${id}-${section}.png` });
      }
      // Keyboard focus must keep the active field above the fixed duplicate cart.
      await page.locator('#toptan-iletisim input').first().focus();
      const keyboard = await page.evaluate(() => {
        const field = document.activeElement.getBoundingClientRect();
        const stub = document.querySelector('[data-hero-stub]');
        const rect = stub.getBoundingClientRect();
        return { stubVisible: stub.checkVisibility(), overlaps: stub.checkVisibility() &&
          field.left < rect.right && field.right > rect.left && field.top < rect.bottom && field.bottom > rect.top };
      });
      results.push({ device: name, engine: engine === webkit ? "webkit" : "chromium", landscape, metrics, keyboard, errors });
      await writeFile(`${out}/metrics.json`, JSON.stringify(results, null, 2));
      await context.close();
    }
  } finally { await browser.close(); }
}
await writeFile(`${out}/metrics.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map(({ device, landscape, metrics, keyboard, errors }) => ({ device, landscape,
  overflow: metrics.overflow, minText: metrics.minText, maxHeadingLines: Math.max(...metrics.headings.map(h => h.lines)),
  smallTargets: metrics.smallTargets.length, keyboard, errors })), null, 2));
