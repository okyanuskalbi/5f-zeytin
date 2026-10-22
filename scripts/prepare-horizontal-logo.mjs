import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

// Task 129: preserve the supplied paths and gold fills; recolor only the AFİNA lettering.
const sourcePath = "docs/referans/logolar/afina-zeytin-yatay.svg";
const sourceSha256 = "6a49624852733560d2e14fb562b19ab3738824020f187cd44b84fdd88769d04c";
const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const files = ["", "-dark"].flatMap(tone => [2, 3].map(scale => `/brand/afina-zeytin-yatay${tone}@${scale}x.webp`));
const outputHashes = [
  "ce3a4433172a4677ff7df6d9190232035b75a6aa90022e8656470d001737459f",
  "268ea41e1264fd161b8fa9af5988cda9fe97a25652897ccbe6ebd9dcd0bf91f5",
  "abeb0456a18bd6078a07258b7587c233c2d7a0f2605d25a8750c952c1734dee9",
  "bc435145472bd7cacf6fdc393ae1c9e0651d4d041422974a42f47fb8e0598ff9",
];

async function readSource(root) {
  const source = await readFile(resolve(root, sourcePath), "utf8");
  assert.equal(createHash("sha256").update(source).digest("hex"), sourceSha256, "Logo source artwork changed");
  return source;
}

async function* expectedLogos(root) {
  const source = await readSource(root);
  const black = 'fill="rgb(0%, 0%, 0%)"';
  assert.equal(source.split(black).length - 1, 7, "Review changed logo black fills");
  // The first six black paths are AFİNA (including the dotted İ). The seventh
  // is a tiny detail of the hand emblem and must retain its original black fill.
  let blackFillIndex = 0;
  const dark = source.replaceAll(black, () => ++blackFillIndex <= 6 ? 'fill="#F7F3EA"' : black);
  for (const [tone, svg] of [["", source], ["-dark", dark]]) {
    for (const scale of [2, 3]) {
      const width = 180 * scale;
      const height = 48 * scale;
      const file = `/brand/afina-zeytin-yatay${tone}@${scale}x.webp`;
      // Keep the complete supplied viewBox, including its clear space. No trimming or tracing.
      const before = await sharp(Buffer.from(svg), { density: 144 })
        .resize(width, height, { fit: "contain", background: "#00000000" }).png().toBuffer();
      const encoded = await sharp(before).webp({ lossless: true, effort: 6 }).toBuffer();
      yield { file, width, height, before, encoded };
    }
  }
}

// Like the existing hero/facility derivative gate, this is read-only. Task 129
// authorizes this pinned source and the six letter recolors, never arbitrary brand files.
export async function verifyHorizontalLogoDerivatives(root) {
  const present = await Promise.all(files.map(async file => {
    try { await readFile(resolve(root, `public${file}`)); return true; }
    catch (error) { if (error.code === "ENOENT") return false; throw error; }
  }));
  if (present.every(value => !value)) return [];
  await readSource(root);
  const assets = [];
  for (const [index, file] of files.entries()) {
    const actual = await readFile(resolve(root, `public${file}`));
    // Pin the locally verified output bytes: SVG/WebP encoders may differ between
    // macOS and Linux. Build validation never re-encodes or changes approved files.
    assert.equal(createHash("sha256").update(actual).digest("hex"), outputHashes[index], `Logo derivative hash changed: ${file}`);
    assert.ok(actual.length <= 25_000, `${file} exceeds 25 KB`);
    const scale = 2 + index % 2;
    const width = 180 * scale;
    const height = 48 * scale;
    const metadata = await sharp(actual).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.hasAlpha, true);
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assets.push({ file, width, height, status: "approved", runtime: true, promptId: "TASK-129" });
  }
  return assets;
}

async function prepareHorizontalLogo({ root = repoRoot, checkOnly = false } = {}) {
  const evidencePath = resolve(root, ".cache/task-129");
  await mkdir(evidencePath, { recursive: true });
  await mkdir(resolve(root, "public/brand"), { recursive: true });
  const report = { sourcePath, sourceSha256, replacedBlackFills: 6, preservedEmblemBlackFills: 1, assets: [] };
  for await (const { file, width, height, before, encoded: expected } of expectedLogos(root)) {
    const outputPath = resolve(root, `public${file}`);
    if (!checkOnly) await writeFile(outputPath, expected);
    const encoded = await readFile(outputPath);
    assert.ok(encoded.length <= 25_000, `${file} exceeds 25 KB`);
    const after = await sharp(encoded).png().toBuffer();
    const reference = await sharp(before).ensureAlpha().raw().toBuffer();
    const actual = await sharp(after).ensureAlpha().raw().toBuffer();
    assert.equal(actual.length, reference.length);
    let maxVisibleChannelDelta = 0;
    let maxAlphaDelta = 0;
    let changedVisiblePixels = 0;
    for (let offset = 0; offset < actual.length; offset += 4) {
      const alphaDelta = Math.abs(actual[offset + 3] - reference[offset + 3]);
      maxAlphaDelta = Math.max(maxAlphaDelta, alphaDelta);
      // RGB beneath completely transparent pixels has no visible meaning in WebP.
      let channelDelta = 0;
      if (actual[offset + 3] || reference[offset + 3]) {
        for (let channel = 0; channel < 3; channel++) {
          channelDelta = Math.max(channelDelta, Math.abs(actual[offset + channel] - reference[offset + channel]));
        }
      }
      maxVisibleChannelDelta = Math.max(maxVisibleChannelDelta, channelDelta);
      if (channelDelta || alphaDelta) changedVisiblePixels++;
    }
    assert.equal(changedVisiblePixels, 0, `${file} differs visibly from its PNG reference`);
    const name = file.split("/").at(-1).replace(/\.webp$/, "");
    await writeFile(`${evidencePath}/${name}-before.png`, before);
    await writeFile(`${evidencePath}/${name}-after.png`, after);
    report.assets.push({ file: `public${file}`, bytes: encoded.length, width, height, maxVisibleChannelDelta, maxAlphaDelta, changedVisiblePixels });
  }
  await writeFile(`${evidencePath}/logo-comparison.json`, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const report = await prepareHorizontalLogo({ checkOnly: process.argv.includes("--check") });
    await verifyHorizontalLogoDerivatives(repoRoot);
    console.log(JSON.stringify(report, null, 2));
  } catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
