import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { approvals, formats, specs } from "./v3-asset-specs.mjs";
import { alphaBounds, approvedSource, repoRoot, sha256, sourceRoot } from "./prepare-v3-assets.mjs";
import { checkFacilityV4 } from "./prepare-facility-v4.mjs";

/** Offline CI uses pinned approval rows; local acceptance also verifies originals. */
export async function checkV3Assets({ root = repoRoot, requireSources = false } = {}) {
  let sourcesAvailable = false;
  try { await access(sourceRoot); sourcesAvailable = true; } catch { /* Independent CI checkout. */ }
  assert(!requireSources || sourcesAvailable, "Onaylı kaynak dizini gerekli.");
  const manifest = JSON.parse(await readFile(resolve(root, "public/images/v3/manifest.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.deepEqual(Object.keys(manifest.assets).sort(), specs.map(spec => spec.id).sort());
  const registered = ["manifest.json"];
  let count = 0;
  for (const spec of specs) {
    const entry = manifest.assets[spec.id];
    assert.equal(entry.sourceSha256, approvals[spec.group].hashes[spec.source], `${spec.id}: ONAY SHA`);
    assert.equal(entry.approval, approvals[spec.group].file);
    assert.equal(entry.alt, spec.alt);
    assert.equal(entry.alphaThreshold, spec.threshold ?? null);
    if (sourcesAvailable) {
      const source = await approvedSource(spec);
      const meta = await sharp(source).metadata();
      assert.equal(entry.sourceWidth, meta.width);
      assert.equal(entry.sourceHeight, meta.height);
      assert.deepEqual(entry.crop, spec.threshold ? await alphaBounds(source, spec.threshold) : null);
    }
    assert.equal(entry.outputs.length, (spec.widths ?? spec.heights).length * formats.length);
    const expectedFiles = (spec.widths ?? spec.heights).flatMap(size => formats.map(format => `/images/v3/${spec.id}-${spec.heights ? "h" : "w"}${size}.${format}`));
    assert.deepEqual(entry.outputs.map(output => output.file).sort(), expectedFiles.sort());
    for (const output of entry.outputs) {
      const bytes = await readFile(resolve(root, `public${output.file}`));
      assert.equal(sha256(bytes), output.sha256, `${output.file}: çıktı SHA`);
      assert.equal(bytes.length, output.bytes);
      if (spec.budget) assert(bytes.length <= spec.budget, `${output.file}: ${bytes.length} > ${spec.budget} bayt`);
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.width, output.width);
      assert.equal(meta.height, output.height);
      assert.equal(meta.format, output.format === "avif" ? "heif" : output.format);
      if (spec.threshold) {
        assert(meta.hasAlpha, `${output.file}: alpha kayboldu`);
        const stats = await sharp(bytes).stats();
        assert(stats.channels.at(-1).min < 255, `${output.file}: şeffaflık kayboldu`);
      }
      const size = Number(output.file.match(/-[wh](\d+)\./)[1]);
      if (spec.heights) assert.equal(meta.height, size);
      else assert.equal(meta.width, size);
      const aspect = spec.square ? 1 : spec.aspect ?? (entry.crop ? entry.crop.width / entry.crop.height : entry.sourceWidth / entry.sourceHeight);
      // A one-pixel rounding on a very thin shelf is a large ratio delta.
      if (spec.heights) assert(Math.abs(meta.width - Math.round(meta.height * aspect)) <= 1, `${output.file}: oran değişti`);
      else assert(Math.abs(meta.height - Math.round(meta.width / aspect)) <= 1, `${output.file}: oran değişti`);
      registered.push(output.file.split("/").at(-1));
      count++;
    }
  }
  assert.deepEqual((await readdir(resolve(root, "public/images/v3"))).sort(), registered.sort(), "Kayıtsız v3 dosyası");
  count += await checkFacilityV4({ root });
  return { count, sourcesAvailable };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await checkV3Assets({ requireSources: process.argv.includes("--require-sources") });
    process.stdout.write(`PASS: ${result.count} v3 çıktı; SHA/onay, ölçü, alpha, oran ve bayt bütçeleri${result.sourcesAvailable ? "; özgün ONAY.md dosyalarıyla" : " (CI: sabit onay SHA kayıtlarıyla)"} doğrulandı.\n`);
  } catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
