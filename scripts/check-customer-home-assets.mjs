import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { movieBoxes } from "./mp4-boxes.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const sourceDirectory = "AFINA-KAYNAK/musteri-2026-11-10";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const maxVideoBytes = 6_000_000;

function childBoxes(bytes, parent) {
  const boxes = [];
  for (let offset = parent.offset + parent.header; offset < parent.offset + parent.size;) {
    assert(offset + 8 <= parent.offset + parent.size, "Truncated child MP4 atom");
    const size = bytes.readUInt32BE(offset);
    assert(size >= 8 && offset + size <= parent.offset + parent.size, "Invalid child MP4 atom");
    boxes.push({ type: bytes.toString("ascii", offset + 4, offset + 8), offset, size, header: 8 });
    offset += size;
  }
  return boxes;
}
/** Inspect exact MP4 structure without requiring ffmpeg on CI or the build server. */
function verifyMovie(bytes, output) {
  const roots = movieBoxes(bytes);
  const children = parent => childBoxes(bytes, parent);
  const child = (parent, type) => {
    const box = children(parent).find(box => box.type === type);
    assert(box, `Required MP4 ${type} atom missing`);
    return box;
  };
  const moov = roots.find(box => box.type === "moov");
  const tracks = children(moov).filter(box => box.type === "trak");
  assert.equal(tracks.length, 1, "Hero derivative must have a single silent video track");
  const tkhd = child(tracks[0], "tkhd");
  assert.equal(bytes.readUInt32BE(tkhd.offset + tkhd.size - 8) / 65536, output.width, "video derivative width");
  assert.equal(bytes.readUInt32BE(tkhd.offset + tkhd.size - 4) / 65536, output.height, "video derivative height");
  const mdia = child(tracks[0], "mdia"), hdlr = child(mdia, "hdlr");
  assert.equal(bytes.toString("ascii", hdlr.offset + 16, hdlr.offset + 20), "vide", "Hero track must be video without audio/data");
  const mdhd = child(mdia, "mdhd");
  assert.equal(bytes[mdhd.offset + 8], 0, "Expected short media header");
  const duration = bytes.readUInt32BE(mdhd.offset + 24) / bytes.readUInt32BE(mdhd.offset + 20);
  assert(Math.abs(duration - output.durationSeconds) < 0.001, "video derivative duration");
  assert(Math.abs(duration - 17.16) < 0.001, "Full customer video duration must be preserved");
  const table = child(child(mdia, "minf"), "stbl"), sizes = child(table, "stsz"), description = child(table, "stsd");
  assert.equal(bytes.readUInt32BE(sizes.offset + 16), 429, "Full customer video frame count must be preserved");
  assert.equal(bytes.toString("ascii", description.offset + 20, description.offset + 24), "avc1", "H264 video required");
  assert.equal(output.frames, 429);
  assert.equal(output.fps, 25);
  assert.equal(output.codec, "h264");
  assert.equal(output.audio, false);
}

