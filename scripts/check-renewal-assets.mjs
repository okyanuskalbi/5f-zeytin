import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const repoRoot = resolve(import.meta.dirname, "..");
export async function checkRenewalAssets({ root = repoRoot } = {}) {
  const manifest = JSON.parse(await readFile(resolve(root, "lib/media/renewal-assets.json"), "utf8"));
  assert.equal(manifest.authorization, "user-2026-11-01-customer-renewal-request");
  assert(/^[a-f0-9]{64}$/.test(manifest.sourcePdfSha256));
  assert(/^[a-f0-9]{64}$/.test(manifest.sourceImageSha256));
  assert.equal(manifest.outputs.length, 4);
  for (const output of manifest.outputs) {
    assert(/^\/images\/renewal\/tesis-musteri-(800|1672)\.(avif|webp)$/.test(output.file));
    const bytes = await readFile(resolve(root, `public${output.file}`));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), output.sha256);
    assert.equal(bytes.length, output.bytes);
    assert(bytes.length <= 200000, "Facility derivative exceeds 200KB");
    const image = await sharp(bytes).metadata();
    assert.equal(image.width, output.width);
    assert.equal(image.height, output.height);
    assert.equal(image.format === "heif" ? "avif" : image.format, output.format);
    assert(Math.abs(image.width / image.height - 1672 / 941) < .002, "Preserve client photograph geometry");
  }
  return { checked: manifest.outputs.length };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log("PASS: customer renewal assets", await checkRenewalAssets()); }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
