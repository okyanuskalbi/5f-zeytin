import { expect, test, type Locator } from "@playwright/test";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Local packaged-browser acceptance for the selected A storefront surfaces.
async function paymentArtwork(container: Locator, tone: "light" | "dark", expectedSurface: string, brands = ["PayTR", "Visa", "Mastercard", "Troy"]): Promise<void> {
  await expect(container.getByRole("img")).toHaveCount(brands.length);
  for (const brand of brands) {
    const image = container.getByRole("img", { name: brand, exact: true });
    const suffix = tone === "dark" && brand !== "Mastercard" ? "-dark" : "";
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", `/images/payment/${brand.toLowerCase()}${suffix}.svg`);
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const surface = await image.evaluate(node => {
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        const color = getComputedStyle(parent).backgroundColor;
        if (color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
      }
      return "transparent";
    });
    expect(surface).toBe(expectedSurface);
  }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  test(`132 ${viewport.width}px: cart, product and footer artwork matches its surface`, async ({ page }, info) => {
    test.skip(info.project.name !== "chromium-1440");
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(key => localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 1 }])), CART_STORAGE_KEY);
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: /^Sepetim/ }).click();
    const drawer = page.getByRole("dialog", { name: /^Sepetim \(/ });
    await paymentArtwork(drawer.getByRole("group", { name: "Güvenli ödeme" }), "dark", "rgb(255, 253, 248)");
    await drawer.getByRole("button", { name: "Sepeti kapat" }).click();
    await page.goto("/sepet");
    await paymentArtwork(page.getByRole("main").getByRole("group", { name: "Güvenli ödeme" }), "dark", "rgb(255, 253, 248)");
    await page.goto("/?urun=sample-green-olive-1kg");
    const details = page.locator("[data-product-page]");
    const payment = details.getByText("Ödeme seçenekleri", { exact: true }).locator("..");
    // Task204/205: every payment group shows the dark artwork inside a paper pill, the footer included.
    await paymentArtwork(payment, "dark", "rgb(255, 253, 248)");
    await paymentArtwork(page.getByRole("contentinfo").getByRole("group", { name: "Güvenli ödeme" }), "dark", "rgb(255, 253, 248)");
  });
}
