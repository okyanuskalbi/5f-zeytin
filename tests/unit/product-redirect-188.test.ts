// @vitest-environment node
import { expect, it } from "vitest";
import nextConfig from "@/next.config";
import { legacyHomeSection } from "@/components/site/LegacyHomeNavigation";

// Task208: `/urunler` now redirects to `/#urunler`; a server rule for `/?magaza=ac` would loop with it.
it("opens the products section for the old root shop query without a redirect loop", async () => {
  const redirects = await nextConfig.redirects?.();
  expect(redirects?.filter(item => item.has?.some(condition => condition.type === "query" && condition.key === "magaza"))).toHaveLength(0);
  expect(redirects).toContainEqual({ source: "/urunler", destination: "/#urunler", permanent: true });
  expect(legacyHomeSection("", "?magaza=ac")).toBe("urunler");
});
