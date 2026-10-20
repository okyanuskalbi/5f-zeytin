import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { build } from "vite";

const cta = "Toptan Satış İçin İletişime Geçin";
const form = (page: Page) => page.getByRole("form", { name: "Toptan talep formu" });

async function fillRequest(page: Page, channel: "email" | "phone" = "email"): Promise<void> {
  await form(page).getByLabel("İsim / firma", { exact: true }).fill("Örnek Firma");
  if (channel === "email") await form(page).getByLabel("E-posta", { exact: true }).fill("talep@example.test");
  else await form(page).getByLabel("Telefon", { exact: true }).fill("+90 (555) 123 45 67");
  await form(page).getByLabel("Talep mesajı", { exact: true }).fill("Sofralık zeytin ve zeytinyağı için bilgi rica ederim.");
}

test("landing CTA reaches the focusable wholesale form and never claims delivery without a service", async ({ page }, testInfo) => {
  await page.goto("/");
  const link = page.locator("#toptan-iletisim").getByRole("link", { name: cta, exact: true });
  await expect(link).toHaveAttribute("href", "#toptan-iletisim");
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#toptan-iletisim$/);
  await expect(page.locator("#toptan-iletisim")).toBeFocused();
  await expect(form(page)).toBeVisible();
  await expect(form(page)).toContainText("Sofralık zeytin • Salamura zeytin • Zeytinyağı");
  await expect(form(page).getByRole("link", { name: "KVKK aydınlatma metni" })).toHaveAttribute("href", "/kvkk");
  await expect(form(page)).toContainText("KVKK metni taslaktır; onay bekleniyor.");
  await expect(form(page).getByRole("checkbox")).toHaveCount(0);
  await expect(form(page).getByRole("status")).toContainText("Toptan talep gönderimi henüz kullanıma açık değil.");
  await fillRequest(page);
  await expect(form(page).getByRole("button", { name: "Talebi gönder", exact: true })).toBeDisabled();
  const requests: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") requests.push(request.url()); });
  await form(page).getByLabel("E-posta", { exact: true }).press("Enter");
  await expect(form(page).getByRole("status")).not.toContainText("Talebiniz gönderildi.");
  expect(requests).toEqual([]);
  expect(new URL(page.url()).search).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await form(page).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("wholesale-landing.png"), fullPage: true });
  await form(page).getByRole("link", { name: "KVKK aydınlatma metni" }).click();
  await expect(page.getByRole("heading", { name: "Taslak — onay bekleniyor" })).toBeVisible();
});

test("JavaScript-free landing keeps the form, legal link and honest disabled submission", async ({ browser, baseURL, page }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: page.viewportSize()! });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/#toptan-iletisim");
    await expect(form(staticPage)).toBeVisible();
    await expect(form(staticPage).getByRole("button", { name: "Talebi gönder", exact: true })).toBeDisabled();
    await expect(form(staticPage).getByLabel("İsim / firma", { exact: true })).toBeDisabled();
    await form(staticPage).getByRole("link", { name: "KVKK aydınlatma metni" }).click();
    await expect(staticPage.getByRole("heading", { name: "KVKK", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test("the floating product shortcut leaves the whole wholesale form clear during scroll", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const bounds = await form(page).evaluate(node => ({ top: node.getBoundingClientRect().top + scrollY, height: node.getBoundingClientRect().height }));
  for (const fraction of [0, 0.5, 1]) {
    await page.evaluate(({ top, height, fraction }) => scrollTo(0, top + height * fraction - innerHeight / 2), { ...bounds, fraction });
    await expect(page.locator("[data-hero-stub]")).toHaveAttribute("data-visible", "true");
    await expect.poll(() => form(page).evaluate(node => {
      const stub = document.querySelector<HTMLElement>("[data-hero-stub]");
      if (!stub || getComputedStyle(stub).visibility !== "visible") return false;
      const shortcut = stub.getBoundingClientRect();
      const panel = node.getBoundingClientRect();
      return shortcut.left < panel.right && shortcut.right > panel.left && shortcut.top < panel.bottom && shortcut.bottom > panel.top;
    })).toBe(false);
  }
  await page.evaluate(top => scrollTo(0, top - 96), bounds.top);
  await expect(form(page).getByRole("heading", { name: "Toptan talep formu" })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("wholesale-form-start.png") });
  await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("wholesale-form-end.png") });
});

