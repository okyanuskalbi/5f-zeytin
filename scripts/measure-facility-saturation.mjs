// Task 123: compare full-frame HSV S with the former Task 120 colour operation.
// Rebuild the baseline in memory from the pinned redacted source; never use an unblurred photo.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { checkFacilityV4, facilityV4, facilityV4Manifest } from "./prepare-facility-v4.mjs";
import { repoRoot } from "./prepare-v3-assets.mjs";

async function meanHsvS(bytes) {
  const { data, info } = await sharp(bytes).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  let total = 0;
  for (let index = 0; index < data.length; index += info.channels) {
    const max = Math.max(data[index], data[index + 1], data[index + 2]);
    const min = Math.min(data[index], data[index + 1], data[index + 2]);
    total += max === 0 ? 0 : (max - min) / max;
  }
  return total / (info.width * info.height);
}

try {
  await checkFacilityV4();
  const source = await readFile(resolve(repoRoot, facilityV4.source));
  const manifest = JSON.parse(await readFile(resolve(repoRoot, facilityV4Manifest), "utf8"));
  const measurements = [];
  for (const output of manifest.outputs) {
    const before = await sharp(source).modulate({ saturation: 0.7 })
      .linear([1.025, 1, 0.97], [0, 0, 0]).resize({ width: output.width })
      .webp({ quality: 82, effort: 6 }).toBuffer();
    const after = await readFile(resolve(repoRoot, `public${output.file}`));
    const beforeMean = await meanHsvS(before);
    const afterMean = await meanHsvS(after);
    const reductionPercent = (1 - afterMean / beforeMean) * 100;
    measurements.push({ file: output.file, beforeMean, afterMean, reductionPercent, passed: reductionPercent >= 25 });
  }
  console.log(JSON.stringify({ metric: "full-frame arithmetic mean of HSV S, range 0–1", baseline: "Task 120", minimumReductionPercent: 25, measurements }, null, 2));
  assert(measurements.every(result => result.passed), "HSV S ortalamasındaki düşüş %25 eşiğinin altında.");
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
