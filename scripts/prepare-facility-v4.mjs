// Tasks 120/123: local colour derivative of the pinned, already-redacted photo only.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { approvals } from "./v3-asset-specs.mjs";
import { repoRoot, sha256 } from "./prepare-v3-assets.mjs";

export const facilityV4 = {
  source: "docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg",
  sourceSha256: approvals.facility.hashes["tesis-osmaniye-plaka-bulanik.jpg"],
  approval: "docs/tasks/123-footer-yeniden-odeme-guven.md",
  alt: "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi",
  operation: { saturation: 0.48, linear: [1.04, 1, 0.95], brightness: 0.96 },
};
const widths = [1200, 2400];
export const facilityV4Manifest = "public/images/tesis-v4-manifest.json";

export async function prepareFacilityV4({ root = repoRoot } = {}) {
  const source = await readFile(resolve(root, facilityV4.source));
  assert.equal(sha256(source), facilityV4.sourceSha256, "Bulanık tesis kaynağı değişti.");
  const outputs = [];
  await mkdir(resolve(root, "public/images/tesis"), { recursive: true });
  for (const width of widths) {
    const { saturation, brightness, linear } = facilityV4.operation;
    const { data, info } = await sharp(source).modulate({ saturation, brightness })
      .linear(linear, [0, 0, 0]).resize({ width }).webp({ quality: 82, effort: 6 }).toBuffer({ resolveWithObject: true });
    const file = `/images/tesis/tesis-osmaniye-v4-${width}.webp`;
    await writeFile(resolve(root, `public${file}`), data);
    outputs.push({ file, format: "webp", width: info.width, height: info.height, bytes: data.length, sha256: sha256(data) });
  }
  assert.equal(sha256(await readFile(resolve(root, facilityV4.source))), facilityV4.sourceSha256);
  const manifest = { version: 1, ...facilityV4, outputs };
  await writeFile(resolve(root, facilityV4Manifest), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export async function checkFacilityV4({ root = repoRoot } = {}) {
  const manifest = JSON.parse(await readFile(resolve(root, facilityV4Manifest), "utf8"));
  const { outputs, ...metadata } = manifest;
  assert.deepEqual(metadata, { version: 1, ...facilityV4 }, "v4 tesis kaynak/renk kaydı değişti.");
  // The pinned redacted source is in the repo, so CI can verify it too.
  const source = await readFile(resolve(repoRoot, facilityV4.source));
  assert.equal(sha256(source), facilityV4.sourceSha256, "Bulanık tesis kaynağı değişti.");
  const sourceMeta = await sharp(source).metadata();
  assert.equal(outputs.length, widths.length);
  for (const [index, output] of outputs.entries()) {
    assert.equal(output.file, `/images/tesis/tesis-osmaniye-v4-${widths[index]}.webp`);
    assert.equal(output.format, "webp");
    const bytes = await readFile(resolve(root, `public${output.file}`));
    assert.equal(sha256(bytes), output.sha256, "v4 tesis çıktı SHA");
    assert.equal(bytes.length, output.bytes);
    const meta = await sharp(bytes).metadata();
    assert.equal(meta.format, "webp");
    assert.equal(meta.width, widths[index]);
    assert.equal(meta.width, output.width);
    assert.equal(meta.height, output.height);
    assert(Math.abs(meta.height - Math.round(meta.width * sourceMeta.height / sourceMeta.width)) <= 1);
  }
  return outputs.length;
}

export async function verifyFacilityV4Derivatives(root) {
  let manifest;
  try { manifest = JSON.parse(await readFile(resolve(root, facilityV4Manifest), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  await checkFacilityV4({ root });
  return manifest.outputs.map(output => ({ ...output, status: "approved", runtime: true, promptId: "TASK-120" }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await prepareFacilityV4();
    process.stdout.write(`PASS: ${await checkFacilityV4()} v4 tesis türevi; kaynak SHA korundu; ${JSON.stringify(facilityV4.operation)}.\n`);
  } catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
