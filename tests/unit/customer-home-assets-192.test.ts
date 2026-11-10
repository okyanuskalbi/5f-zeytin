// @vitest-environment node
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
// @ts-expect-error Standalone Node ESM verifier.
import { checkCustomerHomeAssets } from "../../scripts/check-customer-home-assets.mjs";

const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });
async function independentCheckout(): Promise<string> {
  await mkdir("output/tmp", { recursive: true });
  const root = await mkdtemp(resolve("output/tmp/customer-assets-192-"));
  roots.push(root);
  for (const path of ["lib/media/customer-home.json", "public/images/customer-home", "public/videos/customer-home"]) {
    await mkdir(resolve(root, path, ".."), { recursive: true });
    await cp(resolve(path), resolve(root, path), { recursive: true });
  }
  return root;
}
it("verifies supplied source provenance and all reviewed silent fast-start derivatives", async () => {
  await expect(checkCustomerHomeAssets({ requireSources: true })).resolves.toEqual({ sourcesAvailable: true, images: 24, videos: 3 });
});
it("checks pinned public derivatives in CI without private original files", async () => {
  await expect(checkCustomerHomeAssets({ root: await independentCheckout() })).resolves.toEqual({ sourcesAvailable: false, images: 24, videos: 3 });
});
it("does not silently accept absent sources when local source verification is requested", async () => {
  await expect(checkCustomerHomeAssets({ root: await independentCheckout(), requireSources: true })).rejects.toThrow(/Original customer source directory required/);
});
it("rejects changed video bytes even without original video", async () => {
  const root = await independentCheckout();
  await writeFile(resolve(root, "public/videos/customer-home/hero-720.mp4"), "modified");
  await expect(checkCustomerHomeAssets({ root })).rejects.toThrow(/video derivative (hash|bytes)/);
});
it("checks image geometry independently of pinned hashes", async () => {
  const root = await independentCheckout();
  const file = resolve(root, "lib/media/customer-home.json");
  const manifest = JSON.parse(await readFile(file, "utf8"));
  manifest.assets.fabrika.outputs[0].height += 1;
  await writeFile(file, JSON.stringify(manifest));
  await expect(checkCustomerHomeAssets({ root })).rejects.toThrow(/derivative height/);
});
it("rejects stale unchecked image files", async () => {
  const root = await independentCheckout();
  await writeFile(resolve(root, "public/images/customer-home/stale.webp"), "stale");
  await expect(checkCustomerHomeAssets({ root })).rejects.toThrow(/stale/);
});
it("rejects a partial local source directory instead of falling back to CI mode", async () => {
  const root = await independentCheckout();
  await mkdir(resolve(root, "AFINA-KAYNAK/musteri-2026-11-10"), { recursive: true });
  await expect(checkCustomerHomeAssets({ root })).rejects.toThrow(/ENOENT/);
});
it("rejects altered image bytes without relying on source availability", async () => {
  const root = await independentCheckout();
  await writeFile(resolve(root, "public/images/customer-home/fabrika-480.avif"), "modified");
  await expect(checkCustomerHomeAssets({ root })).rejects.toThrow(/fabrika derivative hash/);
});
it("requires all three independently hashed responsive video sizes", async () => {
  const root = await independentCheckout();
  const file = resolve(root, "lib/media/customer-home.json");
  const manifest = JSON.parse(await readFile(file, "utf8"));
  manifest.hero.video.outputs.pop();
  await writeFile(file, JSON.stringify(manifest));
  await expect(checkCustomerHomeAssets({ root })).rejects.toThrow();
});
