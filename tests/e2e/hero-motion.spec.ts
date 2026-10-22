import { expect, test } from "@playwright/test";

test("v4: 18 second alternating Ken Burns switches off with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const photo = page.locator("[data-hero-photo]");
  await expect.poll(() => photo.evaluate(node => node.getAnimations().some(animation => animation.playState === "running"))).toBe(true);
  const timing = await photo.evaluate(node => node.getAnimations()[0].effect!.getTiming());
  expect(timing.duration).toBe(18000);
  expect(timing.direction).toBe("alternate");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(photo).toHaveCSS("transform", "none");
  await expect(page.locator("[data-scroll-line]")).toHaveCSS("transform", "none");
  await expect.poll(() => photo.evaluate(node => node.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
  await expect(page.locator("[data-hero-card]").getByRole("button", { name: "Sepete ekle", exact: true })).toBeEnabled();
});

test("v4: cart badge persists while navigation switches at 40px and reverses", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toHaveAttribute("data-tone", "hero");
  await page.locator("[data-hero-intro]").getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await page.evaluate(() => scrollTo(0, 40));
  await expect(header).toHaveAttribute("data-tone", "hero");
  await page.evaluate(() => scrollTo(0, 41));
  await expect(header).toHaveAttribute("data-tone", "solid");
  await expect(header).toHaveCSS("background-color", "rgba(14, 21, 16, 0.72)");
  await expect(header).toHaveCSS("backdrop-filter", "blur(14px)");
  await expect(header.getByRole("button", { name: "Sepetim, 1 adet" })).toBeInViewport();
  await page.reload();
  await expect(header.getByRole("button", { name: "Sepetim, 1 adet" })).toBeEnabled();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(header).toHaveAttribute("data-tone", "hero");
});
