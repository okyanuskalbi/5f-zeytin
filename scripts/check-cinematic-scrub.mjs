import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { movieBoxes } from "./check-cinematic-film.mjs";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "lib/media/cinematic-scrub.json"), "utf8"));
const approval = JSON.parse(await readFile(resolve(root, "docs/referans/flow-keyframes.json"), "utf8"));
assert(manifest.source.userAccepted && approval.video.userAccepted && manifest.source.sha256 === approval.video.sha256,
  "Scroll movie must retain the accepted Flow source");
assert.equal(manifest.source.file, "output/flow-keyframes/A-B-ilk-deneme.mp4");
assert.equal(manifest.output.file, "/videos/afina-hasat-scrub.mp4");
assert.deepEqual(manifest.derivation, { codec: "h264", crf: 26, preset: "slow", gop: 8, pixelFormat: "yuv420p", fastStart: true, audio: false, crop: false, toneMapping: false });
const { output } = manifest;
assert(output.width === 1280 && output.height === 720 && output.frames === 190 && output.fps === 24);
assert(Math.abs(output.durationSeconds - 190 / 24) < .001 && output.maxKeyframeGap <= 8);
const bytes = await readFile(resolve(root, `public${output.file}`));
assert(bytes.length === output.bytes && bytes.length < 5_000_000, "Scroll movie exceeds its 5 MB budget");
assert.equal(createHash("sha256").update(bytes).digest("hex"), output.sha256, "Scroll movie artifact changed");
movieBoxes(bytes);
console.log(`PASS: accepted scroll film, ${bytes.length} bytes, 190 frames, GOP <= 8, fast-start`);
