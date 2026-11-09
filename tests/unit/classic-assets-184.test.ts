// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, expect, it } from "vitest";
import productionManifest from "../../lib/media/classic-home.json";
// @ts-expect-error Standalone Node ESM asset verifier.
import { checkClassicAssets } from "../../scripts/check-classic-assets.mjs";

type Output = { file: string; format: string; width: number; height: number; sha256: string; bytes: number };
type Asset = { source: string; sourceSha256: string; sourceWidth: number; sourceHeight: number; alt: string; prompt: string; outputs: Output[] };
type Manifest = { version: number; provider: string; paidApi: boolean; assets: Record<string, Asset> };
const sourceDirectory = "AFINA-KAYNAK/tasarim/klasik-anasayfa-c/fotograflar";
const digest = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
let root: string;
let manifest: Manifest;
let source: Buffer;

async function saveManifest(): Promise<void> {
  await writeFile(resolve(root, "lib/media/classic-home.json"), JSON.stringify(manifest));
  await writeFile(resolve(root, "lib/media/classic-photos.json"), JSON.stringify({
    assets: Object.fromEntries(Object.entries(manifest.assets).map(([id, asset]) => [id, {
      alt: asset.alt,
      outputs: asset.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })),
    }])),
  }));
}

async function addSources(): Promise<void> {
  await mkdir(resolve(root, sourceDirectory), { recursive: true });
  for (const asset of Object.values(manifest.assets)) await writeFile(resolve(root, asset.source), source);
}

beforeEach(async () => {
  const temporaryRoot = resolve("output/tmp");
  await mkdir(temporaryRoot, { recursive: true });
  root = await mkdtemp(resolve(temporaryRoot, "classic-assets-184-"));
  await mkdir(resolve(root, "lib/media"), { recursive: true });
  await mkdir(resolve(root, "public/images/klasik"), { recursive: true });
  source = await sharp({ create: { width: 32, height: 24, channels: 3, background: "#254430" } }).png().toBuffer();
  manifest = { version: 1, provider: "built-in image_gen", paidApi: false, assets: {} };
  const encoded = new Map<string, Buffer>();
  for (const [id, original] of Object.entries(productionManifest.assets)) {
    const widths = [...new Set(original.outputs.map(output => output.width))].map((_, index) => (index + 1) * 4);
    const outputs: Output[] = [];
    for (const width of widths) for (const format of ["avif", "webp"] as const) {
      const key = `${width}.${format}`;
      if (!encoded.has(key)) encoded.set(key, await sharp(source).resize({ width })[format]().toBuffer());
      const bytes = encoded.get(key)!;
      const meta = await sharp(bytes).metadata();
      const file = `/images/klasik/${id}-${width}.${format}`;
      await writeFile(resolve(root, `public${file}`), bytes);
      outputs.push({ file, format, width: meta.width!, height: meta.height!, sha256: digest(bytes), bytes: bytes.length });
    }
    manifest.assets[id] = {
      source: `${sourceDirectory}/${id}.png`, sourceSha256: digest(source), sourceWidth: 32, sourceHeight: 24,
      alt: original.alt, prompt: original.prompt, outputs,
    };
  }
  await saveManifest();
});

afterEach(async () => { if (root) await rm(root, { recursive: true, force: true }); });

it("verifies every public image in an independent checkout without AFINA-KAYNAK", async () => {
  await expect(checkClassicAssets({ root })).resolves.toEqual({ count: 42, sourcesAvailable: false });
});

it("does not infer original-photo availability from an unrelated AFINA-KAYNAK directory", async () => {
  await mkdir(resolve(root, "AFINA-KAYNAK/unrelated"), { recursive: true });
  await expect(checkClassicAssets({ root })).resolves.toEqual({ count: 42, sourcesAvailable: false });
});

it("checks all original hashes and dimensions when the photo directory exists", async () => {
  await addSources();
  await expect(checkClassicAssets({ root })).resolves.toEqual({ count: 42, sourcesAvailable: true });
  manifest.assets.hero.sourceHeight = 25;
  await saveManifest();
  await expect(checkClassicAssets({ root })).rejects.toThrow(/hero source height/);
});

it("rejects a changed original even when all public derivatives remain intact", async () => {
  await addSources();
  await writeFile(resolve(root, manifest.assets.hero.source), Buffer.from("corrupted original"));
  await expect(checkClassicAssets({ root })).rejects.toThrow(/hero source hash/);
});

it("rejects a partial source directory instead of silently falling back to CI mode", async () => {
  await addSources();
  await rm(resolve(root, manifest.assets.hero.source));
  await expect(checkClassicAssets({ root })).rejects.toThrow(/ENOENT/);
});

it("rejects missing derivatives when original photos are unavailable", async () => {
  const output = manifest.assets.hero.outputs[0];
  await rm(resolve(root, `public${output.file}`));
  await expect(checkClassicAssets({ root })).rejects.toThrow(/ENOENT/);
});

it("rejects changed derivative bytes in CI mode", async () => {
  const output = manifest.assets.hero.outputs[0];
  await writeFile(resolve(root, `public${output.file}`), Buffer.from("corrupted image"));
  await expect(checkClassicAssets({ root })).rejects.toThrow(/hero derivative hash/);
});

it("verifies derivative dimensions as well as hashes without originals", async () => {
  manifest.assets.hero.outputs[0].height += 1;
  await saveManifest();
  await expect(checkClassicAssets({ root })).rejects.toThrow(/hero derivative height/);
});

it("rejects stale lightweight runtime entries", async () => {
  const path = resolve(root, "lib/media/classic-photos.json");
  const runtime = JSON.parse(await readFile(path, "utf8"));
  runtime.assets.hero.outputs[0].file = "/images/klasik/wrong.avif";
  await writeFile(path, JSON.stringify(runtime));
  await expect(checkClassicAssets({ root })).rejects.toThrow(/Lightweight image catalog/);
});

it("rejects an incomplete AVIF/WebP pair even when both catalogs agree", async () => {
  manifest.assets.hero.outputs.shift();
  await saveManifest();
  await expect(checkClassicAssets({ root })).rejects.toThrow(/hero .*format pair/);
});

it("rejects an unexpected public image instead of leaving stale derivatives unchecked", async () => {
  const file = resolve(root, "public/images/klasik/stale.webp");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, "stale");
  await expect(checkClassicAssets({ root })).rejects.toThrow(/No untracked or stale/);
});

it("can explicitly require originals for local source acceptance", async () => {
  await expect(checkClassicAssets({ root, requireSources: true })).rejects.toThrow(/Original photography source directory required/);
});
