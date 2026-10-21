import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

export const heroDerivativeManifest = "public/images/hero/optimized/manifest.json";
const sourceFile = "/images/hero/zeytinlik-2400.webp";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const variants = [
  { name: "mobile", width: 900, height: 1350, avif: 15, webp: 10 },
  { name: "desktop", width: 2400, height: 1350, avif: 25, webp: 75 },
];

/** Re-encoding an approved photo is not a new image approval. Keep its provenance. */
export async function verifyHeroDerivatives(root, assets) {
  let manifest;
  try { manifest = JSON.parse(await readFile(join(root, heroDerivativeManifest), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const source = assets.find((asset) => asset.file === sourceFile && asset.status === "approved" && asset.runtime !== false);
  if (!source || manifest.source !== source.file || manifest.sourceSha256 !== source.sha256 || manifest.files.length !== 4) throw new Error("Hero derivative source is not approved.");
  const sourceBytes = await readFile(join(root, "public", source.file));
  const allowed = variants.flatMap((variant) => ["avif", "webp"].map((format) => ({ file: `/images/hero/optimized/${variant.name}.${format}`, width: variant.width, height: variant.height, format, quality: variant[format] })));
  const unique = new Set();
  for (const entry of manifest.files) {
    const expected = allowed.find((item) => item.file === entry.file);
    if (!expected || unique.has(entry.file)) throw new Error("Unexpected hero derivative.");
    unique.add(entry.file);
    const bytes = await readFile(join(root, "public", entry.file));
    const metadata = await sharp(bytes).metadata();
    if (hash(bytes) !== entry.sha256 || metadata.width !== expected.width || metadata.height !== expected.height || ((entry.file.includes("mobile") || expected.format === "avif") && bytes.length > 60 * 1024)) throw new Error("Invalid hero derivative hash, dimensions or budget.");
    // Encoder output is byte-identical only on the platform that produced it; CI (Linux) checks hash, size and budget above.
    if (process.env.CI) continue;
    const derived = await sharp(sourceBytes).resize(expected.width, expected.height, { fit: "cover", position: "right" })[expected.format]({ quality: expected.quality }).toBuffer();
    if (hash(derived) !== entry.sha256) throw new Error("Hero derivative does not match the approved source transform.");
  }
  return manifest.files.map((entry) => ({ ...source, ...entry }));
}

async function generate() {
  const root = process.cwd();
  const registry = JSON.parse(await readFile("public/images/generated/manifest.json", "utf8"));
  const source = registry.assets.find((asset) => asset.file === sourceFile && asset.status === "approved" && asset.runtime !== false);
  const bytes = await readFile(join("public", sourceFile));
  if (!source || hash(bytes) !== source.sha256) throw new Error("Approved hero source hash mismatch.");
  await mkdir("public/images/hero/optimized", { recursive: true });
  const files = [];
  for (const variant of variants) for (const format of ["avif", "webp"]) {
    const buffer = await sharp(bytes).resize(variant.width, variant.height, { fit: "cover", position: "right" })[format]({ quality: variant[format] }).toBuffer();
    const file = `/images/hero/optimized/${variant.name}.${format}`;
    await writeFile(join("public", file), buffer);
    files.push({ file, sha256: hash(buffer), width: variant.width, height: variant.height });
    console.log(`${file}: ${buffer.length} bytes`);
  }
  await writeFile(heroDerivativeManifest, JSON.stringify({ source: sourceFile, sourceSha256: source.sha256, fit: "cover", position: "right", files }, null, 2) + "\n");
  await verifyHeroDerivatives(root, registry.assets);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generate();
