import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const repoRoot = resolve(import.meta.dirname, "..");
const prefix = "/frames/afina-agac-dal/";
const acceptedSource = "be77f66a14e418791093fe53937598204313a99f6368204f1fbf6ebaacf14171";
const sequenceBudget = 16 * 1024 * 1024;
const posterBudget = 90_000;
const desktopWebpBudget = 180_000;
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");

/** Build-time integrity gate for the one accepted Flow clip. The original
 * movie stays outside public/Git; CI verifies its pinned approval record and
 * every public derivative, rather than requiring a fresh provider download. */
export async function checkCinematicHero({ root = repoRoot } = {}) {
  const provenance = JSON.parse(await readFile(resolve(root, "lib/media/cinematic-hero.json"), "utf8"));
  assert.equal(provenance.version, 1, "Unknown cinematic media record");
  assert.equal(provenance.authorization, "user-2026-11-01-selected-cinematic-kit", "Cinematic kit authorization is required");
  assert.equal(provenance.provider, "Google Flow", "Only the accepted Google Flow media may be published");
  assert.deepEqual(provenance.source, { sha256: acceptedSource, userAccepted: true, width: 1280, height: 720 }, "The accepted source movie must not be substituted");
  assert.deepEqual(provenance.derivation, { fps: 12, widths: [1280, 960], quality: 52, toneMapping: false }, "Preserve the reviewed derivative settings and SDR source");

  const sequence = provenance.sequence;
  assert(sequence && typeof sequence === "object", "A sequence contract is required");
  assert.equal(sequence.manifest, `${prefix}manifest.json`, "Use the dedicated cinematic sequence directory");
  assert(Number.isInteger(sequence.count) && sequence.count >= 2 && sequence.count <= 9999, "Invalid cinematic frame count");
  assert.equal(sequence.fps, 12);
  assert.deepEqual(sequence.widths, [1280, 960]);
  assert.equal(sequence.aspect, 16 / 9, "Preserve the approved source geometry");
  assert.equal(sequence.poster, "poster.webp");
  const manifestBytes = await readFile(resolve(root, `public${sequence.manifest}`));
  const publicManifest = JSON.parse(manifestBytes.toString("utf8"));
  assert.deepEqual(publicManifest, {
    count: sequence.count, fps: sequence.fps, widths: sequence.widths, aspect: sequence.aspect, poster: sequence.poster,
  }, "Public sequence manifest differs from the reviewed media record");

  const expected = new Map();
  for (const width of sequence.widths) {
    for (let index = 1; index <= sequence.count; index++) {
      expected.set(`${prefix}${width}/frame-${String(index).padStart(4, "0")}.webp`, { width, height: width * 9 / 16, format: "webp", responsivePoster: false });
    }
  }
  expected.set(`${prefix}poster.webp`, { width: 1280, height: 720, format: "webp", responsivePoster: false });
  for (const format of ["webp", "avif"]) {
    // AVIF is the primary desktop request. The larger WebP fallback keeps the
    // accepted foliage detail on browsers that cannot decode AVIF.
    expected.set(`${prefix}poster-desktop.${format}`, { width: 1280, height: 720, format, posterBudget: format === "webp" ? desktopWebpBudget : posterBudget });
    expected.set(`${prefix}poster-mobile.${format}`, { width: 480, height: 720, format, posterBudget });
  }
  assert(Array.isArray(provenance.outputs), "Derivative records are required");
  assert.equal(provenance.outputs.length, expected.size, "Every frame and all five posters must be recorded");
  const seen = new Map();
  let bytes = 0;
  for (const output of provenance.outputs) {
    assert(output && typeof output === "object", "Invalid derivative record");
    const contract = expected.get(output.file);
    assert(contract, "Unexpected or unsafe cinematic derivative path");
    assert(!seen.has(output.file), "Duplicate cinematic derivative path");
    assert.equal(output.width, contract.width, "Derivative width differs from the approved geometry");
    assert.equal(output.height, contract.height, "Derivative height differs from the approved geometry");
    assert.equal(output.format, contract.format, "Derivative format differs from its fallback contract");
    assert(typeof output.sha256 === "string" && /^[a-f0-9]{64}$/.test(output.sha256), "A valid derivative hash is required");
    assert(Number.isInteger(output.bytes) && output.bytes > 0 && output.bytes <= sequenceBudget, "Invalid derivative byte size");
    const file = resolve(root, `public${output.file}`);
    assert((await lstat(file)).isFile(), "Cinematic derivatives must be regular files");
    const contents = await readFile(file);
    assert.equal(contents.length, output.bytes, "Cinematic derivative byte size changed");
    assert.equal(sha256(contents), output.sha256, "Cinematic derivative hash changed");
    bytes += contents.length;
    assert(bytes + manifestBytes.length <= sequenceBudget, "Cinematic sequence exceeds 16 MiB");
    if (contract.posterBudget) assert(contents.length <= contract.posterBudget, `Responsive cinematic poster exceeds ${contract.posterBudget / 1000} KB`);
    const image = await sharp(contents).metadata();
    assert.equal(image.width, contract.width, "Decoded image width differs from its record");
    assert.equal(image.height, contract.height, "Decoded image height differs from its record");
    const format = image.format === "heif" && image.compression === "av1" ? "avif" : image.format;
    assert.equal(format, contract.format, "Decoded image format differs from its record");
    assert(image.pages === undefined || image.pages === 1, "Each scroll frame and poster must be a static image");
    seen.set(output.file, output.sha256);
  }
  assert.equal(seen.size, expected.size, "A required cinematic derivative is missing");
  assert.equal(seen.get(`${prefix}poster.webp`), seen.get(`${prefix}1280/frame-0001.webp`), "The static sequence poster must equal the first full-size frame");
  return { checked: seen.size, bytes, frames: sequence.count };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log("PASS: accepted cinematic hero assets", await checkCinematicHero()); }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
