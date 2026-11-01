import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const sourceId = "04-naturel-sizma-zeytinyagi-1l-sahne";
const sourceHash = "443a25a4e94dab740fecff0d5605f8e5c925c421720f4cc8c1160cc3394c20f4";
const derivativeHash = "1d077fa4193e60e4e948e2a322fd77383de3c36279d017b2b280f9ee58efc1e8";
const ogHash = "b028874ba052eb71836b72584e348eb51faf16f822651f50c7111425ddfad9a0";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

// Task 161 authorizes a social crop of the existing approved bottle photograph.
// Pin both the approval chain and the output; this never approves new imagery.
export async function verifyProPlanMedia(root) {
  let manifest;
  try { manifest = JSON.parse(await readFile(resolve(root, "lib/media/pro-loop.json"), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const catalogue = JSON.parse(await readFile(resolve(root, "public/images/v3/manifest.json"), "utf8"));
  const source = catalogue.assets[sourceId];
  assert.equal(source.sourceSha256, sourceHash, "OG requires the approved bottle source");
  assert.equal(source.approval, "AFINA-KAYNAK/urun-gorselleri/onayli/ONAY.md");
  const derivative = source.outputs.find(output => output.file === `/images/v3/${sourceId}-w1600.webp`);
  assert.equal(derivative.sha256, derivativeHash);
  assert.equal(hash(await readFile(resolve(root, `public${derivative.file}`))), derivativeHash);
  const file = "/brand/og-zeytinyagi.webp";
  const entry = manifest.outputs.find(output => output.file === file);
  assert.equal(entry.sha256, ogHash, "OG output differs from the reviewed crop");
  const bytes = await readFile(resolve(root, `public${file}`));
  assert.equal(hash(bytes), ogHash);
  assert.equal(bytes.length, entry.bytes);
  assert(bytes.length < 100_000);
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  return [{ file, width: 1200, height: 630, status: "approved", runtime: true, promptId: "TASK-161-approved-photo-crop" }];
}
