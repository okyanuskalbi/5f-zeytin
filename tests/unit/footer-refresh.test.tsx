import { expect, it } from "vitest";
import facility from "@/public/images/tesis-v4-manifest.json";

it("registers the specified medium tone on the same pinned redacted source", () => {
  expect(facility.source).toBe("docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg");
  expect(facility.sourceSha256).toBe("d35378a93dcbad69c0e62d09e2481af8a82bc6298c2526ab4ee55a594728b67d");
  expect(facility.operation).toEqual({ saturation: 0.48, linear: [1.04, 1, 0.95], brightness: 0.96 });
  expect(facility.outputs.map(output => output.file)).toEqual([
    "/images/tesis/tesis-osmaniye-v4-1200.webp", "/images/tesis/tesis-osmaniye-v4-2400.webp",
  ]);
});
