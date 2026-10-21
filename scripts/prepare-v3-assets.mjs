import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { approvals, formats, specs } from "./v3-asset-specs.mjs";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const sourceRoot = resolve(process.env.V3_SOURCE_ROOT ?? resolve(repoRoot, "../AFINA-KAYNAK"));
export const sourceDirectories = { v3: "zeytin-v3-gorseller", gallery: "urun-gorselleri/onayli" };
export const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");

export async function approvedSource(spec) {
  if (spec.group === "facility") {
    const bytes = await readFile(resolve(repoRoot, "docs/referans/tesis", spec.source));
    if (sha256(bytes) !== approvals.facility.hashes[spec.source]) throw new Error("Bulanık tesis kaynağı değişti.");
    return bytes;
  }
  const directory = resolve(sourceRoot, sourceDirectories[spec.group]);
  const onay = await readFile(resolve(directory, "ONAY.md"), "utf8");
  const expected = approvals[spec.group].hashes[spec.source];
  const row = onay.split("\n").find(line => line.startsWith(`| ${spec.source} |`));
  if (!expected || !row?.includes(`| ${expected} |`)) throw new Error(`ONAY.md eşleşmiyor: ${spec.source}`);
  const bytes = await readFile(resolve(directory, spec.source));
  if (sha256(bytes) !== expected) throw new Error(`Onaylı kaynak SHA-256 eşleşmiyor: ${spec.source}`);
  return bytes;
}

/** Threshold chooses bounds only. Never binarize the output alpha or flatten it. */
export async function alphaBounds(bytes, threshold) {
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + info.channels - 1] > threshold) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) throw new Error("Alpha eşiğinde görünür piksel yok.");
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

export async function prepareV3Assets() {
  // Validate the entire approval set before writing any derivative.
  const sources = new Map();
  for (const spec of specs) sources.set(spec.id, await approvedSource(spec));
  const directory = resolve(repoRoot, "public/images/v3");
  await mkdir(directory, { recursive: true });
  const manifest = { version: 1, encoder: { sharp: sharp.versions.sharp, vips: sharp.versions.vips }, assets: {} };
  for (const spec of specs) {
    const input = sources.get(spec.id);
    const metadata = await sharp(input).metadata();
    const crop = spec.threshold ? await alphaBounds(input, spec.threshold) : null;
    const entry = {
      source: `${spec.group === "facility" ? "docs/referans/tesis" : sourceDirectories[spec.group]}/${spec.source}`,
      sourceSha256: sha256(input), approval: approvals[spec.group].file,
      alt: spec.alt, sourceWidth: metadata.width, sourceHeight: metadata.height,
      crop, alphaThreshold: spec.threshold ?? null, outputs: [],
    };
    for (const size of spec.widths ?? spec.heights) for (const format of formats) {
      const resize = spec.heights ? { height: size } : { width: size, ...(spec.square ? { height: size } : spec.aspect ? { height: Math.round(size / spec.aspect), fit: "cover" } : {}) };
      let quality = format === "avif" ? 50 : 76;
      let output;
      while (true) {
        let pipeline = sharp(input);
        if (crop) pipeline = pipeline.extract(crop);
        pipeline = pipeline.resize(resize);
        output = await pipeline[format]({ quality, effort: format === "webp" ? 6 : 4 }).toBuffer({ resolveWithObject: true });
        if (!spec.budget || output.data.length <= spec.budget) break;
        quality -= 5;
        if (quality < 5) throw new Error(`Bayt bütçesi karşılanamıyor: ${spec.id} ${size} ${format}`);
      }
      const file = `/images/v3/${spec.id}-${spec.heights ? "h" : "w"}${size}.${format}`;
      await writeFile(resolve(repoRoot, `public${file}`), output.data);
      entry.outputs.push({ file, format, width: output.info.width, height: output.info.height, bytes: output.data.length, sha256: sha256(output.data), quality });
    }
    manifest.assets[spec.id] = entry;
    process.stdout.write(`${spec.id}: ${entry.outputs.length} çıktı\n`);
  }
  await writeFile(resolve(directory, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { await prepareV3Assets(); }
  catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
