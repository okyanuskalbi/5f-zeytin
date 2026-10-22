import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { build } from "vite";
import { magicLinkConfirmation } from "../../lib/contracts/login";
import { CART_STORAGE_KEY } from "../../lib/cart/store";

// Only local mocked acceptance. No real account, provider call or email.
test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Login acceptance requires the local mocked target.");
  await page.route("**/*.supabase.co/**", route => route.abort());
  // Fail closed if a scenario forgets its explicit API mock.
  await page.route("**/api/auth/login", route => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
  await page.route("**/auth/logout", route => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
});

async function mockLogin(page: Page, status = 200, body: unknown = { data: { status: "signed_in", redirectTo: "/sepet" } }) {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/auth/login", async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return requests;
}
async function fill(page: Page) {
  await page.getByLabel("E-posta", { exact: true }).fill("deniz@example.test");
  await page.getByLabel("Şifre", { exact: true }).fill("Sofrada123!");
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`password login, safe destination and keyboard access (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const requests = await mockLogin(page);
    await page.goto("/giris?next=/sepet");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Soframıza hoş geldiniz.");
    await expect(page.getByRole("button", { name: /Google/ })).toHaveCount(0);
    await page.getByLabel("E-posta", { exact: true }).focus();
    await page.keyboard.type("deniz@example.test");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Şifre", { exact: true })).toBeFocused();
    await page.keyboard.type("Sofrada123!");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Şifreyi göster" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("type", "text");
    await page.keyboard.press("Space");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "E-posta ile giriş yap" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/sepet$/);
    expect(requests).toEqual([{ method: "password", email: "deniz@example.test", password: "Sofrada123!", next: "/sepet" }]);
    const storage = await page.evaluate(key => ({ local: Object.keys(localStorage).filter(name => name !== key), session: Object.keys(sessionStorage) }), CART_STORAGE_KEY);
    expect(storage).toEqual({ local: [], session: [] });
  });
  test(`magic link confirmation stays on the page (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const requests = await mockLogin(page, 202, { data: { status: "link_requested" } });
    await page.goto("/giris?next=/odeme");
    await page.getByRole("button", { name: "E-posta bağlantısıyla giriş" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveCount(0);
    await page.getByLabel("E-posta", { exact: true }).fill("deniz@example.test");
    await page.getByRole("button", { name: "Giriş bağlantısı iste" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main").getByRole("status")).toHaveText(magicLinkConfirmation);
    await expect(page.getByRole("main").getByRole("status")).toBeFocused();
    await expect(page).toHaveURL(/\/giris\?next=\/odeme$/);
    expect(requests).toEqual([{ method: "magic_link", email: "deniz@example.test", next: "/odeme" }]);
  });
}

test("invalid fields prevent a request and associate errors accessibly", async ({ page }) => {
  const requests = await mockLogin(page);
  await page.goto("/giris");
  await page.getByRole("button", { name: "E-posta ile giriş yap" }).click();
  await expect(page.getByLabel("E-posta", { exact: true })).toBeFocused();
  await expect(page.getByLabel("E-posta", { exact: true })).toHaveAttribute("aria-describedby", "auth-email-error");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("alanları kontrol");
  expect(requests).toHaveLength(0);
});

for (const status of [401, 429, 503]) {
  test(`safe error ${status} and retry`, async ({ page }) => {
    await mockLogin(page, status, { error: { message: "private provider text" } });
    await page.goto("/giris"); await fill(page);
    await page.getByRole("button", { name: "E-posta ile giriş yap" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(status === 401 ? "E-posta veya şifre" : status === 429 ? "Çok fazla deneme" : "Üyelik hizmeti");
    await expect(page.getByRole("main")).not.toContainText("private provider text");
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveValue("Sofrada123!");
    const requests = await mockLogin(page);
    await page.getByRole("button", { name: "E-posta ile giriş yap" }).click();
    await expect(page).toHaveURL(/\/sepet$/);
    expect(requests).toHaveLength(1);
  });
}

test("an external return URL is sanitized in both request and response", async ({ page }) => {
  const requests = await mockLogin(page, 200, { data: { status: "signed_in", redirectTo: "https://evil.example" } });
  await page.goto("/giris?next=https%3A%2F%2Fevil.example"); await fill(page);
  await page.getByRole("button", { name: "E-posta ile giriş yap" }).click();
  await expect(page).toHaveURL(/\/hesabim$/);
  expect(requests[0].next).toBe("/hesabim");
});

// Signed-in UI is compiled from the real component and served in memory.
// No forged auth cookie is sent to Next; server verification is unit-tested.
test.describe("logout component acceptance", () => {
  let assets: Map<string, string | Buffer>;
  let html: string;
  test.beforeAll(async () => {
    const root = fileURLToPath(new URL("../..", import.meta.url));
    const result = await build({ configFile: false, root, base: "/__login-fixture/", publicDir: false, envDir: false, logLevel: "error",
      resolve: { alias: { "@": root } },
      define: { "process.env": JSON.stringify({ NODE_ENV: "production" }) },
      build: { write: false, rollupOptions: { input: fileURLToPath(new URL("fixtures/login.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed login fixture bundle.");
    assets = new Map(bundle.output.map(entry => [entry.fileName, entry.type === "chunk" ? entry.code : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    html = [...assets.keys()].find(name => name.endsWith("login.html"))!;
  });
  test.beforeEach(async ({ page }) => {
    await page.route("**/__login-fixture/**", async route => {
      const name = new URL(route.request().url()).pathname.replace("/__login-fixture/", "") || html;
      const body = assets.get(name);
      await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset", contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
    });
  });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`logout preserves guest cart and handles errors (${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      await page.addInitScript(key => localStorage.setItem(key, JSON.stringify([{ productId: "sample-green-olive-1kg", quantity: 2 }])), CART_STORAGE_KEY);
      await page.route("**/auth/logout", route => route.fulfill({ status: 429, contentType: "application/json", body: "{}" }));
      await page.goto("/__login-fixture/");
      await page.getByRole("button", { name: "Çıkış yap" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("alert")).toContainText("Çok fazla deneme");
      await expect(page.getByRole("button", { name: "Çıkış yap" })).toBeEnabled();
      await expect(page.getByRole("form")).toHaveCount(0);
      const requests: string[] = [];
      await page.route("**/auth/logout", async route => { requests.push(route.request().method()); await route.fulfill({ status: 204 }); });
      await page.getByRole("button", { name: "Çıkış yap" }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/giris$/);
      await expect(page.getByRole("form", { name: "E-posta ile giriş" })).toBeVisible();
      await expect(page.getByRole("status")).toHaveText("Oturumunuz kapatıldı.");
      expect(requests).toEqual(["POST"]);
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CART_STORAGE_KEY)).toEqual([{ productId: "sample-green-olive-1kg", quantity: 2 }]);
    });
  }
});
