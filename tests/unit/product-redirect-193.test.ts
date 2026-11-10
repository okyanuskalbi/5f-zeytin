// @vitest-environment node
import { expect, it } from "vitest";
import config from "@/next.config";
import { getProducts } from "@/lib/catalog/static-products";

const familySlugs: Record<string, string> = {
  "dogal-kirma": "dogal-kirma-yesil-zeytin",
  "salamura-siyah": "salamura-siyah-zeytin",
  "naturel-sizma": "naturel-sizma-zeytinyagi",
  "salamura-yesil": "salamura-yesil-zeytin",
};

it("redirects every old variant query to its real family page and selected size", async () => {
  const redirects = await config.redirects?.();
  for (const product of await getProducts()) {
    expect(redirects).toContainEqual({ source: "/", has: [{ type: "query", key: "urun", value: product.id }],
      destination: `/urun/${familySlugs[product.familyId]}?boy=${encodeURIComponent(product.weight)}`, permanent: true });
  }
});

it("sends unknown legacy products to a real missing-product route without inventing a default", async () => {
  const redirects = await config.redirects?.();
  expect(redirects?.at(-1)).toEqual({ source: "/", has: [{ type: "query", key: "urun" }], destination: "/urun/bulunamayan", permanent: true });
});
