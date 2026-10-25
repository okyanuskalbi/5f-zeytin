import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
// @ts-expect-error Standalone Node ESM asset preparation script.
import { verifyApprovedBytes } from "../../scripts/prepare-hero-layers.mjs";

it("rejects changed source bytes even if the approval row still matches", () => {
  const hash = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
  const approval = `| test.png | 1x1 | ${hash} |`;
  expect(() => verifyApprovedBytes(Buffer.from("abc"), "test.png", hash, approval)).not.toThrow();
  expect(() => verifyApprovedBytes(Buffer.from("changed"), "test.png", hash, approval)).toThrow(/SHA-256/);
  expect(() => verifyApprovedBytes(Buffer.from("abc"), "test.png", hash, "unapproved")).toThrow(/ONAY.md/);
});

it("keeps visible storefront literals free of long dashes while ignoring comments", async () => {
  const files = ["app/layout.tsx", "app/kvkk/page.tsx", "app/iade/page.tsx", "app/mesafeli-satis/page.tsx",
    "components/site/LegalDocument.tsx", "components/landing/SofraHero.tsx", "components/landing/HeroBand.tsx", "components/cart/CartPresentation.tsx"];
  for (const file of files) {
    const source = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(source, file).not.toContain("—");
  }
});
