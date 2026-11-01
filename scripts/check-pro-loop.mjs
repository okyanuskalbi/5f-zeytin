import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../lib/media/pro-loop.json", import.meta.url), "utf8"));
const approval = JSON.parse(await readFile(new URL("../docs/referans/flow-keyframes.json", import.meta.url), "utf8"));
assert(approval.video.userAccepted && approval.video.sha256 === manifest.source.sha256, "Loop requires the accepted Flow source");
assert.equal(manifest.derivation.newPaidGeneration, false);
assert.equal(manifest.derivation.extraCreditsSpent, 0);
for (const output of manifest.outputs) {
  const bytes = await readFile(new URL(`../public${output.file}`, import.meta.url));
  assert.equal(bytes.length, output.bytes, `${output.file} size changed`);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), output.sha256, `${output.file} hash changed`);
}
const movie = await readFile(new URL(`../public${manifest.outputs[0].file}`, import.meta.url));
assert(movie.length < 8_000_000, "Loop must stay below 8 MB");
function boxes(start, end) {
  const result = [];
  for (let offset = start; offset < end;) {
    assert(offset + 8 <= end, "Truncated MP4 header");
    const size = movie.readUInt32BE(offset), type = movie.toString("ascii", offset + 4, offset + 8);
    assert(size >= 8 && offset + size <= end, "Invalid MP4 box size");
    result.push({ type, start: offset, end: offset + size }); offset += size;
  }
  return result;
}
const roots = boxes(0, movie.length), moov = roots.find(b => b.type === "moov"), mdat = roots.find(b => b.type === "mdat");
assert(moov && mdat && moov.start < mdat.start, "Loop requires faststart");
const children = box => boxes(box.start + 8, box.end);
const tracks = children(moov).filter(b => b.type === "trak");
assert.equal(tracks.length, 1, "Loop must have a single silent video track");
const track = tracks[0], tkhd = children(track).find(b => b.type === "tkhd");
assert.equal(movie.readUInt32BE(tkhd.end - 8) / 65536, 1280);
assert.equal(movie.readUInt32BE(tkhd.end - 4) / 65536, 720);
const media = children(track).find(b => b.type === "mdia"), mediaBoxes = children(media);
const handler = mediaBoxes.find(b => b.type === "hdlr");
assert.equal(movie.toString("ascii", handler.start + 16, handler.start + 20), "vide");
const header = mediaBoxes.find(b => b.type === "mdhd");
assert.equal(movie[header.start + 8], 0, "Expected short media header");
const scale = movie.readUInt32BE(header.start + 20), duration = movie.readUInt32BE(header.start + 24) / scale;
assert.equal(duration, 5, "Loop must last exactly five seconds");
const info = mediaBoxes.find(b => b.type === "minf"), table = children(info).find(b => b.type === "stbl");
const entries = children(table), sizes = entries.find(b => b.type === "stsz"), description = entries.find(b => b.type === "stsd");
assert.equal(movie.readUInt32BE(sizes.start + 16), 120, "Loop must contain 120 frames");
assert.equal(movie.toString("ascii", description.start + 20, description.start + 24), "avc1");
console.log("PASS: pro-loop, accepted source,120frames/5s/silent/1280x720/faststart,", movie.length, "bytes");
