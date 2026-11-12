// @vitest-environment node
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import photos from "../../lib/media/editorial-photos.json";
import provenance from "../../lib/media/editorial-provenance.json";
// @ts-expect-error Standalone Node ESM asset verifier.
import { checkEditorialAssets } from "../../scripts/check-editorial-assets.mjs";

const ids = ["hikaye-ana", "hikaye-dal", "zeytinyagi-dikey", "zeytin-kase", "zeytinyagi-yatay", "blog-salamura", "blog-kirma", "blog-sofra"];
const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });

/** The pinned derivatives without the git-ignored originals, as CI sees them. */
async function independentCheckout(): Promise<string> {
  await mkdir("output/tmp", { recursive: true });
  const root = await mkdtemp(resolve("output/tmp/editorial-assets-204-1-"));
  roots.push(root);
  for (const path of ["lib/media/editorial-provenance.json", "lib/media/editorial-photos.json", "public/images/editorial"]) {
    await mkdir(resolve(root, path, ".."), { recursive: true });
    await cp(resolve(path), resolve(root, path), { recursive: true });
  }
  return root;
}

it("registers the eight approved photographs with a Turkish description and AVIF + WebP pairs", () => {
  expect(Object.keys(photos.assets).sort()).toEqual([...ids].sort());
  for (const [id, asset] of Object.entries(photos.assets)) {
    expect(asset.alt.length, id).toBeGreaterThan(20);
    expect(asset.alt, id).not.toMatch(/[—–]/u);
    const widths = [...new Set(asset.outputs.map(output => output.width))];
    expect(widths.length, id).toBeGreaterThanOrEqual(2);
    for (const width of widths) expect(asset.outputs.filter(output => output.width === width).map(output => output.format).sort(), `${id} ${width}`).toEqual(["avif", "webp"]);
    for (const output of asset.outputs) expect(output.file).toMatch(new RegExp(`^/images/editorial/${id}-[0-9]+\\.(avif|webp)$`));
  }
});

it("records where each photograph came from, who approved it and how it was cropped", () => {
  expect(provenance.authorization).toBe("user-2026-11-12-k5");
  expect(provenance.sourceDirectory).toBe("AFINA-KAYNAK/higgsfield-2026-11-12");
  for (const id of ids) {
    const asset = provenance.assets[id as keyof typeof provenance.assets];
    expect(asset.source).toBe(`AFINA-KAYNAK/higgsfield-2026-11-12/${id}.png`);
    expect(asset.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(asset.prompt.length).toBeGreaterThan(40);
    expect(asset.crop.width).toBeLessThanOrEqual(asset.sourceWidth);
    expect(asset.crop.height).toBeLessThanOrEqual(asset.sourceHeight);
    for (const output of asset.outputs) expect(output.width).toBeLessThanOrEqual(asset.crop.width);
  }
});

it("ships derivatives only: no raw PNG and no file the register does not know", async () => {
  const files = await readdir(resolve("public/images/editorial"));
  expect(files.filter(file => !/\.(avif|webp)$/.test(file))).toEqual([]);
  expect(new Set(files)).toEqual(new Set(Object.values(photos.assets).flatMap(asset => asset.outputs.map(output => output.file.split("/").at(-1)))));
  const heaviest = Math.max(...Object.values(provenance.assets).flatMap(asset => asset.outputs.map(output => output.bytes)));
  expect(heaviest).toBeLessThan(400_000);
});

it("verifies every pinned derivative without the private originals", async () => {
  await expect(checkEditorialAssets({ root: await independentCheckout() })).resolves.toMatchObject({ sourcesAvailable: false, assets: 8 });
});

it("rejects a changed derivative and a stale file", async () => {
  const changed = await independentCheckout();
  await writeFile(resolve(changed, `public${photos.assets["hikaye-ana"].outputs[0].file}`), "modified");
  await expect(checkEditorialAssets({ root: changed })).rejects.toThrow(/derivative (hash|bytes)/);
  const stale = await independentCheckout();
  await writeFile(resolve(stale, "public/images/editorial/hikaye-ana.png"), await readFile(resolve(`public${photos.assets["hikaye-ana"].outputs[0].file}`)));
  await expect(checkEditorialAssets({ root: stale })).rejects.toThrow(/stale/i);
});

it("refuses to pass local acceptance when the originals are asked for but absent", async () => {
  await expect(checkEditorialAssets({ root: await independentCheckout(), requireSources: true })).rejects.toThrow(/source directory required/i);
});
