import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Locator, type Page } from "@playwright/test";

const titles = ["Hasat", "Seçim", "Kırma", "Salamura", "Dolum", "Sofrada"];
const drafts = readFileSync(new URL("../../docs/teyit/surec.md", import.meta.url), "utf8")
  .split("\n").filter(line => /^\| (Hasat|Seçim|Kırma|Salamura|Dolum|Sofrada) \|/.test(line)).map(line => line.split("|")[2].trim());
const section = (page: Page): Locator => page.getByRole("region", { name: "Topraktan sofraya", exact: true });
const row = (page: Page): Locator => section(page).getByRole("list", { name: "Süreç anları" });
const progress = (page: Page): Locator => section(page).getByRole("progressbar", { name: "Süreç şeridi ilerlemesi" });

async function open(page: Page): Promise<void> {
  expect((await page.goto("/#topraktan-sofraya"))?.status()).toBe(200);
  await expect(section(page)).toBeVisible();
  await row(page).evaluate(node => node.focus({ preventScroll: true }));
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ baseURL }) => {
  if (!["localhost", "127.0.0.1"].includes(new URL(baseURL!).hostname)) throw new Error("Local checkout required.");
});

test("six typographic moments preserve the official sentence and responsive strip geometry", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => requests.push(request.url()));
  await open(page);
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveText(titles);
  await expect(section(page).locator("p:not(.sr-only)")).toHaveText(["Zeytinin hikâyesi toprakta başlar, sofrada tamamlanır."]);
  expect(drafts).toHaveLength(6);
  const html = await page.content();
  for (const draft of drafts) expect(html).not.toContain(draft);
  await expect(section(page)).not.toContainText(/katkısız|derece|saat|organik|teyit bekliyor/i);
  const metrics = await section(page).evaluate(node => {
    const strip = node.querySelector("ul")!;
    const h2 = node.querySelector("h2")!;
    const headingStyle = getComputedStyle(h2);
    return {
      viewport: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth,
      columns: [...strip.children].map(child => {
        return { width: child.getBoundingClientRect().width, imageCount: child.querySelectorAll("img").length,
          gap: parseFloat(getComputedStyle(child.firstElementChild!).paddingTop),
          font: getComputedStyle(child.querySelector("h3")!).fontFamily,
          size: parseFloat(getComputedStyle(child.querySelector("h3")!).fontSize) };
      }),
      gap: parseFloat(getComputedStyle(strip).gap), snap: getComputedStyle(strip).scrollSnapType,
      heading: { font: headingStyle.fontFamily, size: parseFloat(headingStyle.fontSize), height: h2.getBoundingClientRect().height, line: parseFloat(headingStyle.lineHeight) },
      progressHeight: node.querySelector('[role="progressbar"]')!.getBoundingClientRect().height,
    };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.progressHeight).toBe(6);
  expect(metrics.heading.height / metrics.heading.line).toBeLessThanOrEqual(2.05);
  expect(metrics.heading.font).toMatch(/Fraunces/i);
  expect(metrics.snap).toBe("x mandatory");
  const mobile = metrics.viewport < 768;
  expect(metrics.gap).toBe(mobile ? 16 : 32);
  expect(new Set(metrics.columns.map(column => column.gap)).size).toBe(3);
  for (const column of metrics.columns) {
    expect(column.width).toBeCloseTo(mobile ? metrics.viewport * 0.72 : 280, 0);
    expect(column.imageCount).toBe(0);
    expect(column.font).toMatch(/Fraunces/i);
    expect(column.size).toBeGreaterThanOrEqual(28);
    expect(column.gap).toBeGreaterThanOrEqual(32);
    expect(column.gap).toBeLessThanOrEqual(64);
  }
  const next = section(page).getByRole("button", { name: "Sonraki an" });
  if (mobile) await expect(next).toBeHidden();
  else {
    await expect(next).toBeVisible();
    expect((await next.boundingBox())!.width).toBe(48);
    expect((await next.boundingBox())!.height).toBe(48);
  }
  await mkdir("test-results/094", { recursive: true });
  await page.screenshot({ path: `test-results/094/${testInfo.project.name}-moments.png` });
  await writeFile(`test-results/094/${testInfo.project.name}-metrics.json`, JSON.stringify({ metrics, requests, errors }, null, 2));
  expect(requests.filter(url => /\/images\/(tesis|generated)\//.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});

test("keyboard and desktop buttons advance actual scroll and the progress bar in both directions", async ({ page }) => {
  await open(page);
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "0");
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Number(await progress(page).getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  await expect(row(page)).toBeFocused();
  await page.keyboard.press("End");
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "100");
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => Number(await progress(page).getAttribute("aria-valuenow"))).toBeLessThan(100);
  await page.keyboard.press("Home");
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "0");
  expect(await row(page).evaluate(node => getComputedStyle(node).outlineStyle)).toBe("solid");
  if ((await page.evaluate(() => innerWidth)) >= 768) {
    const previous = section(page).getByRole("button", { name: "Önceki an" });
    const next = section(page).getByRole("button", { name: "Sonraki an" });
    await expect(previous).toBeDisabled();
    await next.click();
    await expect(previous).toBeEnabled();
    for (let i = 0; i < 6 && await next.isEnabled(); i++) {
      await next.click();
      await expect.poll(() => row(page).evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
      // Wait for native smooth scrolling to settle before requesting another snap.
      await expect.poll(async () => row(page).evaluate(node => {
        const left = node.scrollLeft;
        return new Promise<boolean>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(Math.abs(left - node.scrollLeft) < 0.1))));
      })).toBe(true);
    }
    await expect(progress(page)).toHaveAttribute("aria-valuenow", "100");
    await expect(next).toBeDisabled();
    await previous.click();
    await expect.poll(async () => Number(await progress(page).getAttribute("aria-valuenow"))).toBeLessThan(100);
  }
});

