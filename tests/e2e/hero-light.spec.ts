import { expect, test, type Locator } from "@playwright/test";

// Opaque UI surfaces only; the photograph/scrim requires Claude's pixel check.
async function contrast(element: Locator): Promise<number> {
  return element.evaluate(node => {
    const luminance = (color: string): number => color.match(/[\d.]+/g)!.slice(0, 3).map(Number)
      .map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
      .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    let surface: Element | null = node;
    while (surface && getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)") surface = surface.parentElement;
    const foreground = luminance(getComputedStyle(node).color);
    const background = luminance(getComputedStyle(surface ?? document.body).backgroundColor);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
}

for (const route of ["/sepet", "/odeme", "/hesabim", "/kvkk"]) {
  test(`v4: ${route} keeps readable text and an unobscured heading`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(14, 21, 16)");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const nav = (await page.getByRole("banner").boundingBox())!;
    expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(nav.y + nav.height);
    for (const node of await page.locator("main :is(h1,h2,p,dt,dd,a,button)").all()) {
      if (await node.isVisible() && (await node.innerText()).trim()) expect(await contrast(node)).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test("v4: cart drawer surfaces and copy retain AA contrast", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-hero-card]").getByRole("button", { name: "Sepete ekle", exact: true }).click();
  await page.getByRole("banner").getByRole("button", { name: "Sepetim, 1 adet" }).click();
  const drawer = page.getByRole("dialog", { name: "Sepetim", exact: true });
  await expect(drawer).toBeVisible();
  for (const node of await drawer.locator(":is(h2,h3,p,a,button,dt,dd)").all()) {
    if (await node.isVisible() && (await node.innerText()).trim()) expect(await contrast(node)).toBeGreaterThanOrEqual(4.5);
  }
});
