import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import approvals from "./v3-asset-approvals.json" with { type: "json" };
import { alphaBounds, repoRoot, sha256 } from "./prepare-v3-assets.mjs";

export const sourceRoot = resolve(repoRoot, "../AFINA-KAYNAK");
export const formats = ["avif", "webp"];
export const specs = [
  { id: "arka-masaustu", group: "heroLayers", source: "taslak/arka-masaustu.png", widths: [1200, 2048], budget: 120_000 },
  { id: "arka-mobil", group: "heroLayers", source: "taslak/arka-mobil.png", widths: [640, 1152], budget: 80_000 },
  { id: "on-dal", group: "heroLayers", source: "taslak/on-dal-temiz.png", widths: [1200, 2048], alpha: true, budget: 35_000 },
  { id: "teneke", group: "v3", source: "urun-01-kirma-10kg.png", widths: [360, 720], alpha: true, threshold: 40, budget: 45_000 },
  { id: "kavanoz", group: "v3", source: "urun-02-kirma-1kg.png", widths: [360, 720], alpha: true, threshold: 40, budget: 45_000 },
];

export function verifyApprovedBytes(bytes, file, expected, approval) {
  const row = approval.split("\n").find(line => line.startsWith(`| ${file} |`));
  if (!expected || !row?.includes(`| ${expected} |`)) throw new Error(`ONAY.md eşleşmiyor: ${file}`);
  if (sha256(bytes) !== expected) throw new Error(`Onaylı kaynak SHA-256 eşleşmiyor: ${file}`);
}

export async function approvedLayerSource(spec) {
  const record = approvals[spec.group];
  const directory = resolve(sourceRoot, spec.group === "heroLayers" ? "zeytin-hero-katman" : "zeytin-v3-gorseller");
  const approval = await readFile(resolve(directory, "ONAY.md"), "utf8");
  const bytes = await readFile(resolve(directory, spec.source));
  verifyApprovedBytes(bytes, spec.source, record.hashes[spec.source], approval);
  return bytes;
}

export async function prepareHeroLayers() {
  // Fail closed for every original before producing any optimized files.
  const sources = new Map();
  for (const spec of specs) sources.set(spec.id, await approvedLayerSource(spec));
  await mkdir(resolve(repoRoot, "public/images/hero-katman"), { recursive: true });
  const manifest = { version: 1, encoder: { sharp: sharp.versions.sharp, vips: sharp.versions.vips }, assets: {} };
  for (const spec of specs) {
    const input = sources.get(spec.id);
    const metadata = await sharp(input).metadata();
    if (!!metadata.hasAlpha !== !!spec.alpha) throw new Error(`Kaynak alfa kanalı beklenenden farklı: ${spec.id}`);
    const crop = spec.threshold ? await alphaBounds(input, spec.threshold) : null;
    const record = approvals[spec.group];
    const entry = { source: `${spec.group === "heroLayers" ? "zeytin-hero-katman" : "zeytin-v3-gorseller"}/${spec.source}`,
      sourceSha256: sha256(input), approval: record.file, alt: "", sourceWidth: metadata.width, sourceHeight: metadata.height,
      crop, outputs: [] };
    for (const width of spec.widths) for (const format of formats) {
      let quality = format === "avif" ? 52 : 78;
      let output;
      do {
        let pipeline = sharp(input);
        if (crop) pipeline = pipeline.extract(crop);
        output = await pipeline.resize({ width })[format]({ quality, effort: format === "avif" ? 5 : 6 }).toBuffer({ resolveWithObject: true });
        if (output.data.length <= spec.budget * (format === "webp" ? 3 : 1)) break;
        quality -= 4;
        if (quality < 20) throw new Error(`Görsel bütçesi karşılanamıyor: ${spec.id} ${width} ${format}`);
      } while (true);
      const file = `/images/hero-katman/${spec.id}-w${width}.${format}`;
      await writeFile(resolve(repoRoot, `public${file}`), output.data);
      entry.outputs.push({ file, format, width: output.info.width, height: output.info.height,
        bytes: output.data.length, sha256: sha256(output.data), quality });
    }
    manifest.assets[spec.id] = entry;
    process.stdout.write(`${spec.id}: ${entry.outputs.length} çıktı\n`);
  }
  await writeFile(resolve(repoRoot, "lib/media/hero-layers.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { await prepareHeroLayers(); }
  catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