/** Private source files are checked locally; CI validates every pinned derivative. */
export async function checkCustomerHomeAssets({ root = repoRoot, requireSources = false } = {}) {
  let sourcesAvailable = false;
  try {
    const sourceStat = await stat(resolve(root, sourceDirectory));
    assert(sourceStat.isDirectory(), "Original customer source path must be a directory");
    sourcesAvailable = true;
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  assert(!requireSources || sourcesAvailable, "Original customer source directory required");
  const manifest = JSON.parse(await readFile(resolve(root, "lib/media/customer-home.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.provider, "customer-supplied");
  assert.equal(manifest.authorization, "user-2026-11-10-homepage-brief");
  assert.equal(manifest.sourceDirectory, sourceDirectory);
  assert.equal(manifest.paidGeneration, false);
  assert.deepEqual(manifest.derivation, { codec: "h264", pixelFormat: "yuv420p", audio: false, fastStart: true, toneMapping: false, crop: false });
  assert.deepEqual(Object.keys(manifest.assets).sort(), ["bereketin-hasat-vakti", "fabrika", "her-tanede-ayni-ozen-el"]);
  const imageNames = new Set(), videoNames = new Set();
  let images = 0, videos = 0;
  async function verifyImage(output, id) {
    assert.match(output.file, new RegExp(`^/images/customer-home/${id}-[0-9]+\\.(avif|webp)$`));
    const bytes = await readFile(resolve(root, `public${output.file}`));
    assert.equal(hash(bytes), output.sha256, `${id} derivative hash`);
    assert.equal(bytes.length, output.bytes, `${id} derivative bytes`);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.width, output.width, `${id} derivative width`);
    assert.equal(metadata.height, output.height, `${id} derivative height`);
    assert.equal(metadata.format, output.format === "avif" ? "heif" : output.format, `${id} derivative format`);
    if (output.format === "avif") assert.equal(metadata.compression, "av1");
    imageNames.add(output.file.split("/").at(-1));
    images++;
  }
  for (const [id, asset] of Object.entries(manifest.assets)) {
    assert.equal(asset.source, `${sourceDirectory}/${id}.jpg`);
    assert.match(asset.sourceSha256, /^[a-f0-9]{64}$/);
    assert(asset.alt, `${id} accessible description required`);
    assert.equal(asset.sourceWidth, 1086);
    assert.equal(asset.sourceHeight, 1448);
    if (sourcesAvailable) {
      const source = await readFile(resolve(root, asset.source));
      assert.equal(hash(source), asset.sourceSha256, `${id} source hash`);
      const metadata = await sharp(source).metadata();
      assert.equal(metadata.width, asset.sourceWidth, `${id} source width`);
      assert.equal(metadata.height, asset.sourceHeight, `${id} source height`);
    }
    assert.deepEqual([...new Set(asset.outputs.map(output => output.width))].sort((a,b) => a-b), [480, 800, 1086]);
    for (const width of [480, 800, 1086]) {
      assert.deepEqual(asset.outputs.filter(output => output.width === width).map(output => output.format).sort(), ["avif", "webp"], `${id} complete format pair`);
    }
    for (const output of asset.outputs) await verifyImage(output, id);
  }
  const hero = manifest.hero;
  assert.equal(hero.source, `${sourceDirectory}/hero-video-zeytinlik.mp4`);
  assert.match(hero.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(hero.sourceWidth, 1920);
  assert.equal(hero.sourceHeight, 1080);
  assert.equal(hero.sourceDurationSeconds, 17.16);
  if (sourcesAvailable) {
    const source = await readFile(resolve(root, hero.source));
    assert.equal(hash(source), hero.sourceSha256, "hero source hash");
    assert.equal(source.length, hero.sourceBytes, "hero source bytes");
  }
  assert(hero.posters.alt, "Poster accessible description required");
  for (const width of [720, 1280, 1920]) {
    assert.deepEqual(hero.posters.outputs.filter(output => output.width === width).map(output => output.format).sort(), ["avif", "webp"], "Poster responsive format pair");
  }
  for (const output of hero.posters.outputs) await verifyImage(output, "hero-poster");
  assert.deepEqual(hero.video.outputs.map(output => output.width), [1920, 1280, 720]);
  for (const output of hero.video.outputs) {
    assert.equal(output.file, `/videos/customer-home/hero-${output.width}.mp4`);
    assert(output.height === Math.round(output.width * 9 / 16 / 2) * 2, "Uncropped even H264 geometry required");
    const bytes = await readFile(resolve(root, `public${output.file}`));
    assert.equal(bytes.length, output.bytes, "video derivative bytes");
    assert(bytes.length <= maxVideoBytes && bytes.length > 0, "video exceeds 6 MB budget");
    assert.equal(hash(bytes), output.sha256, "video derivative hash");
    verifyMovie(bytes, output);
    videoNames.add(output.file.split("/").at(-1));
    videos++;
  }
  assert.deepEqual(new Set(await readdir(resolve(root, "public/images/customer-home"))), imageNames, "No stale unchecked image derivatives");
  assert.deepEqual(new Set(await readdir(resolve(root, "public/videos/customer-home"))), videoNames, "No stale unchecked video derivatives");
  return { sourcesAvailable, images, videos };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log("PASS: customer homepage media", await checkCustomerHomeAssets({ requireSources: process.argv.includes("--require-sources") })); }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
