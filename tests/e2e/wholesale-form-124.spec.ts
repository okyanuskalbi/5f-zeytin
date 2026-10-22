import { expect, test, type Locator } from "@playwright/test";

const sizes = [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
];

async function fullyInside(control: Locator, width: number, height: number): Promise<void> {
  await expect(control).toBeInViewport({ ratio: 1 });
  const box = (await control.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
}

// Written for Claude's browser acceptance. Do not run in the Coder task.
for (const size of sizes) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`${size.width}×${size.height}, ${reducedMotion}: whole form fits without scrolling and restores focus`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.emulateMedia({ reducedMotion });
      await page.goto("/");
      const trigger = page.getByRole("button", { name: "Toptan teklif isteyin", exact: true });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Toptan teklif isteyin" });
      const first = dialog.getByRole("textbox", { name: "İsim / firma", exact: true });
      const submit = dialog.getByRole("button", { name: "Talebi gönder", exact: true });
      await expect(dialog).toHaveAttribute("data-slot", size.width < 768 ? "sheet-content" : "dialog-content");
      await expect(first).toBeFocused();
      // Wait for the opening transform to settle, without scrolling any field.
      await expect.poll(() => dialog.locator("header").evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(size.height / 2);
      await expect.poll(() => dialog.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
      await expect(dialog.getByRole("heading")).toHaveCount(1);
      await expect(dialog.getByText("Toptan talep formu", { exact: true })).toHaveCount(0);
      await fullyInside(first, size.width, size.height);
      expect((await first.boundingBox())!.height).toBeGreaterThanOrEqual(48);
      await fullyInside(submit, size.width, size.height);
      await fullyInside(dialog.getByRole("heading"), size.width, size.height);
      await expect(submit).toBeDisabled();
      for (const control of await dialog.locator("input,textarea,button,a,label:has(input[type=checkbox])").all()) {
        await fullyInside(control, size.width, size.height);
        const box = (await control.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
      const fieldset = dialog.locator("fieldset");
      expect(await fieldset.evaluate(node => node.scrollTop)).toBe(0);
      expect(await fieldset.evaluate(node => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
      expect(await dialog.evaluate(node => node.scrollTop)).toBe(0);
      expect(await dialog.evaluate(node => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
      const email = (await dialog.getByRole("textbox", { name: "E-posta", exact: true }).boundingBox())!;
      const phone = (await dialog.getByRole("textbox", { name: "Telefon", exact: true }).boundingBox())!;
      if (size.width < 768) {
        expect(phone.y).toBeGreaterThan(email.y);
        await expect(dialog.locator("[data-wholesale-actions]")).toHaveCSS("position", "sticky");
        await expect(dialog.locator("[data-wholesale-actions]")).toHaveCSS("bottom", "0px");
        await expect(page.locator("[data-mobile-buy-bar]")).toHaveAttribute("aria-hidden", "true");
      } else {
        expect(Math.abs(email.y - phone.y)).toBeLessThanOrEqual(1);
        const box = (await dialog.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(640);
        expect(box.width).toBeLessThanOrEqual(720);
        expect(box.height).toBeLessThanOrEqual(size.height - 48);
      }
      await first.fill("Örnek Firma");
      const message = dialog.getByRole("textbox", { name: "Talep mesajı", exact: true });
      await message.fill(Array.from({ length: 12 }, (_, i) => `Talep satırı ${i}`).join("\n"));
      expect(await message.evaluate(node => {
        const style = getComputedStyle(node);
        return node.getBoundingClientRect().height <= Number.parseFloat(style.lineHeight) * 6
          + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
          + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth) + 1;
      })).toBe(true);
      await fullyInside(submit, size.width, size.height);
      if (reducedMotion === "reduce") {
        expect(await dialog.locator("header").evaluate(node => getComputedStyle(node.parentElement!).transform)).toBe("none");
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await trigger.click();
      await page.getByRole("dialog").getByRole("button", { name: "Kapat", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }
}
