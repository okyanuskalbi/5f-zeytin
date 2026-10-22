import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { build } from "vite";

const cta = "Toptan Satış İçin İletişime Geçin";
const form = (page: Page) => page.getByRole("form", { name: "Toptan teklif isteyin" });

async function fillRequest(page: Page, channel: "email" | "phone" = "email"): Promise<void> {
  await form(page).getByRole("checkbox").check();
  await form(page).getByRole("textbox", { name: "İsim / firma", exact: true }).fill("Örnek Firma");
  if (channel === "email") await form(page).getByRole("textbox", { name: "E-posta", exact: true }).fill("talep@example.test");
  else await form(page).getByRole("textbox", { name: "Telefon", exact: true }).fill("+90 (555) 123 45 67");
  await form(page).getByRole("textbox", { name: "Talep mesajı", exact: true }).fill("Sofralık zeytin ve zeytinyağı için bilgi rica ederim.");
}

test("landing hides wholesale contact and its footer link until details exist", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") writes.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: cta, exact: true })).toHaveCount(0);
  await expect(form(page)).toHaveCount(0);
  await expect(page.locator("#toptan, #toptan-iletisim")).toHaveCount(0);
  expect(writes).toEqual([]);
});

test("JavaScript-free landing omits the unavailable wholesale contact", async ({ browser, baseURL, page }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: page.viewportSize()! });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/#toptan");
    await expect(form(staticPage)).toHaveCount(0);
    await expect(staticPage.locator("#toptan, #toptan-iletisim, #toptan-title")).toHaveCount(0);
    await expect(staticPage.getByRole("contentinfo").getByRole("link", { name: cta, exact: true })).toHaveCount(0);
  } finally { await context.close(); }
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
    const name = form(page).getByRole("textbox", { name: "İsim / firma", exact: true });
    const email = form(page).getByRole("textbox", { name: "E-posta", exact: true });
    const phone = form(page).getByRole("textbox", { name: "Telefon", exact: true });
    const message = form(page).getByRole("textbox", { name: "Talep mesajı", exact: true });
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

  test("KVKK acknowledgement is explicit and required before the injected submission", async ({ page }) => {
    const consent = form(page).getByRole("checkbox");
    await expect(consent).not.toBeChecked();
    await fillRequest(page);
    await consent.uncheck();
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await expect(consent).toBeFocused();
    await expect(consent).toHaveAttribute("aria-invalid", "true");
    await expect(consent).toHaveAccessibleDescription(/okuduğunuzu belirtin/);
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("0");
    await consent.check();
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await expect(consent).toBeDisabled();
    await page.getByRole("button", { name: "Mock başarı" }).click();
    await expect(form(page).getByRole("status")).toHaveText("Talebiniz gönderildi.");
    await expect(consent).not.toBeChecked();
  });

  test("mock pending locks edits and duplicate submissions; explicit success clears the form", async ({ page }) => {
    await fillRequest(page);
    const submit = form(page).getByRole("button", { name: "Talebi gönder", exact: true });
    await submit.dblclick({ force: true });
    await expect(form(page)).toHaveAttribute("aria-busy", "true");
    await expect(form(page).getByRole("status")).toHaveText("Talebiniz gönderiliyor…");
    await expect(form(page).getByRole("textbox", { name: "Talep mesajı", exact: true })).toBeDisabled();
    await expect(form(page).getByRole("button", { name: "Gönderiliyor…", exact: true })).toBeDisabled();
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("1");
    await page.getByRole("button", { name: "Mock başarı" }).click();
    await expect(form(page).getByRole("status")).toHaveText("Talebiniz gönderildi.");
    await expect(form(page).getByRole("status")).toBeFocused();
    for (const label of ["İsim / firma", "E-posta", "Telefon", "Talep mesajı"]) {
      await expect(form(page).getByRole("textbox", { name: label, exact: true })).toHaveValue("");
    }
    const payload = JSON.parse(await page.getByTestId("mock-payload").textContent() ?? "{}");
    expect(payload).toEqual({ name: "Örnek Firma", email: "talep@example.test", phone: "", message: "Sofralık zeytin ve zeytinyağı için bilgi rica ederim." });
    await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
    await expect(form(page).getByRole("status")).toHaveText("");
    await expect(form(page).getByRole("textbox", { name: "İsim / firma", exact: true })).toBeFocused();
    await expect(page.getByRole("status", { name: "Mock çağrı sayısı" })).toHaveText("1");
  });

  test("mock error and rejection preserve the request for retry; phone alone is sufficient", async ({ page }) => {
    await fillRequest(page, "phone");
    for (const outcome of ["Mock hata", "Mock bağlantı hatası"]) {
      await form(page).getByRole("button", { name: "Talebi gönder", exact: true }).click();
      await page.getByRole("button", { name: outcome, exact: true }).click();
      await expect(form(page).getByRole("alert")).toContainText("Talebiniz gönderilemedi. Bilgilerinizi kontrol edip tekrar deneyin.");
      await expect(form(page).getByRole("alert")).toBeFocused();
      await expect(form(page).getByRole("textbox", { name: "Telefon", exact: true })).toHaveValue("+90 (555) 123 45 67");
      await expect(form(page).getByRole("textbox", { name: "E-posta", exact: true })).toHaveValue("");
      await expect(form(page).getByRole("textbox", { name: "Talep mesajı", exact: true })).toHaveValue("Sofralık zeytin ve zeytinyağı için bilgi rica ederim.");
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
      const name = form(page).getByRole("textbox", { name: "İsim / firma", exact: true });
      await name.focus();
      for (const label of ["E-posta", "Telefon", "Talep mesajı"]) {
        await page.keyboard.press(next);
        const field = form(page).getByRole("textbox", { name: label, exact: true });
        await expect(field).toBeFocused();
        expect(await field.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
      }
      await page.keyboard.press(next);
      await expect(form(page).getByRole("checkbox")).toBeFocused();
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
