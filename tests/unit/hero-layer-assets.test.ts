import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";

it("keeps visible storefront literals free of long dashes while ignoring comments", async () => {
  const files = ["app/layout.tsx", "app/kvkk/page.tsx", "app/iade/page.tsx", "app/mesafeli-satis/page.tsx",
    "components/storefront/content/LegalDocument.tsx", "components/storefront/StoreHome.tsx", "components/storefront/ProductTile.tsx", "components/cart/CartPresentation.tsx"];
  for (const file of files) {
    const source = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(source, file).not.toContain("—");
  }
});
