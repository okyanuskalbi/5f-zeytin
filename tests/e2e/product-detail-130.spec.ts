import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "@/lib/cart/store";

// Claude will run browser acceptance; the Coder task only writes these tests.
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`${viewport.width}×${viewport.height} ${reducedMotion}: details, gallery and purchase fit`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion });
      await page.goto("/");
      const card = page.locator('[data-product-id="sample-green-olive-10kg"]');
      const trigger = card.getByRole("heading").getByRole("button");
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Doğal Kırma Yeşil Zeytin" });
      const title = dialog.getByRole("heading");
      const add = dialog.getByRole("button", { name: "Sepete ekle", exact: true });
      await expect(dialog).toHaveAttribute("data-slot", viewport.width < 768 ? "sheet-content" : "dialog-content");
      await expect(title).toBeFocused();
      await expect.poll(() => dialog.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
      await expect(title).toBeInViewport({ ratio: 1 });
      await expect(add).toBeInViewport({ ratio: 1 });
      await expect(add).toBeEnabled();
      const image = dialog.locator("[data-product-detail-image] img");
      await expect(image).toHaveAttribute("src", /studyo/);
      await expect(image).toHaveAttribute("loading", "lazy");
      await dialog.getByRole("button", { name: "Sofra görseli" }).click();
      await expect(image).toHaveAttribute("src", /sahne/);
      await dialog.getByRole("radio", { name: "1 kg", exact: true }).locator("..").click();
      await expect(dialog.getByLabel("Fiyat", { exact: true })).toHaveText("₺220");
      await expect(page).toHaveURL(/urun=sample-green-olive-1kg/);
      await dialog.getByRole("button", { name: "Adedi artır" }).click();
      await add.click();
      await expect(dialog.getByRole("button", { name: "Eklendi ✓" })).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(1);
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "[]"), CART_STORAGE_KEY))
        .toEqual([{ productId: "sample-green-olive-1kg", quantity: 2 }]);
      const description = dialog.getByText("Aynı doğal kırma yeşil zeytin, günlük sofra için cam kavanozda. Kendi tesisimizde doldurulur.");
      await description.scrollIntoViewIfNeeded();
      await expect(description).toBeInViewport();
      const facts = dialog.getByRole("table", { name: "Ürün bilgileri" });
      await facts.scrollIntoViewIfNeeded();
      await expect(facts.getByRole("row")).toHaveCount(6);
      await expect(dialog.getByText("Güvenli Ödeme")).toBeVisible();
      for (const selector of ["[data-product-detail-scroll]", "[data-product-detail]"]) {
        expect(await page.locator(selector).evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      if (viewport.width < 768) {
        await expect(dialog.locator("[data-product-detail-purchase]")).toHaveCSS("position", "sticky");
        await expect(dialog.getByRole("button", { name: /Sepete ekle|Eklendi ✓/ })).toBeInViewport({ ratio: 1 });
        await expect(page.locator("[data-mobile-buy-bar]")).toHaveAttribute("aria-hidden", "true");
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(page).not.toHaveURL(/urun=/);
      await expect(trigger).toBeFocused();
    });
  }
}

test("opens a shared product URL, closes from backdrop and keeps the source parameter", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?utm_source=shared&urun=sample-olive-oil-5l");
  const dialog = page.getByRole("dialog", { name: "Natürel Sızma Zeytinyağı" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "5 L", exact: true })).toBeChecked();
  await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 8, y: 8 } });
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\?utm_source=shared$/);
});
