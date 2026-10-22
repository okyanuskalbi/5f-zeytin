import { expect, test, type Locator } from "@playwright/test";

const sizes = [
  { width: 375, height: 667 },
  { width: 360, height: 640 },
  // Reproduce SE's reported usable height after browser chrome is deducted.
  { width: 375, height: 568 },
];

async function fullyInside(control: Locator, width: number, height: number) {
  await expect(control).toBeInViewport({ ratio: 1 });
  const box = (await control.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
  return box;
}

// Written for Claude's browser acceptance; do not run in the Coder task.
for (const size of sizes) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test(`${size.width}×${size.height}, ${reducedMotion}: consent and send fit without inner scrolling`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.emulateMedia({ reducedMotion });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole("button", { name: "Toptan teklif isteyin", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Toptan teklif isteyin", exact: true });
      const first = dialog.getByRole("textbox", { name: "İsim / firma", exact: true });
      const checkbox = dialog.getByRole("checkbox", { name: "KVKK aydınlatma metnini okudum.", exact: true });
      const legal = dialog.getByRole("link", { name: "KVKK aydınlatma metni", exact: true });
      const submit = dialog.getByRole("button", { name: "Talebi gönder", exact: true });
      await expect(dialog).toHaveAttribute("data-slot", "sheet-content");
      await expect(first).toBeFocused();
      await expect.poll(() => dialog.locator("header").evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(size.height / 2);
      await expect.poll(() => dialog.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
      // Bounding-box and viewport assertions do not scroll or click the controls.
      const firstBox = await fullyInside(first, size.width, size.height);
      const consentBox = await fullyInside(dialog.locator("label:has(input[type=checkbox])"), size.width, size.height);
      const checkboxBox = await fullyInside(checkbox, size.width, size.height);
      const legalBox = await fullyInside(legal, size.width, size.height);
      const submitBox = await fullyInside(submit, size.width, size.height);
      await fullyInside(dialog.getByRole("heading", { name: "Toptan teklif isteyin", exact: true }), size.width, size.height);
      await fullyInside(dialog.getByRole("button", { name: "Kapat", exact: true }), size.width, size.height);
      expect(firstBox.y + firstBox.height).toBeLessThanOrEqual(consentBox.y);
      expect(consentBox.y + consentBox.height).toBeLessThanOrEqual(legalBox.y);
      expect(checkboxBox.y + checkboxBox.height).toBeLessThanOrEqual(legalBox.y);
      const actions = dialog.locator("[data-wholesale-actions]");
      const actionsBox = (await actions.boundingBox())!;
      expect(legalBox.y + legalBox.height).toBeLessThanOrEqual(actionsBox.y);
      expect(legalBox.y + legalBox.height).toBeLessThanOrEqual(submitBox.y);
      for (const box of [firstBox, checkboxBox, legalBox, submitBox]) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
      await expect(actions).toHaveCSS("position", "sticky");
      await expect(actions).toHaveCSS("bottom", "0px");
      await expect(submit).toBeDisabled();
      await expect(dialog.locator("header > p")).toBeHidden();
      const email = (await dialog.getByRole("textbox", { name: "E-posta", exact: true }).boundingBox())!;
      const phone = (await dialog.getByRole("textbox", { name: "Telefon", exact: true }).boundingBox())!;
      expect(phone.y).toBeGreaterThanOrEqual(email.y + email.height + 12);
      for (const scroller of [dialog, dialog.locator("fieldset")]) {
        expect(await scroller.evaluate(node => node.scrollTop)).toBe(0);
        expect(await scroller.evaluate(node => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
      }
      const message = dialog.getByRole("textbox", { name: "Talep mesajı", exact: true });
      expect((await message.boundingBox())!.height).toBeCloseTo(66, 0);
      await message.fill("Talep satırı\n".repeat(12));
      expect((await message.boundingBox())!.height).toBeCloseTo(114, 0);
      await fullyInside(submit, size.width, size.height);
      await message.fill("Kısa talep");
      expect((await message.boundingBox())!.height).toBeCloseTo(66, 0);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    });
  }
}
