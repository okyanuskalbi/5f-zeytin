import { expect, test, type Page } from "@playwright/test";

// Task164: IDs are desktop hash markers, while semantic scene sections remain
// stable across cinematic/native mode changes.
const journey = (page: Page) => page.locator("[data-harvest-journey]");
const scene = (page: Page, id: string) => page.locator(`section[data-sc-scene="${id}"]`);
const scenes = ["baslangic", "tesisimiz", "uretim-yolculugu", "urunler", "toptan-iletisim", "teklif", "iletisim"];

async function cinematicScreen(page: Page) {
  return page.evaluate(() => matchMedia("(min-width: 1024px) and (min-height: 760px) and (hover: hover) and (pointer: fine)").matches);
}

async function currentProgress(page: Page) {
  return journey(page).evaluate(element => {
    const span = element.clientHeight - innerHeight;
    return span > 0 ? -element.getBoundingClientRect().top / span : 0;
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 }));
});

test("the seven semantic scenes retain their headings, imagery and destinations in native and cinematic mode", async ({ page }) => {
  const cinematic = await cinematicScreen(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(journey(page)).toHaveAttribute("data-mode", cinematic ? "cinematic" : "native");
  expect(await page.locator("main section[data-sc-scene]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-sc-scene")))).toEqual(scenes);
  await expect(page.locator("h1")).toHaveCount(1);
  for (const id of scenes) {
    const section = scene(page, id);
    await expect(section).toHaveAttribute("data-21st-source", /^\d+$/);
    await expect(section.getByRole("heading").first()).toBeAttached();
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  }
  if (cinematic) {
    const navigation = journey(page).getByRole("navigation", { name: "Hasat yolculuğu" });
    for (const [id, label, progress] of [["tesisimiz", "Üretim", .55], ["uretim-yolculugu", "Sofra", .9], ["baslangic", "Zeytinlik", 0]] as const) {
      await navigation.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect.poll(async () => Math.abs(await currentProgress(page) - progress)).toBeLessThan(.02);
      await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "step");
      await expect(scene(page, id)).toHaveCSS("opacity", "1");
      await expect(scene(page, id).getByRole("heading").first()).toBeInViewport();
    }
  } else {
    for (const id of scenes.slice(0, 3)) {
      await expect(scene(page, id)).toHaveAttribute("id", id);
      await scene(page, id).getByRole("heading").first().scrollIntoViewIfNeeded();
      await expect(scene(page, id).getByRole("heading").first()).toBeInViewport();
      await expect(scene(page, id).locator("picture img").first()).toBeVisible();
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("direct factory and table hashes resolve after hydration changes the common scene height", async ({ page }) => {
  const cinematic = await cinematicScreen(page);
  for (const [id, progress] of [["tesisimiz", .55], ["uretim-yolculugu", .9]] as const) {
    await page.goto(`/#${id}`, { waitUntil: "networkidle" });
    await expect(journey(page)).toHaveAttribute("data-mode", cinematic ? "cinematic" : "native");
    if (cinematic) await expect.poll(async () => Math.abs(await currentProgress(page) - progress)).toBeLessThan(.02);
    await expect(scene(page, id).getByRole("heading").first()).toBeInViewport();
    await expect(scene(page, id)).toHaveCSS("opacity", "1");
  }
});

test("focusing a different held scene reveals its content instead of trapping keyboard focus offscreen", async ({ page }) => {
  test.skip(!await cinematicScreen(page), "Native sections already use ordinary document focus.");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(journey(page)).toHaveAttribute("data-mode", "cinematic");
  const factoryLink = scene(page, "tesisimiz").getByRole("link", { name: /Bir AFİNA Şirketler Topluluğu markası/ });
  const tableLink = scene(page, "uretim-yolculugu").getByRole("link", { name: "Sofranız için ürünleri keşfedin", exact: true });
  const openingLink = scene(page, "baslangic").getByRole("link", { name: "Ürünleri Keşfet", exact: true });
  for (const [target, id, progress] of [[factoryLink, "tesisimiz", .55], [tableLink, "uretim-yolculugu", .9], [openingLink, "baslangic", 0]] as const) {
    await target.focus();
    await expect(target).toBeFocused();
    await expect.poll(async () => Math.abs(await currentProgress(page) - progress)).toBeLessThan(.02);
    await expect(scene(page, id)).toHaveCSS("opacity", "1");
    await expect(target).toBeInViewport();
  }
});

test("all three business chapters hand their segment to the unchanged manual quote form", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const business = scene(page, "toptan-iletisim");
  await expect(business.locator("[data-business-chapter]")).toHaveCount(3);
  await expect(business.locator("picture img")).toHaveCount(2);
  for (const segment of ["hospitality", "retail", "bulk"]) {
    const chapter = business.locator(`[data-business-chapter="${segment}"]`);
    const action = chapter.getByRole("button", { name: /^Teklif hazırlayın/ });
    await action.scrollIntoViewIfNeeded();
    await expect(chapter.getByRole("heading", { level: 3 })).toBeVisible();
    await action.click();
    await expect(page).toHaveURL(/#teklif$/);
    await expect(scene(page, "teklif").getByRole("combobox", { name: "İşletme türü", exact: true })).toHaveValue(segment);
    await expect(action).toHaveAttribute("aria-pressed", "true");
  }
  await expect(scene(page, "teklif")).toContainText("Gönderimi e-posta uygulamanızda siz tamamlarsınız.");
  await expect(scene(page, "teklif").getByRole("link", { name: "E-postayla gönder", exact: true })).toHaveCount(0);
  await scene(page, "iletisim").getByRole("heading", { name: "Sofrada görüşürüz.", exact: true }).scrollIntoViewIfNeeded();
  await expect(scene(page, "iletisim").getByRole("heading", { name: "Sofrada görüşürüz.", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("reduced motion releases the common stage and business hold without hiding any chapter", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const movies: string[] = [];
  page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) movies.push(request.url()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(journey(page)).toHaveAttribute("data-mode", "native");
  await expect(scene(page, "toptan-iletisim")).toHaveAttribute("data-business-mode", "native");
  for (const id of scenes.slice(0, 3)) {
    await expect(scene(page, id)).toHaveAttribute("id", id);
    await expect(scene(page, id)).toHaveCSS("position", "relative");
    await expect(scene(page, id)).toHaveCSS("opacity", "1");
  }
  for (const chapter of await page.locator("[data-business-chapter]").all()) {
    await expect(chapter.getByRole("heading")).toBeVisible();
    await expect(chapter.getByRole("button")).toBeEnabled();
  }
  await expect(journey(page).locator("video")).not.toHaveAttribute("src");
  expect(movies).toEqual([]);
});

test("JavaScript-off serves seven native scenes, three business chapters and safe quote navigation", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL,
    viewport: testInfo.project.use.viewport ?? { width: 390, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(journey(page)).toHaveAttribute("data-mode", "native");
    expect(await page.locator("main section[data-sc-scene]").evaluateAll(nodes => nodes.map(node => node.id))).toEqual(scenes);
    const business = scene(page, "toptan-iletisim");
    await expect(business.locator("[data-business-chapter]")).toHaveCount(3);
    for (const chapter of await business.locator("[data-business-chapter]").all()) {
      await expect(chapter.getByRole("heading")).toBeVisible();
      await expect(chapter.getByRole("button")).toBeDisabled();
    }
    await business.getByRole("link", { name: "Talebinizi paylaşın", exact: true }).click();
    await expect(page).toHaveURL(/#teklif$/);
    const form = scene(page, "teklif").getByRole("form", { name: "Kurumsal teklif talebi" });
    await expect(form).toBeVisible();
    await expect(form.getByRole("button", { name: "Talep özetini hazırla", exact: true })).toBeDisabled();
    await expect(journey(page).locator("video")).not.toHaveAttribute("src");
  } finally { await context.close(); }
});
