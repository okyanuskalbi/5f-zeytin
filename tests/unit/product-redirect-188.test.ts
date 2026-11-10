// @vitest-environment node
import { expect, it } from "vitest";
import nextConfig from "@/next.config";

it("permanently redirects only the old root shop query to the products page", async () => {
  const redirects = await nextConfig.redirects?.();
  expect(redirects).toContainEqual({ source: "/", has: [{ type: "query", key: "magaza", value: "ac" }], destination: "/urunler", permanent: true });
  expect(redirects).toHaveLength(1);
});
