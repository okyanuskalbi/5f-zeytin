import { expect, test } from "@playwright/test";
// @ts-expect-error Shared browser inspection is also runnable as a standalone local audit.
import { routes, inspectPage } from "../../scripts/qa-storefront-pages.mjs";

for (const [name, route] of routes as [string, string][]) {
  if (route.startsWith("/hesabim")) continue; // Authenticated forms and all account states run in the local DB audit.
  test(`199 ${name}: opens, has a heading, visible actions and intact media`, async ({ page, baseURL }) => {
    expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL!).hostname);
    await page.route("**/*", request => new URL(request.request().url()).origin === new URL(baseURL!).origin ? request.continue() : request.abort());
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(name === "404" ? 404 : 200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main a,main button").first()).toBeVisible();
    await page.locator("img").evaluateAll(images => Promise.all(images.map(image => (() => { const img = image as HTMLImageElement; img.loading = "eager"; return Promise.race([img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 2500))]); })())));
    const state = await page.evaluate(inspectPage) as { overflow: boolean; broken: string[]; collisions: unknown[] };
    expect(state.overflow).toBe(false);
    expect(state.broken).toEqual([]);
    expect(state.collisions).toEqual([]);
    expect(errors).toEqual([]);
  });
}
