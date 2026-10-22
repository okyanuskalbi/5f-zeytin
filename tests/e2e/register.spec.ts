import { expect, test, type Page } from "@playwright/test";
import { registrationConfirmation } from "../../lib/contracts/register";

// Every POST is intercepted before navigation: no real account/email is created.
async function mockRegistration(page: Page, status = 202, body: unknown = { data: { status: "confirmation_required" } }) {
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/auth/register**", async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return requests;
}

async function fill(page: Page) {
  await page.getByLabel("Ad soyad", { exact: true }).fill("Deniz Test");
  await page.getByLabel("E-posta", { exact: true }).fill("deniz@example.test");
  await page.getByLabel("Şifre", { exact: true }).fill("Sofrada123!");
  await page.getByRole("checkbox", { name: /KVKK/ }).check();
  await page.getByRole("checkbox", { name: /Açık rıza/ }).check();
}

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) throw new Error("Registration acceptance requires the local mocked target.");
  await page.route("**/*.supabase.co/**", route => route.abort());
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`email confirmation, optional marketing and keyboard access (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const requests = await mockRegistration(page);
    await page.goto("/kayit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Soframıza katılın.");
    const name = page.getByLabel("Ad soyad", { exact: true });
    await name.focus();
    await page.keyboard.type("Deniz Test");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("E-posta", { exact: true })).toBeFocused();
    await page.keyboard.type("deniz@example.test");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Şifre", { exact: true })).toBeFocused();
    await page.keyboard.type("Sofrada123!");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Şifreyi göster" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveAttribute("type", "text");
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("checkbox", { name: /KVKK/ })).toBeFocused();
    await page.keyboard.press("Space");
    await page.getByRole("checkbox", { name: /Açık rıza/ }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("checkbox", { name: /Ticari/ })).not.toBeChecked();
    await page.getByRole("button", { name: "Üyelik oluştur" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main").getByRole("status")).toHaveText(registrationConfirmation);
    await expect(page.getByRole("main").getByRole("status")).toBeFocused();
    await expect(page).toHaveURL(/\/kayit$/);
    await expect(page.getByLabel("Şifre", { exact: true })).toHaveValue("");
    expect(requests).toEqual([{ name: "Deniz Test", email: "deniz@example.test", password: "Sofrada123!", privacy: true, consent: true, marketing: false }]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("invalid fields and separate required consents block the request", async ({ page }) => {
  const requests = await mockRegistration(page);
  await page.goto("/kayit");
  await page.getByRole("button", { name: "Üyelik oluştur" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("alanları kontrol");
  await expect(page.getByLabel("Ad soyad", { exact: true })).toBeFocused();
  await expect(page.getByLabel("E-posta", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await fill(page);
  await page.getByRole("checkbox", { name: /Açık rıza/ }).uncheck();
  await page.getByRole("button", { name: "Üyelik oluştur" }).click();
  await expect(page.getByRole("checkbox", { name: /Açık rıza/ })).toBeFocused();
  expect(requests).toHaveLength(0);
});

test("sanitized server errors preserve input and allow retry with marketing opt-in", async ({ page }) => {
  await mockRegistration(page, 503, { error: { message: "private provider details" } });
  await page.goto("/kayit");
  await fill(page);
  await page.getByRole("button", { name: "Üyelik oluştur" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Üyelik hizmeti");
  await expect(page.getByRole("main")).not.toContainText("private provider details");
  await expect(page.getByLabel("Şifre", { exact: true })).toHaveValue("Sofrada123!");
  await page.unroute("**/api/auth/register**");
  const requests = await mockRegistration(page);
  await page.getByRole("checkbox", { name: /Ticari/ }).check();
  await page.getByRole("button", { name: "Üyelik oluştur" }).click();
  await expect(page.getByRole("main").getByRole("status")).toHaveText(registrationConfirmation);
  expect(requests[0].marketing).toBe(true);
});

test("provider rate limit is announced accessibly", async ({ page }) => {
  await mockRegistration(page, 429, {});
  await page.goto("/kayit");
  await fill(page);
  await page.getByRole("button", { name: "Üyelik oluştur" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Çok fazla deneme");
  await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
});
