import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = "AFINA-KAYNAK/higgsfield-2026-11-12";
const publicDirectory = "/images/editorial";
const expectedIds = ["blog-kirma", "blog-salamura", "blog-sofra", "hikaye-ana", "hikaye-dal", "zeytin-kase", "zeytinyagi-dikey", "zeytinyagi-yatay"];
const maxBytes = 400_000;
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

/** CI checks the pinned public renditions; local acceptance also checks the approved originals. */
export async function checkEditorialAssets({ root = repoRoot, requireSources = false } = {}) {
  let sourcesAvailable = false;
  try {
    assert.ok((await stat(resolve(root, sourceDirectory))).isDirectory(), "Approved photograph source path must be a directory");
    sourcesAvailable = true;
  } catch (error) {
    // Only an absent directory means "independent checkout"; any other failure stays a failure.
    if (error.code !== "ENOENT") throw error;
  }
  assert.ok(!requireSources || sourcesAvailable, "Approved photograph source directory required");
  const provenance = JSON.parse(await readFile(resolve(root, "lib/media/editorial-provenance.json"), "utf8"));
  const photos = JSON.parse(await readFile(resolve(root, "lib/media/editorial-photos.json"), "utf8"));
  assert.equal(provenance.version, 1);
  assert.equal(provenance.authorization, "user-2026-11-12-k5");
  assert.equal(provenance.sourceDirectory, sourceDirectory);
  assert.deepEqual(Object.keys(provenance.assets).sort(), expectedIds, "Exactly the eight approved photographs");
  assert.deepEqual(photos, {
    assets: Object.fromEntries(Object.entries(provenance.assets).map(([id, asset]) => [id, {
      alt: asset.alt,
      focus: asset.focus,
      outputs: asset.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })),
    }])),
  }, "Lightweight catalog matches the provenance register");
  const expected = new Set();
  let renditions = 0;
  for (const [id, asset] of Object.entries(provenance.assets)) {
    assert.equal(asset.source, `${sourceDirectory}/${id}.png`);
    assert.match(asset.sourceSha256, /^[a-f0-9]{64}$/, `${id} pinned source hash`);
    assert.ok(asset.alt && asset.prompt, `${id} description and prompt`);
    assert.ok(!/[—–]/u.test(asset.alt), `${id} description without long dashes`);
    const { crop, focus } = asset;
    assert.ok(crop.left >= 0 && crop.top >= 0 && crop.left + crop.width <= asset.sourceWidth && crop.top + crop.height <= asset.sourceHeight, `${id} crop inside the source`);
    assert.ok(focus.length === 2 && focus.every(value => value >= 0 && value <= 100), `${id} focus point in percent`);
    if (sourcesAvailable) {
      const source = await readFile(resolve(root, asset.source));
      assert.equal(hash(source), asset.sourceSha256, `${id} source hash`);
      const meta = await sharp(source).metadata();
      assert.equal(meta.width, asset.sourceWidth, `${id} source width`);
      assert.equal(meta.height, asset.sourceHeight, `${id} source height`);
    }
    for (const width of new Set(asset.outputs.map(output => output.width))) {
      assert.deepEqual(asset.outputs.filter(output => output.width === width).map(output => output.format).sort(), ["avif", "webp"], `${id} ${width} format pair`);
    }
    for (const output of asset.outputs) {
      assert.match(output.file, new RegExp(`^${publicDirectory}/${id}-[0-9]+\\.(avif|webp)$`), `${id} public path`);
      const bytes = await readFile(resolve(root, `public${output.file}`));
      assert.equal(bytes.length, output.bytes, `${id} derivative bytes`);
      assert.equal(hash(bytes), output.sha256, `${id} derivative hash`);
      assert.ok(bytes.length <= maxBytes, `${id} ${output.width} exceeds ${maxBytes} bytes`);
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.width, output.width, `${id} derivative width`);
      assert.equal(meta.height, output.height, `${id} derivative height`);
      assert.equal(meta.format, output.format === "avif" ? "heif" : output.format, `${id} derivative format`);
      if (output.format === "avif") assert.equal(meta.compression, "av1", `${id} AV1 compression`);
      assert.ok(output.width <= crop.width && output.height <= crop.height, `${id} no enlargement`);
      assert.ok(Math.abs(output.width / output.height - crop.width / crop.height) < 0.01, `${id} keeps the crop's proportions`);
      expected.add(output.file.split("/").at(-1));
      renditions++;
    }
  }
  assert.deepEqual(new Set(await readdir(resolve(root, `public${publicDirectory}`))), expected, "No raw, untracked or stale photograph files");
  return { sourcesAvailable, assets: expectedIds.length, renditions };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await checkEditorialAssets({ requireSources: process.argv.includes("--require-sources") });
    process.stdout.write(`PASS: ${result.assets} approved photographs and ${result.renditions} renditions verified${result.sourcesAvailable ? "; originals verified" : " (CI: pinned hashes and public renditions)"}\n`);
  } catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
