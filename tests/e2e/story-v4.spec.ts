import { expect, test, type Page } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Task 120: authored for Claude's browser acceptance; Codex does not run this file.
const captions = ["Düziçi, Osmaniye", "Tesisimiz · Ellek", "Natürel sızma · 1 L"];

async function readStep(page: Page, index: number): Promise<void> {
  const row = page.locator(`article[data-story-step="${index}"]`);
  const photo = row.locator("figure");
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toHaveCSS("opacity", "1");
  await expect(photo.locator("figcaption")).toHaveText(captions[index]);
  await expect(photo.locator("img")).toBeVisible();
  await expect.poll(() => photo.locator("img").evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
}

test("story rows retain their captions and approved v4 facility photo in both scroll directions", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  for (const index of [0, 1, 2, 1, 0]) await readStep(page, index);
  const facility = page.locator("#tesisimiz figure").nth(1).locator("img");
  await expect(facility).toHaveAttribute("src", "/images/tesis/tesis-osmaniye-v4-1200.webp");
  await expect(facility).toHaveAttribute("alt", "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi");
  await expect(page.locator("#tesisimiz")).not.toContainText(/%100|organik|sertifikalı|lider/);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`story rows, text, band and touch targets reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const index of [0, 1, 2]) {
      await readStep(page, index);
      const layout = await page.locator(`article[data-story-step="${index}"]`).evaluate(node => {
        const photo = node.querySelector("figure")!.getBoundingClientRect();
        const copy = node.querySelector("h2")!.parentElement!.getBoundingClientRect();
        return { photoBottom: photo.bottom, photoLeft: photo.left, photoRight: photo.right, copyTop: copy.top, copyLeft: copy.left, copyRight: copy.right };
      });
      if (width < 768) expect(layout.copyTop).toBeGreaterThanOrEqual(layout.photoBottom);
      else if (index === 1) expect(layout.photoLeft).toBeGreaterThan(layout.copyRight);
      else expect(layout.copyLeft).toBeGreaterThan(layout.photoRight);
    }
    const band = page.locator("[data-hero-band]");
    await band.scrollIntoViewIfNeeded();
    for (const button of await band.getByRole("button").all()) {
      await expect(button).toBeVisible();
      const box = (await button.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("the hero band adds both sizes without opening the drawer and persists them", async ({ page }) => {
  await page.goto("/");
  const band = page.locator("[data-hero-band]");
  await band.scrollIntoViewIfNeeded();
  await expect(band.getByLabel("10 kg teneke fiyatı")).toHaveText("₺2.200");
  await band.getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await band.getByRole("button", { name: "1 kg kavanoz", exact: true }).click();
  await expect(band.getByRole("status").first()).toContainText("10 kg sepete eklendi");
  await expect(band.getByRole("status").last()).toContainText("1 kg sepete eklendi");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const expected = [{ productId: "sample-green-olive-10kg", quantity: 1 }, { productId: "sample-green-olive-1kg", quantity: 1 }];
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
  await page.reload();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual(expected);
});

test("band parallax stays within 60px and reduced motion keeps every image and text static", async ({ page }) => {
  await page.goto("/");
  const band = page.locator("[data-hero-band]");
  for (const alignment of ["start", "center", "end"] as const) {
    await band.evaluate((node, block) => node.scrollIntoView({ block, behavior: "instant" }), alignment);
    await expect.poll(() => band.locator("[data-band-photo]").evaluate(node => {
      const transform = getComputedStyle(node).transform;
      return transform === "none" ? 0 : Math.abs(new DOMMatrixReadOnly(transform).m42);
    })).toBeLessThanOrEqual(60);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(band.locator("[data-band-photo]")).toHaveCSS("transform", "none");
  for (const node of await band.locator("[data-band-reveal]").all()) {
    await expect(node).toHaveCSS("transform", "none");
    await expect(node).toHaveCSS("opacity", "1");
  }
  await expect(page.locator("#tesisimiz article")).toHaveCount(3);
  await expect(page.locator("[data-story-sticky]")).toHaveCount(0);
  for (const figure of await page.locator("#tesisimiz figure").all()) await expect(figure).toHaveCSS("opacity", "1");
  await expect(page.locator("#tesisimiz h2")).toHaveCount(3);
});

test("JavaScript-free story shows all three photos, captions and complete copy", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/#tesisimiz", baseURL!).href);
    await expect(page.locator("#tesisimiz article")).toHaveCount(3);
    await expect(page.locator("[data-story-sticky]")).toHaveCount(0);
    for (const figure of await page.locator("#tesisimiz figure").all()) {
      await expect(figure).toHaveCSS("opacity", "1");
      await expect(figure).toHaveCSS("transform", "none");
      await expect(figure.locator("img")).toBeVisible();
      await expect(figure.locator("figcaption")).toBeVisible();
    }
    for (const title of ["Kökü toprakta.", "Kendi tesisimizde.", "Yeri sofrada."]) await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.locator("[data-hero-band]").getByRole("button")).toHaveCount(2);
  } finally { await context.close(); }
});

test("failed facility requests retain the story and the wholesale bookmark", async ({ page }) => {
  await page.route("**/images/tesis/tesis-osmaniye-v4-*", route => route.abort());
  await page.goto("/#tesisimiz");
  await expect(page.getByRole("heading", { name: "Kendi tesisimizde.", exact: true })).toBeVisible();
  await expect(page.locator("#toptan-iletisim")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
