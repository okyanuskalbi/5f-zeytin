import { expect, test } from "@playwright/test";

test("home returns 200 and identifies the ZEYTİN application", async ({ page, baseURL }, testInfo) => {
  const response = await page.goto("/");

  testInfo.annotations.push({ type: "target-host", description: new URL(baseURL!).host });
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
  await expect(page.locator('meta[name="app"]')).toHaveAttribute("content", "zeytin");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page).toHaveTitle("Afina Zeytin | Zeytin ve Zeytinyağı");
  await expect(page.getByRole("main").getByRole("heading", { level: 1, name: "Afina Zeytin" })).toBeVisible();
  await expect(page.getByText("Kökü toprakta. Yeri sofrada.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
