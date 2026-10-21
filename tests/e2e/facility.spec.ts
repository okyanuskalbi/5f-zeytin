import { expect, test } from "@playwright/test";

test("approved blurred facility image and concise confirmed facts reflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#tesisimiz");
  const facility = page.getByRole("region", { name: "Osmaniye’de, kendi tesisimizde.", exact: true });
  await expect(facility).toContainText("Ellek · Düziçi · 2021’den bu yana.");
  await expect(facility).toContainText("Sofralık zeytin, salamura zeytin ve zeytinyağını perakende ve toptan alıcılarla buluşturuyoruz.");
  const photo = facility.getByRole("img", { name: "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi", exact: true });
  await expect(photo).toHaveAttribute("src", "/images/v3/tesis-osmaniye-w800.webp");
  await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photo.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  await expect(photo).toHaveCSS("object-fit", "cover");
  const metrics = await facility.evaluate(node => {
    const copy = node.querySelector("h2")!.parentElement!.getBoundingClientRect();
    const photo = node.querySelector("picture")!.getBoundingClientRect();
    return { width: innerWidth, copy: { right: copy.right, bottom: copy.bottom }, photo: { x: photo.x, y: photo.y, ratio: photo.width / photo.height }, overflow: document.documentElement.scrollWidth - innerWidth };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.photo.ratio).toBeCloseTo(metrics.width < 768 ? 16 / 10 : 4 / 3, 2);
  if (metrics.width < 768) expect(metrics.photo.y).toBeGreaterThanOrEqual(metrics.copy.bottom - 1);
  else expect(metrics.photo.x).toBeGreaterThanOrEqual(metrics.copy.right - 1);
  await expect(facility.locator("form, input, iframe, svg[role=img]")).toHaveCount(0);
  await expect(facility).not.toContainText(/%100|organik|sertifikalı|lider/);
  expect(errors).toEqual([]);
});

test("failed photo requests preserve facility copy without an empty wholesale destination", async ({ page }) => {
  await page.route("**/images/v3/tesis-osmaniye-*", route => route.abort());
  await page.goto("/#tesisimiz");
  await expect(page.locator("#tesisimiz h2")).toHaveText("Osmaniye’de, kendi tesisimizde.");
  await expect(page.locator("#toptan, #toptan-title")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("old wholesale bookmarks leave the landing usable without placeholder contact", async ({ page }) => {
  for (const hash of ["toptan", "toptan-iletisim"]) {
    await page.goto(`/#${hash}`);
    await expect(page.locator("#toptan, #toptan-iletisim, #toptan-title")).toHaveCount(0);
    await expect(page.locator("[data-hero-intro] h1")).toBeInViewport();
    await expect(page.getByRole("banner")).toBeVisible();
  }
});
