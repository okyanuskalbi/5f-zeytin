import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { checkV3Assets } from "./check-v3-assets.mjs";
import { alphaBounds, repoRoot, sha256 } from "./prepare-v3-assets.mjs";
import { checkFacilityV4 } from "./prepare-facility-v4.mjs";

const root = resolve(repoRoot, "test-results/111-asset-negative");
const manifestFile = resolve(root, "public/images/v3/manifest.json");
let original;
before(async () => {
  await mkdir(resolve(root, "public/images"), { recursive: true });
  await mkdir(resolve(root, "lib/media"), { recursive: true });
  await cp(resolve(repoRoot, "lib/media/v4-assets.json"), resolve(root, "lib/media/v4-assets.json"));
  await cp(resolve(repoRoot, "public/images/v3"), resolve(root, "public/images/v3"), { recursive: true });
  await cp(resolve(repoRoot, "public/images/tesis"), resolve(root, "public/images/tesis"), { recursive: true });
  await cp(resolve(repoRoot, "public/images/tesis-v4-manifest.json"), resolve(root, "public/images/tesis-v4-manifest.json"));
  original = await readFile(manifestFile, "utf8");
});
after(async () => { await rm(root, { recursive: true, force: true }); });

test("alpha > 40 and > 200 choose different bounds without including faint edges", async () => {
  const data = Buffer.alloc(4 * 4 * 4);
  data[(1 * 4 + 1) * 4 + 3] = 100;
  data[(2 * 4 + 2) * 4 + 3] = 255;
  data[3] = 40;
  const png = await sharp(data, { raw: { width: 4, height: 4, channels: 4 } }).png().toBuffer();
  assert.deepEqual(await alphaBounds(png, 40), { left: 1, top: 1, width: 2, height: 2 });
  assert.deepEqual(await alphaBounds(png, 200), { left: 2, top: 2, width: 1, height: 1 });
});

test("rejects forged source approval SHA before accepting derivatives", async () => {
  const manifest = JSON.parse(original);
  manifest.assets["hero-masaustu"].sourceSha256 = "0".repeat(64);
  await writeFile(manifestFile, JSON.stringify(manifest));
  await assert.rejects(checkV3Assets({ root }), /ONAY SHA/);
  await writeFile(manifestFile, original);
});

test("rejects over-budget bytes even when the output hash and size are updated", async () => {
  const manifest = JSON.parse(original);
  const output = manifest.assets["hero-masaustu"].outputs[0];
  const file = resolve(root, `public${output.file}`);
  const bytes = await readFile(file);
  const padded = Buffer.concat([bytes, Buffer.alloc(180_001 - bytes.length)]);
  output.bytes = padded.length;
  output.sha256 = sha256(padded);
  await writeFile(file, padded);
  await writeFile(manifestFile, JSON.stringify(manifest));
  await assert.rejects(checkV3Assets({ root }), /180001 > 180000 bayt/);
  await writeFile(file, bytes);
  await writeFile(manifestFile, original);
});

test("enforces the tighter 60000-byte v4 product budget with a matching manifest hash", async () => {
  const manifest = JSON.parse(original);
  const output = manifest.assets["urun-01-kirma-10kg"].outputs[0];
  const file = resolve(root, `public${output.file}`);
  const bytes = await readFile(file);
  const padded = Buffer.concat([bytes, Buffer.alloc(60001 - bytes.length)]);
  output.bytes = padded.length;
  output.sha256 = sha256(padded);
  try {
    await writeFile(file, padded);
    await writeFile(manifestFile, JSON.stringify(manifest));
    await assert.rejects(checkV3Assets({ root }), /60001 > 60000 bayt/);
  } finally {
    await writeFile(file, bytes);
    await writeFile(manifestFile, original);
  }
});

test("rejects retired pantry data added back to the runtime projection", async () => {
  const path = resolve(root, "lib/media/v4-assets.json");
  const original = await readFile(path, "utf8");
  const runtime = JSON.parse(original);
  runtime.assets["kiler-duvar"] = {};
  try {
    await writeFile(path, JSON.stringify(runtime));
    await assert.rejects(checkV3Assets({ root }), /v4 runtime manifest/);
  } finally { await writeFile(path, original); }
});

test("accepts pinned v4 facility derivatives and rejects a forged source or colour operation", async () => {
  assert.equal(await checkFacilityV4({ root }), 2);
  const path = resolve(root, "public/images/tesis-v4-manifest.json");
  const original = await readFile(path, "utf8");
  for (const change of [entry => { entry.sourceSha256 = "0".repeat(64); }, entry => { entry.operation.saturation = 1; }]) {
    const entry = JSON.parse(original);
    change(entry);
    await writeFile(path, JSON.stringify(entry));
    await assert.rejects(checkFacilityV4({ root }), /kaynak\/renk/);
  }
  await writeFile(path, original);
});

test("rejects changed v4 facility pixels against the registered output hash", async () => {
  const path = resolve(root, "public/images/tesis/tesis-osmaniye-v4-1200.webp");
  const bytes = await readFile(path);
  await writeFile(path, Buffer.concat([bytes, Buffer.from("changed")]));
  await assert.rejects(checkFacilityV4({ root }), /çıktı SHA/);
  await writeFile(path, bytes);
});
