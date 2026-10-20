// @vitest-environment node
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const script = join(root, "scripts/extract-frames.mjs");
let temporary: string;
beforeEach(async () => {
  await mkdir(join(root, ".cache"), { recursive: true });
  temporary = await mkdtemp(join(root, ".cache/frame-extraction-"));
});
afterEach(async () => { await rm(temporary, { recursive: true, force: true }); });

it("extracts numbered responsive WebP sets and an identical first-frame poster", async () => {
  const video = join(temporary, "source.mp4");
  const source = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=0x243a29:s=320x180:r=24:d=0.25", "-c:v", "libx264", video]);
  expect(source.status, source.stderr.toString()).toBe(0);
  const output = join(temporary, "frames");
  const extraction = spawnSync(process.execPath, [script, video, output, "--fps", "24", "--widths", "1920,960", "--quality", "72"]);
  expect(extraction.status, extraction.stderr.toString()).toBe(0);
  const manifest = JSON.parse(await readFile(join(output, "manifest.json"), "utf8"));
  expect(manifest).toEqual({ count: 6, fps: 24, widths: [1920, 960], aspect: 16 / 9, poster: "poster.webp" });
  for (const width of manifest.widths) {
    const files = await readdir(join(output, String(width)));
    expect(files).toEqual(Array.from({ length: 6 }, (_, i) => `frame-${String(i + 1).padStart(4, "0")}.webp`));
    expect(await sharp(join(output, String(width), files[0])).metadata()).toMatchObject({ format: "webp", width, height: width * 9 / 16 });
  }
  expect(await readFile(join(output, "poster.webp"))).toEqual(await readFile(join(output, "1920/frame-0001.webp")));
}, 20_000);

it("rejects invalid arguments without creating output", async () => {
  for (const args of [["--fps", "0"], ["--quality", "101"], ["--widths", "-960"], ["--unknown", "1"]]) {
    const result = spawnSync(process.execPath, [script, "missing.mp4", join(temporary, "frames"), ...args]);
    expect(result.status).not.toBe(0);
  }
  expect(await readdir(temporary)).toEqual([]);
});

it("preserves an existing output directory on failure", async () => {
  const output = join(temporary, "frames");
  await mkdir(output);
  await writeFile(join(output, "keep.txt"), "existing sequence");
  const result = spawnSync(process.execPath, [script, "missing.mp4", output]);
  expect(result.status).not.toBe(0);
  expect(await readFile(join(output, "keep.txt"), "utf8")).toBe("existing sequence");
  expect(await readdir(temporary)).toEqual(["frames"]);
});
