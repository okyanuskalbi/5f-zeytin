import { expect, test, type Page } from "@playwright/test";

// Task 126: Claude runs browser acceptance; Codex only authors these tests.
// One bundled headless Chromium project owns the responsive cases.
test.beforeEach(async ({ browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-1440", "Run these responsive cases once in headless bundled Chromium.");
});

async function loadStoryPhotos(page: Page): Promise<void> {
  for (const image of await page.locator("#tesisimiz img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => document.fonts.ready);
}

async function scanStory(page: Page) {
  return page.locator("#tesisimiz").evaluate(section => {
    const rect = (node: Element) => {
      const box = node.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height };
    };
    const visible = (node: Element) => {
      for (let ancestor: Element | null = node; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (Number(style.opacity) < .98 || style.visibility === "hidden" || style.display === "none") return false;
      }
      return true;
    };
    const sectionBox = rect(section);
    const top = Math.max(0, sectionBox.top);
    const bottom = Math.min(innerHeight, sectionBox.bottom);
    // Union the actual visible media/text bounds, not whole article boxes:
    // oversized spacer rows must count as empty. Claude also reviews visual strips.
    const intervals = [...section.querySelectorAll("figure, [data-story-number], h2, p")]
      .filter(visible).map(rect).filter(box => box.bottom > top && box.top < bottom)
      .map(box => ({ top: Math.max(top, box.top), bottom: Math.min(bottom, box.bottom) }))
      .sort((a, b) => a.top - b.top);
    let cursor = top;
    let largestEmptyStrip = 0;
    for (const interval of intervals) {
      largestEmptyStrip = Math.max(largestEmptyStrip, interval.top - cursor);
      cursor = Math.max(cursor, interval.bottom);
    }
    largestEmptyStrip = Math.max(largestEmptyStrip, bottom - cursor);
    const photos = [...section.querySelectorAll("figure")].map(rect);
    const visiblePhotos = photos.filter(box => box.bottom > 0 && box.top < innerHeight);
    const overlaps = visiblePhotos.some((a, index) => visiblePhotos.slice(index + 1).some(b =>
      Math.min(a.right, b.right) > Math.max(a.left, b.left) + 1 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + 1));
    const images = [...section.querySelectorAll("figure")].map(figure => {
      const image = figure.querySelector("img")!;
      const box = rect(figure);
      const imageBox = rect(image);
      const style = getComputedStyle(figure);
      const matrix = style.transform === "none" ? null : new DOMMatrixReadOnly(style.transform);
      return {
        box, imageBox, ratio: image.naturalWidth / image.naturalHeight,
        parallax: matrix?.m42 ?? 0,
        scaleX: matrix?.m11 ?? 1, scaleY: matrix?.m22 ?? 1,
      };
    });
    const pinned = [...section.querySelectorAll("*")].some(node => ["sticky", "fixed"].includes(getComputedStyle(node).position));
    return { largestEmptyStrip, overlaps, images, pinned, horizontalOverflow: document.documentElement.scrollWidth > innerWidth };
  });
}

for (const width of [390, 768, 1440]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`story has no >30% empty strip, overlapping photos or crop every 200px at ${width}px (${reducedMotion})`, async ({ page }) => {
      const height = width === 390 ? 844 : 900;
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion });
      await page.goto("/");
      await expect(page.locator("#tesisimiz article")).toHaveCount(3);
      await loadStoryPhotos(page);
      const limits = await page.locator("#tesisimiz").evaluate(node => {
        const box = node.getBoundingClientRect();
        return { start: scrollY + box.top, end: scrollY + box.bottom };
      });
      for (let position = limits.start; position < limits.end; position += 200) {
        await page.evaluate(top => scrollTo({ top, behavior: "instant" }), position);
        // Allow only transform/opacity entrances to settle, without a fixed sleep.
        await expect.poll(async () => (await scanStory(page)).largestEmptyStrip, { message: `Empty strip at scrollY=${position}` }).toBeLessThanOrEqual(height * .3);
        const scan = await scanStory(page);
        expect(scan.overlaps).toBe(false);
        expect(scan.pinned).toBe(false);
        expect(scan.horizontalOverflow).toBe(false);
        for (const [index, photo] of scan.images.entries()) {
          expect(photo.box.width / photo.box.height).toBeCloseTo(index === 1 ? 16 / 10 : 16 / 9, 2);
          expect(photo.ratio).toBeCloseTo(photo.box.width / photo.box.height, 2);
          // The whole source image fits; therefore the tin/bottle source bounds fit too.
          for (const edge of ["left", "right", "top", "bottom"] as const) expect(Math.abs(photo.imageBox[edge] - photo.box[edge])).toBeLessThanOrEqual(1);
          expect(Math.abs(photo.parallax)).toBeLessThanOrEqual(12.01);
          expect(photo.scaleX).toBe(1);
          expect(photo.scaleY).toBe(1);
        }
      }
      const layout = await page.locator("#tesisimiz").evaluate(section => {
        const rows = [...section.querySelectorAll("article")].map(row => {
          const visual = row.querySelector("figure")!.parentElement!;
          const copy = row.querySelector("h2")!.parentElement!;
          const photo = visual.getBoundingClientRect();
          const text = copy.getBoundingClientRect();
          return { photo: { left: photo.left, right: photo.right, bottom: photo.bottom, width: photo.width }, copy: { left: text.left, right: text.right, top: text.top, width: text.width }, gap: parseFloat(getComputedStyle(row).columnGap) };
        });
        const last = section.querySelector("article:last-child")!;
        const contentBottom = Math.max(...[...last.querySelectorAll("figure, h2, p")].map(node => node.getBoundingClientRect().bottom));
        return { rows, paddingTop: getComputedStyle(section).paddingTop, paddingBottom: getComputedStyle(section).paddingBottom, bandGap: document.querySelector("[data-hero-band]")!.getBoundingClientRect().top - contentBottom };
      });
      for (const [index, row] of layout.rows.entries()) {
        if (width < 768) {
          expect(row.photo.left).toBe(16);
          expect(row.photo.right).toBe(width - 16);
          expect(row.copy.top).toBeGreaterThanOrEqual(row.photo.bottom);
        } else {
          expect(row.photo.width / row.copy.width).toBeCloseTo(width >= 1024 ? 7 / 5 : 1, 2);
          if (index === 1) expect(row.photo.left).toBeGreaterThan(row.copy.right);
          else expect(row.copy.left).toBeGreaterThan(row.photo.right);
        }
      }
      if (width >= 1024) {
        expect(layout.paddingTop).toBe("112px");
        expect(layout.paddingBottom).toBe("112px");
      }
      expect(layout.bandGap).toBeGreaterThanOrEqual(0);
      expect(layout.bandGap).toBeLessThanOrEqual(96.01);
      if (reducedMotion === "reduce") {
        for (const node of await page.locator("#tesisimiz figure, #tesisimiz [data-story-reveal]").all()) {
          await expect(node).toHaveCSS("transform", "none");
          await expect(node).toHaveCSS("opacity", "1");
        }
      }
    });
  }
}
