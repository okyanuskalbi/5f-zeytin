import { mkdir, writeFile } from "node:fs/promises";
import { devices, expect, test, type Page } from "@playwright/test";

const titles = ["Hasat", "Seçim", "Kırma", "Salamura", "Dolum", "Sofrada"];
const row = (page: Page) => page.getByRole("list", { name: "Süreç anları" });
const progress = (page: Page) => page.getByRole("progressbar", { name: "Süreç şeridi ilerlemesi" });

async function open(page: Page): Promise<void> {
  expect((await page.goto("/#topraktan-sofraya"))?.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  await row(page).focus();
}

async function audit(page: Page, name: string): Promise<void> {
  await mkdir("test-results/105", { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await open(page);
  const process = page.locator("#topraktan-sofraya");
  await expect(process.getByRole("listitem")).toHaveText(titles);
  await expect(process.locator("img, picture, video, canvas")).toHaveCount(0);
  await expect(page.locator("#sik-sorulanlar [data-faq]")).toHaveCount(4);
  const metrics = await page.evaluate(() => {
    const roots = ["#topraktan-sofraya", "#sik-sorulanlar", "footer"].map(selector => document.querySelector(selector)!);
    const rgb = (color: string) => color.match(/[\d.]+/g)!.map(Number);
    const luminance = (color: string) => rgb(color).slice(0, 3).map(channel => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    const background = (node: Element): string => {
      for (let current: Element | null = node; current; current = current.parentElement) {
        const color = getComputedStyle(current).backgroundColor;
        if ((rgb(color)[3] ?? 1) > 0) return color;
      }
      return "rgb(255, 255, 255)";
    };
    const text = roots.flatMap(root => [...root.querySelectorAll("h2,h3,p,address,a")])
      .filter(node => node.textContent?.trim() && node.getBoundingClientRect().height > 0)
      .map(node => {
        const style = getComputedStyle(node);
        const [high, low] = [luminance(style.color), luminance(background(node))].sort((a, b) => b - a);
        return { text: node.textContent!.trim().slice(0, 65), ratio: (high + 0.05) / (low + 0.05), size: parseFloat(style.fontSize), font: style.fontFamily };
      });
    return {
      width: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth,
      columns: getComputedStyle(roots[1].lastElementChild!).columnCount,
      padding: roots.map(root => getComputedStyle(root).paddingTop),
      footerGround: getComputedStyle(roots[2]).backgroundColor,
      headingLines: roots.flatMap(root => [...root.querySelectorAll("h2,h3")]).map(node => ({
        text: node.textContent, lines: node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight),
      })),
      text,
    };
  });
  await writeFile(`test-results/105/${name}-audit.json`, JSON.stringify({ metrics, errors }, null, 2));
  expect(metrics.overflow).toBeLessThanOrEqual(0);
  expect(metrics.columns).toBe(metrics.width >= 768 ? "2" : "1");
  expect(metrics.footerGround).toBe("rgb(13, 17, 13)");
  expect(metrics.text.filter(item => item.ratio < 4.5 || item.size < 13)).toEqual([]);
  expect(metrics.headingLines.filter(item => item.lines > 2.05)).toEqual([]);
  expect(metrics.text.some(item => /Fraunces/.test(item.font))).toBe(true);
  expect(metrics.text.some(item => /Figtree/.test(item.font))).toBe(true);
  for (const [part, selector] of [["process", "#topraktan-sofraya"], ["faq", "#sik-sorulanlar"], ["footer", "footer"]]) {
    const region = page.locator(selector);
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await region.evaluate(node => node.scrollIntoView({ block: "start", behavior: "instant" }));
    await expect.poll(() => region.locator("[data-scene-reveal], [data-moment-enter]").evaluateAll(nodes => nodes.every(node => {
      const transform = getComputedStyle(node).transform;
      return transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
    }))).toBe(true);
    await region.screenshot({ path: `test-results/105/${name}-${part}.png`, animations: "disabled", scale: "css" });
    await page.screenshot({ path: `test-results/105/${name}-${part}-viewport.png`, animations: "disabled", scale: "css" });
    const last = part === "faq" ? region.locator("[data-faq-answer]").last() : part === "footer" ? region.getByRole("link", { name: "AFİNA Şirketler Topluluğu" }) : null;
    if (last) {
      await last.scrollIntoViewIfNeeded();
      await expect(last).toBeInViewport({ ratio: 1 });
      await page.screenshot({ path: `test-results/105/${name}-${part}-end.png`, scale: "css" });
    }
  }
  expect(errors).toEqual([]);
}

test("v2 process, verified reading columns and earth footer meet the responsive AA gate", async ({ page }, testInfo) => {
  await audit(page, testInfo.project.name);
});

test("single-pointer controls work on mobile and progress matches the actual fill and resized scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const previous = page.getByRole("button", { name: "Önceki an" });
  const next = page.getByRole("button", { name: "Sonraki an" });
  await expect(previous).toBeDisabled();
  await expect(next).toBeVisible();
  await next.click();
  await expect(previous).toBeEnabled();
  await row(page).focus();
  await page.keyboard.press("End");
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "100");
  await expect(next).toBeDisabled();
  await expect(progress(page).locator("span")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await previous.click();
  await expect(next).toBeEnabled();
  await page.setViewportSize({ width: 768, height: 900 });
  await row(page).focus();
  await page.keyboard.press("Home");
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "0");
  await expect(progress(page).locator("span")).toHaveCSS("transform", "matrix(0, 0, 0, 1, 0, 0)");
  expect(await row(page).evaluate(node => node.scrollLeft)).toBe(0);
  await page.setViewportSize({ width: 3000, height: 900 });
  await expect(previous).toBeDisabled();
  await expect(next).toBeDisabled();
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "100");
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(next).toBeEnabled();
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "0");
});

