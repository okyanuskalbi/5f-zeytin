import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Written for Claude. Coder does not run browser acceptance.
// Captured from the unchanged Task 123 component/CSS before Task 127 was applied.
// The ~663 CSS px quoted in the task describes an upper-section crop, not a
// measured total-footer baseline. Compare both complete footers in the same build.
const baseline = {
  html: readFileSync(new URL("./fixtures/footer-123.html", import.meta.url), "utf8"),
  css: readFileSync(new URL("./fixtures/footer-123.css", import.meta.url), "utf8"),
};

async function measureTask123(page: Page): Promise<{ total: number; upper: number }> {
  return page.evaluate(async ({ html, css }) => {
    const frame = document.createElement("iframe");
    frame.title = "Task 123 footer measurement fixture";
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:absolute;inset:0 auto auto 0;width:390px;height:1px;border:0;pointer-events:none;opacity:0";
    // Use the current build's fonts, global reset and tokens in an isolated
    // document. Old CSS Module class names were normalized when captured.
    const styles = [...document.querySelectorAll('link[rel="stylesheet"], head style')].map(node => node.outerHTML).join("");
    const loaded = new Promise<void>(resolve => frame.addEventListener("load", () => resolve(), { once: true }));
    frame.srcdoc = `<!doctype html><html lang="tr" class="${document.documentElement.className}"><head><base href="${location.origin}/">${styles}<style>${css}</style></head><body class="${document.body.className}">${html}</body></html>`;
    document.body.append(frame);
    try {
      await loaded;
      const doc = frame.contentDocument!;
      await doc.fonts.ready;
      await Promise.all([...doc.images].map(image => {
        image.loading = "eager";
        return image.decode();
      }));
      return {
        total: doc.querySelector("footer")!.getBoundingClientRect().height,
        upper: doc.querySelector(".columns")!.getBoundingClientRect().height,
      };
    } finally { frame.remove(); }
  }, baseline);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test("1440px has four aligned columns and an upper section no taller than 260px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const footer = page.getByRole("contentinfo");
  const columns = footer.locator('[aria-labelledby="footer-brand-title"]').locator("..");
  const layout = await columns.evaluate(node => ({
    height: node.getBoundingClientRect().height,
    tracks: getComputedStyle(node).gridTemplateColumns.split(" ").length,
    tops: [...node.children].map(child => child.getBoundingClientRect().top),
    gap: getComputedStyle(node).columnGap,
  }));
  expect(layout.tracks).toBe(4);
  expect(layout.gap).toBe("48px");
  expect(Math.max(...layout.tops) - Math.min(...layout.tops)).toBeLessThanOrEqual(1);
  expect(layout.height).toBeLessThanOrEqual(260);
  const brandLogo = footer.getByRole("img", { name: "Afina Zeytin", exact: true });
  await expect(brandLogo).toHaveCSS("height", "56px");
  const payment = footer.getByRole("group", { name: "Güvenli ödeme", exact: true });
  await expect(payment).toHaveCSS("margin-top", "32px");
  await expect(payment).toHaveCSS("padding-top", "16px");
  await expect(payment).toHaveCSS("padding-bottom", "16px");
  const imprint = payment.locator("xpath=following-sibling::*[1]");
  expect(await imprint.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBe(3);
});

test("390px is at least 30 percent shorter than the complete Task 123 footer", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await footer.locator("img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
  const before = await measureTask123(page);
  const after = {
    total: (await footer.boundingBox())!.height,
    upper: (await footer.locator('[aria-labelledby="footer-brand-title"]').locator("..").boundingBox())!.height,
  };
  const reduction = 1 - after.total / before.total;
  await info.attach("footer-123-vs-127-css-px", {
    body: JSON.stringify({ width: 390, before, after, reduction }, null, 2), contentType: "application/json",
  });
  expect(before.total).toBeGreaterThan(before.upper);
  expect(after.total).toBeLessThanOrEqual(before.total * .7);
  await expect(footer.getByRole("img", { name: "Afina Zeytin", exact: true })).toHaveCSS("height", "48px");
});

test("320–1920px preserves responsive order, touch targets and horizontal fit", async ({ page }) => {
  const footer = page.getByRole("contentinfo");
  for (const width of [320, 375, 390, 430, 640, 767, 768, 900, 1023, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const headings = await footer.locator("nav > h2, [aria-labelledby='footer-contact-title'] > h2").evaluateAll(nodes => nodes.map(node => {
      const { x, y } = node.getBoundingClientRect();
      return { x, y };
    }));
    expect(Math.abs(headings[0].y - headings[1].y)).toBeLessThanOrEqual(1);
    if (width < 768) expect(headings[2].y).toBeGreaterThan(headings[0].y);
    else expect(Math.abs(headings[0].y - headings[2].y)).toBeLessThanOrEqual(1);
    for (const link of await footer.getByRole("link").all()) {
      const box = (await link.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(width < 1024 ? 44 : 32);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(await footer.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    await expect(footer.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true })).toHaveCount(1);
  }
});

test("the mobile buy bar clears the final legal and preview lines", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator("[data-mobile-buy-bar]")).toHaveAttribute("aria-hidden", "true");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText(/VKN 0091520061/)).toBeInViewport();
  const note = footer.getByText("Önizleme: fiyatlar ve görseller temsilidir.", { exact: true });
  await expect(note).toBeInViewport();
  expect(await note.evaluate(node => {
    const box = node.getBoundingClientRect();
    return node.closest("footer")!.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
  })).toBe(true);
});
