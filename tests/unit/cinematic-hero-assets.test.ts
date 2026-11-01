// @vitest-environment node
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
// @ts-expect-error Standalone Node ESM asset verifier.
import { checkCinematicHero } from "../../scripts/check-cinematic-hero.mjs";

const prefix = "/frames/afina-agac-dal/";
const cache = resolve(import.meta.dirname, "../../.cache/task-156-assets");
type Output = { file: string; sha256: string; bytes: number; width: number; height: number; format: "webp" | "avif" };
type Manifest = {
  version: number; authorization: string; provider: string;
  source: { sha256: string; userAccepted: boolean; width: number; height: number };
  derivation: { fps: number; widths: number[]; quality: number; toneMapping: boolean };
  sequence: { manifest: string; count: number; fps: number; widths: number[]; aspect: number; poster: string };
  outputs: Output[];
};
let template: string;
let root: string;
let manifest: Manifest;

const hash = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
async function save(): Promise<void> {
  await writeFile(join(root, "lib/media/cinematic-hero.json"), JSON.stringify(manifest));
}
async function replaceOutput(file: string, bytes: Buffer, dimensions?: { width: number; height: number }): Promise<void> {
  const output = manifest.outputs.find(output => output.file === file)!;
  await writeFile(join(root, `public${file}`), bytes);
  Object.assign(output, { sha256: hash(bytes), bytes: bytes.length }, dimensions);
  await save();
}

beforeAll(async () => {
  await mkdir(cache, { recursive: true });
  template = await mkdtemp(join(cache, "template-"));
  await mkdir(join(template, "lib/media"), { recursive: true });
  const outputs: Output[] = [];
  async function asset(name: string, width: number, height: number, format: "webp" | "avif", background = "#274632"): Promise<Buffer> {
    const bytes = await sharp({ create: { width, height, channels: 3, background } })[format]({ quality: 52 }).toBuffer();
    const file = prefix + name;
    await mkdir(resolve(template, `public${file}`, ".."), { recursive: true });
    await writeFile(join(template, `public${file}`), bytes);
    outputs.push({ file, width, height, format, bytes: bytes.length, sha256: hash(bytes) });
    return bytes;
  }
  for (const width of [1280, 960]) {
    for (let index = 1; index <= 2; index++) {
      await asset(`${width}/frame-${String(index).padStart(4, "0")}.webp`, width, width * 9 / 16, "webp", index === 1 ? "#274632" : "#314E3B");
    }
  }
  await asset("poster.webp", 1280, 720, "webp");
  await asset("poster-desktop.webp", 1280, 720, "webp");
  await asset("poster-desktop.avif", 1280, 720, "avif");
  await asset("poster-mobile.webp", 480, 720, "webp");
  await asset("poster-mobile.avif", 480, 720, "avif");
  const sequence = { manifest: prefix + "manifest.json", count: 2, fps: 12, widths: [1280, 960], aspect: 16 / 9, poster: "poster.webp" };
  const provenance: Manifest = {
    version: 1, authorization: "user-2026-11-01-selected-cinematic-kit", provider: "Google Flow",
    source: { sha256: "be77f66a14e418791093fe53937598204313a99f6368204f1fbf6ebaacf14171", userAccepted: true, width: 1280, height: 720 },
    derivation: { fps: 12, widths: [1280, 960], quality: 52, toneMapping: false },
    sequence, outputs,
  };
  await writeFile(join(template, "public", sequence.manifest), JSON.stringify({ count: sequence.count, fps: sequence.fps, widths: sequence.widths, aspect: sequence.aspect, poster: sequence.poster }));
  await writeFile(join(template, "lib/media/cinematic-hero.json"), JSON.stringify(provenance));
});

beforeEach(async () => {
  root = await mkdtemp(join(cache, "case-"));
  await cp(template, root, { recursive: true });
  manifest = JSON.parse(await readFile(join(root, "lib/media/cinematic-hero.json"), "utf8"));
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });
afterAll(async () => { await rm(template, { recursive: true, force: true }); });

describe("approved cinematic hero build gate", () => {
  it("verifies the approved clip derivatives without requiring the ignored source movie", async () => {
    await expect(checkCinematicHero({ root })).resolves.toEqual({ checked: 9, bytes: manifest.outputs.reduce((sum, output) => sum + output.bytes, 0), frames: 2 });
  });

  it.each(["approval", "source", "provider"])("rejects substituted or unapproved media: %s", async (change) => {
    if (change === "approval") manifest.source.userAccepted = false;
    if (change === "source") manifest.source.sha256 = "a".repeat(64);
    if (change === "provider") manifest.provider = "Other generator";
    await save();
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("rejects changed bytes even when the dimensions still decode", async () => {
    const file = manifest.outputs[0].file;
    const bytes = await readFile(join(root, `public${file}`));
    await writeFile(join(root, `public${file}`), Buffer.concat([bytes, Buffer.from("tampered")]));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("rejects a missing expected frame instead of shipping a broken scroll scene", async () => {
    await rm(join(root, `public${prefix}960/frame-0002.webp`));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("rejects duplicate paths and attempts to escape the approved sequence directory", async () => {
    manifest.outputs[0].file = manifest.outputs[1].file;
    await save();
    await expect(checkCinematicHero({ root })).rejects.toThrow();
    manifest.outputs[0].file = prefix + "../outside.webp";
    await save();
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("requires all responsive poster fallbacks", async () => {
    manifest.outputs = manifest.outputs.filter(output => !output.file.endsWith("poster-mobile.webp"));
    await save();
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("rejects stretched frame geometry even with matching file hashes", async () => {
    const bytes = await sharp({ create: { width: 960, height: 600, channels: 3, background: "#274632" } }).webp().toBuffer();
    await replaceOutput(prefix + "960/frame-0001.webp", bytes, { width: 960, height: 600 });
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("requires the static sequence poster to be the exact first frame", async () => {
    await replaceOutput(prefix + "poster.webp", await readFile(join(root, `public${prefix}1280/frame-0002.webp`)));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("rejects a public manifest that diverges from the reviewed sequence", async () => {
    await writeFile(join(root, `public${manifest.sequence.manifest}`), JSON.stringify({ ...manifest.sequence, count: 3 }));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it.each(["poster-mobile.webp", "poster-mobile.avif", "poster-desktop.avif"])("keeps the primary and mobile fallback request budget: %s", async (name) => {
    const file = prefix + name;
    const bytes = await readFile(join(root, `public${file}`));
    await replaceOutput(file, Buffer.concat([bytes, Buffer.alloc(90 * 1024)]));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("allows a detailed desktop WebP fallback within its separate 180 KB cap", async () => {
    const file = prefix + "poster-desktop.webp";
    const original = await readFile(join(root, `public${file}`));
    await replaceOutput(file, Buffer.concat([original, Buffer.alloc(160_000 - original.length)]));
    await expect(checkCinematicHero({ root })).resolves.toMatchObject({ checked: 9, frames: 2 });
    await replaceOutput(file, Buffer.concat([original, Buffer.alloc(180_001 - original.length)]));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });

  it("caps the complete sequence at 16 MiB even when every hash matches", async () => {
    const file = prefix + "960/frame-0002.webp";
    const bytes = await readFile(join(root, `public${file}`));
    await replaceOutput(file, Buffer.concat([bytes, Buffer.alloc(16 * 1024 * 1024)]));
    await expect(checkCinematicHero({ root })).rejects.toThrow();
  });
});