test("three footer controls show keyboard focus, hover and active feedback", async ({ page }, testInfo) => {
  await open(page);
  const footer = page.getByRole("contentinfo");
  for (const [index, name] of ["Afina Zeytin ana sayfa", "KVKK", "AFİNA Şirketler Topluluğu"].entries()) {
    const link = footer.getByRole("link", { name, exact: true });
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: `test-results/105/${testInfo.project.name}-link-${index}-focus.png` });
    await link.hover();
    await page.screenshot({ path: `test-results/105/${testInfo.project.name}-link-${index}-hover.png` });
    await page.mouse.down();
    expect(await link.evaluate(node => node.matches(":active"))).toBe(true);
    await page.screenshot({ path: `test-results/105/${testInfo.project.name}-link-${index}-active.png` });
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
});

test.describe("Pixel 7", () => {
  test("native horizontal swipe, vertical pan and reduced-motion controls", async ({ browser, browserName, baseURL }, testInfo) => {
    test.skip(browserName !== "chromium", "CDP native touch input requires Chromium; WebKit has its separate iPhone project.");
    const context = await browser.newContext({ ...devices["Pixel 7"], baseURL });
    try {
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await audit(page, "pixel7-reduced");
      await row(page).scrollIntoViewIfNeeded();
      const box = (await row(page).boundingBox())!;
      const session = await context.newCDPSession(page);
      const x = Math.min(box.x + box.width - 24, 330);
      const y = Math.min(box.y + 80, 600);
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (let i = 1; i <= 10; i++) {
        await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - i * 24, y }] });
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(async () => Number(await progress(page).getAttribute("aria-valuenow"))).toBeGreaterThan(0);
      const before = await page.evaluate(() => scrollY);
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y }] });
      for (let i = 1; i <= 8; i++) {
        await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: y - i * 20 }] });
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
      await row(page).scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Sonraki an" }).tap();
      await expect(page.getByRole("button", { name: "Önceki an" })).toBeEnabled();
      await row(page).focus();
      await page.keyboard.press("End");
      await expect(progress(page)).toHaveAttribute("aria-valuenow", "100");
      await page.screenshot({ path: `test-results/105/${testInfo.project.name}-pixel7-swipe-end.png` });
      await session.detach();
    } finally { await context.close(); }
  });
});