test("mouse dragging over the typographic strip advances the strip, restores snap and keeps vertical scroll free", async ({ page, isMobile, browserName }) => {
  await open(page);
  const bounds = (await row(page).boundingBox())!;
  const x = Math.min(bounds.x + bounds.width - 32, 360);
  const y = Math.min(bounds.y + 100, (await page.evaluate(() => innerHeight)) - 100);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 220, y, { steps: 16 });
  await page.mouse.up();
  await expect.poll(async () => Number(await progress(page).getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  await expect(row(page)).not.toHaveAttribute("data-dragging");
  await expect(row(page)).toHaveCSS("scroll-snap-type", "x mandatory");
  const before = await page.evaluate(() => scrollY);
  if (isMobile && browserName === "webkit") await page.evaluate(() => scrollBy(0, 200));
  else await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("reduced motion and live preference changes keep every title and control usable", async ({ page }, testInfo) => {
  await open(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => section(page).locator("[data-moment-enter]").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).transform === "none"))).toBe(true);
  // The preceding pinned hero changes height when its motion mode changes.
  await row(page).scrollIntoViewIfNeeded();
  await row(page).focus();
  await page.keyboard.press("End");
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "100");
  await expect(section(page).getByRole("heading", { name: "Sofrada", exact: true })).toBeInViewport();
  await page.keyboard.press("Home");
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "0");
  await page.screenshot({ path: `test-results/094/${testInfo.project.name}-reduced.png` });
});

test("JavaScript disabled and image failure preserve all moments and native keyboard scrolling", async ({ browser, baseURL }, testInfo) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled, viewport: testInfo.project.use.viewport });
    try {
      const page = await context.newPage();
      if (javaScriptEnabled) await page.route("**/images/hero/**", route => route.abort());
      await page.goto(new URL("/#topraktan-sofraya", baseURL!).href);
      await expect(section(page).getByRole("heading", { level: 3 })).toHaveText(titles);
      await row(page).focus();
      // Native scroll containers support horizontal arrows without our JS;
      // End is browser-dependent (it can move the whole document instead).
      for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowRight");
      await expect.poll(() => row(page).evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
      expect(await section(page).innerText()).not.toMatch(/görsel.*hazırlanıyor|teyit bekliyor/i);
    } finally { await context.close(); }
  }
});

test("touch pointer events do not capture or cancel native pan gestures", async ({ page, isMobile, browserName }) => {
  await open(page);
  const result = await row(page).evaluate(node => {
    const down = new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 11, pointerType: "touch", clientX: 300, clientY: 300 });
    const move = new PointerEvent("pointermove", { bubbles: true, cancelable: true, pointerId: 11, pointerType: "touch", clientX: 100, clientY: 300 });
    node.dispatchEvent(down); node.dispatchEvent(move);
    node.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 11, pointerType: "touch" }));
    return { cancelled: down.defaultPrevented || move.defaultPrevented, capture: node.hasPointerCapture(11), dragging: node.hasAttribute("data-dragging"), touchAction: getComputedStyle(node).touchAction };
  });
  expect(result).toEqual({ cancelled: false, capture: false, dragging: false, touchAction: "auto" });
  // Real browser wheel scrolling uses the native scroll path, independently of our mouse handlers.
  await page.mouse.move(200, Math.min((await row(page).boundingBox())!.y + 100, 600));
  if (isMobile && browserName === "webkit") await row(page).evaluate(node => node.scrollBy({ left: 400 }));
  else await page.mouse.wheel(400, 0);
  await expect.poll(async () => Number(await progress(page).getAttribute("aria-valuenow"))).toBeGreaterThan(0);
});

test("the compact cart label leaves the moment strip and its titles unobstructed", async ({ page }) => {
  await open(page);
  for (const fraction of [0, 0.25, 0.5, 0.75]) {
    await section(page).evaluate((node, ratio) => scrollTo(0, node.getBoundingClientRect().top + scrollY + node.clientHeight * ratio - 100), fraction);
    await expect.poll(() => page.evaluate(() => {
      const stub = document.querySelector('[aria-label="Etiket koçanı"]');
      if (!stub || getComputedStyle(stub).visibility === "hidden") return 0;
      const box = stub.getBoundingClientRect();
      return [...document.querySelectorAll("#moments-row, #moments-title, #topraktan-sofraya p:not(.sr-only)")].reduce((area, node) => {
        const target = node.getBoundingClientRect();
        return area + Math.max(0, Math.min(box.right, target.right) - Math.max(box.left, target.left)) *
          Math.max(0, Math.min(box.bottom, target.bottom) - Math.max(box.top, target.top));
      }, 0);
    })).toBe(0);
  }
});
