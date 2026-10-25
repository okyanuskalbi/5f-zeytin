import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import approvals from "./v3-asset-approvals.json" with { type: "json" };
import { alphaBounds, repoRoot, sha256 } from "./prepare-v3-assets.mjs";
import { approvedLayerSource, formats, sourceRoot, specs } from "./prepare-hero-layers.mjs";

export async function checkHeroLayers({ root = repoRoot, requireSources = false } = {}) {
  let sourcesAvailable = false;
  try { await access(sourceRoot); sourcesAvailable = true; } catch { /* CI uses the pinned approval rows. */ }
  assert(!requireSources || sourcesAvailable, "Onaylı katman kaynakları gerekli.");
  const manifest = JSON.parse(await readFile(resolve(root, "lib/media/hero-layers.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.deepEqual(Object.keys(manifest.assets).sort(), specs.map(spec => spec.id).sort());
  const registered = [];
  for (const spec of specs) {
    const entry = manifest.assets[spec.id];
    assert.equal(entry.sourceSha256, approvals[spec.group].hashes[spec.source], `${spec.id}: onay SHA`);
    assert.equal(entry.approval, approvals[spec.group].file);
    assert.equal(entry.source, `${spec.group === "heroLayers" ? "zeytin-hero-katman" : "zeytin-v3-gorseller"}/${spec.source}`);
    assert.equal(entry.alt, "");
    if (sourcesAvailable) {
      const source = await approvedLayerSource(spec);
      const metadata = await sharp(source).metadata();
      assert.equal(entry.sourceWidth, metadata.width);
      assert.equal(entry.sourceHeight, metadata.height);
      assert.deepEqual(entry.crop, spec.threshold ? await alphaBounds(source, spec.threshold) : null);
    }
    const expected = spec.widths.flatMap(width => formats.map(format => `/images/hero-katman/${spec.id}-w${width}.${format}`));
    assert.deepEqual(entry.outputs.map(output => output.file).sort(), expected.sort());
    for (const output of entry.outputs) {
      const bytes = await readFile(resolve(root, `public${output.file}`));
      assert.equal(bytes.length, output.bytes);
      assert.equal(sha256(bytes), output.sha256, `${output.file}: çıktı SHA`);
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.width, output.width);
      assert.equal(output.width, Number(output.file.match(/-w(\d+)\./)[1]), `${output.file}: srcset genişliği`);
      assert.equal(metadata.height, output.height);
      assert.equal(metadata.format, output.format === "avif" ? "heif" : "webp");
      assert.equal(!!metadata.hasAlpha, !!spec.alpha, `${output.file}: alfa kanalı`);
      if (spec.alpha) {
        const alpha = (await sharp(bytes).stats()).channels.at(-1);
        assert(alpha.min < 255 && alpha.max > 0, `${output.file}: gerçek alfa gerekli`);
      }
      const aspect = entry.crop ? entry.crop.width / entry.crop.height : entry.sourceWidth / entry.sourceHeight;
      assert(Math.abs(output.height - Math.round(output.width / aspect)) <= 1, `${output.file}: oran`);
      assert(bytes.length <= spec.budget * (output.format === "webp" ? 3 : 1), `${output.file}: bayt bütçesi`);
      registered.push(output.file.split("/").at(-1));
    }
  }
  assert.deepEqual((await readdir(resolve(root, "public/images/hero-katman"))).sort(), registered.sort(), "Kayıtsız katman çıktısı");
  const largest = id => Math.max(...manifest.assets[id].outputs.filter(output => output.format === "avif").map(output => output.bytes));
  const enhancementBytes = largest("on-dal") + largest("teneke") + largest("kavanoz");
  const desktopBytes = largest("arka-masaustu") + enhancementBytes;
  const mobileBytes = largest("arka-mobil") + enhancementBytes;
  assert(desktopBytes <= 350_000, `Masaüstü AVIF: ${desktopBytes} > 350000`);
  assert(mobileBytes <= 220_000, `Mobil AVIF: ${mobileBytes} > 220000`);
  return { count: registered.length, desktopBytes, mobileBytes, enhancementBytes, sourcesAvailable };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { process.stdout.write(`PASS: hero katman SHA/onay, ölçü, alfa, oran, AVIF bütçeleri: ${JSON.stringify(await checkHeroLayers({ requireSources: process.argv.includes("--require-sources") }))}\n`); }
  catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
