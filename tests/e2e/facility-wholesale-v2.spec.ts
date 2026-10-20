import { mkdir, writeFile } from "node:fs/promises";
import { devices, expect, test, type Page } from "@playwright/test";

async function audit(page: Page, name: string): Promise<void> {
  await page.goto("/#tesisimiz");
  await page.evaluate(() => document.fonts.ready);
  const facility = page.locator("#tesisimiz");
  await facility.focus();
  await expect(facility).toHaveCSS("background-color", "rgb(108, 203, 60)");
  await expect(facility.locator("svg[role=img] path")).toHaveCSS("fill", "rgb(13, 17, 13)");
  await expect(facility.locator("svg[role=img] circle")).toHaveCSS("fill", "rgb(108, 203, 60)");
  await expect(facility.locator("img, picture, video, canvas, image")).toHaveCount(0);
  await expect(page.locator("#toptan-iletisim")).toHaveCSS("background-color", "rgb(36, 58, 41)");
  const metrics = await page.evaluate(() => {
    const region = document.querySelector<HTMLElement>("#tesisimiz")!;
    const wholesale = document.querySelector<HTMLElement>("#toptan-iletisim")!;
    const title = region.querySelector("h2")!;
    const left = region.querySelector("[data-facility-typography]")!.getBoundingClientRect();
    const right = region.querySelector("svg[role=img]")!.getBoundingClientRect();
    const form = wholesale.querySelector("form")!;
    const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const luminance = (color: number[]) => color.slice(0, 3).map(channel => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const contrast = (a: string, b: string) => {
      const [high, low] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x);
      return (high + 0.05) / (low + 0.05);
    };
    const background = (element: Element): string => {
      let current: Element | null = element;
      while (current) {
        const value = getComputedStyle(current).backgroundColor;
        if ((rgb(value)[3] ?? 1) > 0) return value;
        current = current.parentElement;
      }
      return "rgb(255, 255, 255)";
    };
    const text = [region, wholesale].flatMap(root => [...root.querySelectorAll("h2,h3,p,dt,dd,address,a,label,span,input,textarea,button")])
      .filter(element => (element.textContent?.trim() || element.matches("input:not([type=checkbox]),textarea")) && element.getBoundingClientRect().height > 0)
      .map(element => ({ text: element.textContent?.trim().slice(0, 60) || element.getAttribute("name"), ratio: contrast(getComputedStyle(element).color, background(element)), size: parseFloat(getComputedStyle(element).fontSize) }));
    return {
      width: innerWidth,
      facilityWidth: region.getBoundingClientRect().width,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      headingLines: title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight),
      copyLeft: left.x, copyRight: left.right, copyBottom: left.bottom,
      mapLeft: right.left, mapTop: right.top,
      formBackground: getComputedStyle(form).backgroundColor,
      facilityPadding: getComputedStyle(region).paddingBlock,
      wholesaleGap: getComputedStyle(wholesale).gap,
      headingFont: getComputedStyle(title).fontFamily,
      bodyFont: getComputedStyle(region.querySelector("p")!).fontFamily,
      text,
    };
  });
  await mkdir("test-results/104", { recursive: true });
  await writeFile(`test-results/104/${name}-audit.json`, JSON.stringify(metrics, null, 2));
  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(0);
  expect(metrics.facilityWidth).toBe(metrics.width);
  expect(metrics.headingLines).toBeLessThanOrEqual(2.01);
  expect(metrics.formBackground).toBe("rgba(0, 0, 0, 0)");
  expect(metrics.text.filter(item => item.ratio < 4.5)).toEqual([]);
  expect(metrics.text.every(item => item.size >= 13)).toBe(true);
  if (metrics.width >= 768) expect(metrics.mapLeft).toBeGreaterThan(metrics.copyRight);
  else expect(metrics.mapTop).toBeGreaterThanOrEqual(metrics.copyBottom);
  await page.screenshot({ path: `test-results/104/${name}-facility.png` });
  await facility.getByRole("img").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/104/${name}-map.png` });
  await page.locator("#toptan-iletisim").focus();
  await page.locator("#toptan-iletisim").evaluate(node => node.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.screenshot({ path: `test-results/104/${name}-wholesale.png` });
  await page.getByRole("checkbox").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/104/${name}-kvkk.png` });
}

test("factory band and wholesale form meet AA contrast and responsive v2 layout", async ({ page }, testInfo) => {
  await audit(page, testInfo.project.name);
});

test("touch and reduced motion retain the factory and wholesale controls", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ ...devices["Pixel 7"], reducedMotion: "reduce", baseURL: testInfo.project.use.baseURL });
  try {
    const page = await context.newPage();
    await audit(page, `pixel7-${testInfo.project.name}-reduced`);
    await expect(page.locator("[data-facility-enter]").first()).toHaveCSS("transform", "none");
    await page.getByRole("checkbox").tap();
    await expect(page.getByRole("checkbox")).toBeChecked();
    await expect(page.getByRole("button", { name: "Talebi gönder", exact: true })).toBeDisabled();
  } finally { await context.close(); }
});

test("facility and legal links retain visible keyboard, hover and active states", async ({ page }, testInfo) => {
  await page.goto("/#tesisimiz");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const controls = [
    page.locator("#tesisimiz").getByRole("link", { name: "Ürünlerimizi Keşfedin" }),
    page.locator("#tesisimiz").getByRole("link", { name: "Toptan Satış İçin İletişime Geçin" }),
    page.getByRole("link", { name: "KVKK aydınlatma metni", exact: true }),
  ];
  for (const [index, control] of controls.entries()) {
    await page.keyboard.press("Tab");
    await control.focus();
    await expect(control).toBeFocused();
    const outline = await control.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth));
    expect(outline).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: `test-results/104/${testInfo.project.name}-link-${index}-focus.png` });
    await control.hover();
    await page.screenshot({ path: `test-results/104/${testInfo.project.name}-link-${index}-hover.png` });
    await page.mouse.down();
    expect(await control.evaluate(node => node.matches(":active"))).toBe(true);
    await page.screenshot({ path: `test-results/104/${testInfo.project.name}-link-${index}-active.png` });
    // Release outside the link so the state check never navigates away.
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
});
