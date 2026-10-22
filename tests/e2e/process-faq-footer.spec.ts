import { expect, test } from "@playwright/test";

// The removed v2 process strip is replaced by the v4 wholesale/FAQ flow.
test("lower sections retain readable brand typography and AA contrast", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#topraktan-sofraya")).toHaveCount(0);
  await expect(page.locator("#sik-sorulanlar details")).toHaveCount(3);
  for (const details of await page.locator("#sik-sorulanlar details").all()) await details.locator("summary").click();
  await expect(page.getByRole("contentinfo")).toHaveCSS("background-color", "rgb(10, 15, 11)");
  const metrics = await page.evaluate(() => {
    const luminance = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const background = (node: Element): string => {
      for (let current: Element | null = node; current; current = current.parentElement) {
        const color = getComputedStyle(current).backgroundColor;
        if (color !== "rgba(0, 0, 0, 0)") return color;
      }
      return "rgb(250, 247, 240)";
    };
    const roots = [document.querySelector("#tesisimiz")!, document.querySelector("#toptan-iletisim")!, document.querySelector("#sik-sorulanlar")!, document.querySelector("footer")!];
    return roots.flatMap(root => [...root.querySelectorAll("h2,h3,p,address,a,summary")]).filter(node => node.textContent?.trim() && node.getBoundingClientRect().height > 0).map(node => {
      const style = getComputedStyle(node);
      const [high, low] = [luminance(style.color), luminance(background(node))].sort((a, b) => b - a);
      return { text: node.textContent!.slice(0, 60), contrast: (high + 0.05) / (low + 0.05), size: parseFloat(style.fontSize), font: style.fontFamily };
    });
  });
  expect(metrics.filter(item => item.contrast < 4.5 || item.size < 12)).toEqual([]);
  expect(metrics.some(item => /Fraunces/i.test(item.font))).toBe(true);
  expect(metrics.some(item => /Figtree/i.test(item.font))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