test.describe("injected wholesale form", () => {
  let assets: Map<string, string | Buffer>;
  let html: string;
  test.beforeAll(async () => {
    if (process.env.PLAYWRIGHT_BASE_URL !== undefined) throw new Error("Wholesale fixtures require the local checkout.");
    const root = fileURLToPath(new URL("../..", import.meta.url));
    const result = await build({
      configFile: false, root, base: "/__wholesale-fixture/", publicDir: false, logLevel: "error",
      resolve: { alias: { "@": root } },
      build: { write: false, rollupOptions: { input: fileURLToPath(new URL("fixtures/wholesale-form.html", import.meta.url)) } },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected completed fixture bundle.");
    assets = new Map(bundle.output.map(entry => [entry.fileName, entry.type === "chunk" ? entry.code
      : typeof entry.source === "string" ? entry.source : Buffer.from(entry.source)]));
    html = [...assets.keys()].find(name => name.endsWith("wholesale-form.html"))!;
  });
  test.beforeEach(async ({ page }) => {
    await page.route("**/__wholesale-fixture/**", async route => {
      const name = new URL(route.request().url()).pathname.replace("/__wholesale-fixture/", "") || html;
      const body = assets.get(name);
      await route.fulfill({ status: body ? 200 : 404, body: body ?? "Unknown test asset",
        contentType: name.endsWith(".js") ? "application/javascript" : name.endsWith(".css") ? "text/css" : "text/html" });
    });
    await page.goto("/__wholesale-fixture/");
    await expect(form(page).getByRole("button", { name: "Talebi gönder", exact: true })).toBeEnabled();
  });

  test("invalid fields expose associated errors, length limits and first-invalid focus without sending", async ({ page }) => {
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    const name = form(page).getByLabel("İsim / firma", { exact: true });
    const email = form(page).getByLabel("E-posta", { exact: true });
    const phone = form(page).getByLabel("Telefon", { exact: true });
    const message = form(page).getByLabel("Talep mesajı", { exact: true });
    await expect(name).toBeFocused();
    for (const field of [name, email, phone, message]) await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription(/2–120/);
    await expect(email).toHaveAccessibleDescription(/en az bir/);
    await expect(phone).toHaveAccessibleDescription(/en az bir/);
    await expect(message).toHaveAccessibleDescription(/10–2000/);
    await expect(name).toHaveAttribute("maxlength", "120");
    await expect(email).toHaveAttribute("maxlength", "254");
    await expect(phone).toHaveAttribute("maxlength", "30");
    await expect(message).toHaveAttribute("maxlength", "2000");
    await fillRequest(page);
    await email.fill("yanlis@");
    await phone.fill("abc");
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await expect(email).toBeFocused();
    await expect(email).toHaveAccessibleDescription(/Geçerli bir e-posta/);
    await expect(phone).toHaveAccessibleDescription(/Geçerli bir telefon/);
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("0");
  });

  test("mock pending locks edits and duplicate submissions; explicit success clears the form", async ({ page }) => {
    await fillRequest(page);
    const submit = form(page).getByRole("button", { name: "Talebi gönder", exact: true });
    await submit.dblclick({ force: true });
    await expect(form(page)).toHaveAttribute("aria-busy", "true");
    await expect(form(page).getByRole("status")).toHaveText("Talebiniz gönderiliyor…");
    await expect(form(page).getByLabel("Talep mesajı", { exact: true })).toBeDisabled();
    await expect(form(page).getByRole("button", { name: "Gönderiliyor…", exact: true })).toBeDisabled();
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("1");
    await page.getByRole("button", { name: "Mock başarı" }).click();
    await expect(form(page).getByRole("status")).toHaveText("Talebiniz gönderildi.");
    await expect(form(page).getByRole("status")).toBeFocused();
    for (const label of ["İsim / firma", "E-posta", "Telefon", "Talep mesajı"]) {
      await expect(form(page).getByLabel(label, { exact: true })).toHaveValue("");
    }
    const payload = JSON.parse(await page.getByTestId("mock-payload").textContent() ?? "{}");
    expect(payload).toEqual({ name: "Örnek Firma", email: "talep@example.test", phone: "", message: "Sofralık zeytin ve zeytinyağı için bilgi rica ederim." });
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await expect(form(page).getByRole("status")).toHaveText("");
    await expect(form(page).getByLabel("İsim / firma", { exact: true })).toBeFocused();
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("1");
  });

  test("mock error and rejection preserve the request for retry; phone alone is sufficient", async ({ page }) => {
    await fillRequest(page, "phone");
    for (const outcome of ["Mock hata", "Mock bağlantı hatası"]) {
      await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
      await page.getByRole("button", { name: outcome, exact: true }).click();
      await expect(form(page).getByRole("alert")).toContainText("Talebiniz gönderilemedi. Bilgilerinizi kontrol edip tekrar deneyin.");
      await expect(form(page).getByRole("alert")).toBeFocused();
      await expect(form(page).getByLabel("Telefon", { exact: true })).toHaveValue("+90 (555) 123 45 67");
      await expect(form(page).getByLabel("E-posta", { exact: true })).toHaveValue("");
      await expect(form(page).getByLabel("Talep mesajı", { exact: true })).toHaveValue("Sofralık zeytin ve zeytinyağı için bilgi rica ederim.");
      await expect(form(page).getByRole("status")).not.toContainText("Talebiniz gönderildi.");
    }
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await page.getByRole("button", { name: "Mock başarı" }).click();
    await expect(form(page).getByRole("status")).toHaveText("Talebiniz gönderildi.");
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("3");
  });

  test("keyboard, mobile and reduced motion keep fields, legal link and submit reachable", async ({ page, browserName }, testInfo) => {
    const next = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 480 });
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      const name = form(page).getByLabel("İsim / firma", { exact: true });
      await name.focus();
      for (const label of ["E-posta", "Telefon", "Talep mesajı"]) {
        await page.keyboard.press(next);
        const field = form(page).getByLabel(label, { exact: true });
        await expect(field).toBeFocused();
        expect(await field.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
      }
      await page.keyboard.press(next);
      await expect(form(page).getByRole("link", { name: "KVKK aydınlatma metni" })).toBeFocused();
      await page.keyboard.press(next);
      const submit = form(page).getByRole("button", { name: "Talebi gönder", exact: true });
      await expect(submit).toBeFocused();
      await expect(submit).toBeInViewport();
      if (reducedMotion === "reduce") await expect(submit).toHaveCSS("transition-duration", "0s");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const control of await form(page).locator("input, textarea, button, a").all()) {
        const bounds = (await control.boundingBox())!;
        expect(Math.round(bounds.height * 1000) / 1000).toBeGreaterThanOrEqual(44);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
      }
      await page.screenshot({ path: testInfo.outputPath(`wholesale-${reducedMotion}.png`), fullPage: true });
    }
  });
});
