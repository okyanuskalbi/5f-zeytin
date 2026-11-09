import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** CI checks the pinned public derivatives; local acceptance also checks original photos. */
export async function checkClassicAssets({ root = repoRoot, requireSources = false } = {}) {
  let sourcesAvailable = false;
  try {
    const sourceDirectory = await stat(resolve(root, "AFINA-KAYNAK/tasarim/klasik-anasayfa-c/fotograflar"));
    assert.ok(sourceDirectory.isDirectory(), "Original photography source path must be a directory");
    sourcesAvailable = true;
  } catch (error) {
    // Only an absent source directory enables independent-checkout mode.
    // Permission, malformed-path and present-source errors must remain failures.
    if (error.code !== "ENOENT") throw error;
  }
  assert.ok(!requireSources || sourcesAvailable, "Original photography source directory required");
  const manifest = JSON.parse(await readFile(resolve(root, "lib/media/classic-home.json"), "utf8"));
  const photos = JSON.parse(await readFile(resolve(root, "lib/media/classic-photos.json"), "utf8"));
  assert.deepEqual(photos, {
    assets: Object.fromEntries(Object.entries(manifest.assets).map(([id, asset]) => [id, {
      alt: asset.alt,
      outputs: asset.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })),
    }])),
  }, "Lightweight image catalog matches full provenance without prompts or hashes");
  const hash = bytes => createHash("sha256").update(bytes).digest("hex");
  assert.equal(manifest.provider, "built-in image_gen");
  assert.equal(manifest.paidApi, false);
  const expected = new Set();
  let count = 0;
  for (const [id, asset] of Object.entries(manifest.assets)) {
    assert.match(asset.sourceSha256, /^[a-f0-9]{64}$/, `${id} pinned source hash`);
    assert.ok(Number.isInteger(asset.sourceWidth) && asset.sourceWidth > 0, `${id} pinned source width`);
    assert.ok(Number.isInteger(asset.sourceHeight) && asset.sourceHeight > 0, `${id} pinned source height`);
    if (sourcesAvailable) {
      const source = await readFile(resolve(root, asset.source));
      assert.equal(hash(source), asset.sourceSha256, `${id} source hash`);
      const sourceMeta = await sharp(source).metadata();
      assert.equal(sourceMeta.width, asset.sourceWidth, `${id} source width`);
      assert.equal(sourceMeta.height, asset.sourceHeight, `${id} source height`);
    }
    assert.ok(asset.alt && asset.prompt, `${id} alt and prompt`);
    const widths = new Set(asset.outputs.map(output => output.width));
    for (const width of widths) {
      assert.deepEqual(asset.outputs.filter(output => output.width === width).map(output => output.format).sort(), ["avif", "webp"], `${id} ${width} format pair`);
    }
    for (const output of asset.outputs) {
      assert.ok(output.file.startsWith(`/images/klasik/${id}-`), `${id} public path`);
      const bytes = await readFile(resolve(root, `public${output.file}`));
      assert.equal(hash(bytes), output.sha256, `${id} derivative hash`);
      assert.equal(bytes.length, output.bytes, `${id} derivative bytes`);
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.width, output.width, `${id} derivative width`);
      assert.equal(meta.height, output.height, `${id} derivative height`);
      assert.equal(meta.format, output.format === "avif" ? "heif" : output.format, `${id} derivative format`);
      if (output.format === "avif") assert.equal(meta.compression, "av1", `${id} AV1 compression`);
      assert.ok(output.width <= asset.sourceWidth && output.height <= asset.sourceHeight, `${id} no enlargement`);
      expected.add(output.file.split("/").at(-1));
      count++;
    }
  }
  assert.equal(Object.keys(manifest.assets).length, 9);
  assert.deepEqual(new Set(await readdir(resolve(root, "public/images/klasik"))), expected, "No untracked or stale image derivatives");
  assert.equal(count, 42, "Complete classic image derivative count");
  return { count, sourcesAvailable };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await checkClassicAssets({ requireSources: process.argv.includes("--require-sources") });
    process.stdout.write(`PASS: 9 classic photography assets and ${result.count} derivatives verified${result.sourcesAvailable ? "; original photos verified" : " (CI: pinned hashes and public derivatives)"}\n`);
  } catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
