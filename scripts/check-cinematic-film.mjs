import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(import.meta.dirname, "..");
const sourceHash = "be77f66a14e418791093fe53937598204313a99f6368204f1fbf6ebaacf14171";
const destination = "/videos/afina-agac-dal.mp4";
const maxBytes = 5 * 1024 * 1024;
const frames = 190;
const fps = 24;
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

/** Top-level MP4 boxes establish progressive startup without requiring ffprobe
 * on the deployment builder. Geometry/streams were probed before the reviewed
 * artifact hash was recorded; CI checks that exact derivative remains intact. */
export function movieBoxes(bytes) {
  const boxes = [];
  let offset = 0;
  while (offset < bytes.length) {
    assert(offset + 8 <= bytes.length, "Truncated MP4 atom header");
    let size = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      assert(offset + 16 <= bytes.length, "Truncated large MP4 atom header");
      const largeSize = bytes.readBigUInt64BE(offset + 8);
      assert(largeSize <= BigInt(Number.MAX_SAFE_INTEGER), "MP4 atom is too large");
      size = Number(largeSize);
      header = 16;
    } else if (size === 0) size = bytes.length - offset;
    assert(size >= header && offset + size <= bytes.length, "Invalid or truncated MP4 atom size");
    boxes.push({ type, offset, size, header });
    offset += size;
  }
  assert(boxes[0]?.type === "ftyp" && boxes[0].size >= 16, "MP4 ftyp box is required first");
  const brand = bytes.toString("ascii", boxes[0].offset + boxes[0].header, boxes[0].offset + boxes[0].header + 4);
  assert(["isom", "iso2", "mp41", "mp42", "avc1"].includes(brand), "Unsupported MP4 ftyp brand");
  const moov = boxes.find(box => box.type === "moov");
  const mdat = boxes.find(box => box.type === "mdat");
  assert(moov && mdat && moov.size > moov.header && mdat.size > mdat.header, "MP4 moov and mdat boxes are required");
  assert(moov.offset < mdat.offset, "Fast-start MP4 requires moov before mdat");
  return boxes;
}

export async function checkCinematicFilm({ root = repoRoot } = {}) {
  const manifest = JSON.parse(await readFile(resolve(root, "lib/media/cinematic-film.json"), "utf8"));
  assert.equal(manifest.version, 1, "Unknown cinematic film version");
  assert.equal(manifest.authorization, "user-2026-11-01-cinematic-flow-hero-request", "Cinematic film authorization is required");
  assert.equal(manifest.provider, "Google Flow", "Only the accepted Flow source may be used");
  const source = manifest.source;
  assert.equal(source?.file, "output/flow-keyframes/A-B-ilk-deneme.mp4", "Unexpected accepted source path");
  assert.equal(source.sha256, sourceHash, "Accepted source hash changed");
  assert.equal(source.userAccepted, true, "Source must be user accepted");
  assert(source.width === 1280 && source.height === 720 && source.fps === fps && source.videoFrames === frames,
    "Preserve accepted source geometry, rate and full frame count");
  assert(Math.abs(source.videoDurationSeconds - frames / fps) < 0.001 && Math.abs(source.containerDurationSeconds - 7.93) < 0.001,
    "Accepted source duration changed");
  const approval = JSON.parse(await readFile(resolve(root, "docs/referans/flow-keyframes.json"), "utf8"));
  assert(approval.video?.userAccepted === true && approval.video.sha256 === sourceHash && approval.video.provider === "Google Flow"
    && approval.video.transition === "A→B" && approval.video.file === "A-B-ilk-deneme.mp4", "Existing clip approval must match the accepted source");
  assert.deepEqual(manifest.derivation, {
    codec: "h264", pixelFormat: "yuv420p", crf: 27, preset: "slow", audio: false,
    fastStart: true, crop: false, toneMapping: false,
  }, "Retain silent SDR geometry and the reviewed encoding settings");
  const output = manifest.output;
  assert.equal(output?.file, destination, "Unexpected cinematic film destination path");
  assert(output.width === 1280 && output.height === 720, "Output geometry must preserve source width and height");
  assert(output.fps === fps && output.frames === frames, "Preserve the full accepted visual sequence");
  assert(Number.isFinite(output.durationSeconds) && Math.abs(output.durationSeconds - frames / fps) <= 0.05,
    "Output duration must retain the full accepted visual sequence");
  assert(Number.isSafeInteger(output.bytes) && output.bytes > 0 && output.bytes <= maxBytes, "Cinematic film exceeds the 5 MiB size budget");
  assert(typeof output.sha256 === "string" && /^[a-f0-9]{64}$/.test(output.sha256), "A valid output hash is required");
  const file = resolve(root, `public${destination}`);
  const stat = await lstat(file);
  assert(stat.isFile() && stat.size <= maxBytes && stat.size === output.bytes, "Cinematic film size changed or is not a regular file");
  const bytes = await readFile(file);
  assert.equal(hash(bytes), output.sha256, "Cinematic film output hash changed");
  movieBoxes(bytes);
  return { checked: 1, bytes: bytes.length, frames, width: output.width, height: output.height,
    durationSeconds: output.durationSeconds, fastStart: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log("PASS: accepted cinematic film", await checkCinematicFilm()); }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
