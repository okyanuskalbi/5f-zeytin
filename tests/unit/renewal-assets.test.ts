import { expect, it } from "vitest";
// @ts-expect-error Standalone Node ESM asset verifier.
import { checkRenewalAssets } from "../../scripts/check-renewal-assets.mjs";

it("checks customer-PDF provenance, original photo geometry, sizes and all derivative hashes", async () => {
  await expect(checkRenewalAssets()).resolves.toEqual({ checked: 4 });
});
