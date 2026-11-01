import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { access, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { checkCinematicHero } from "./check-cinematic-hero.mjs";

// Reproduce only the accepted A→B clip, never download or generate paid media.
const root = resolve(import.meta.dirname, "..");
const directory = "public/frames/afina-agac-dal";
const prefix = "/frames/afina-agac-dal/";
const sourcePath = "output/flow-keyframes/A-B-ilk-deneme.mp4";
const acceptedHash = "be77f66a14e418791093fe53937598204313a99f6368204f1fbf6ebaacf14171";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const approval = JSON.parse(await readFile(resolve(root, "docs/referans/flow-keyframes.json"), "utf8"));
assert.equal(approval.video.userAccepted, true, "The original clip requires user acceptance");
assert.equal(approval.video.sha256, acceptedHash);
assert.equal(hash(await readFile(resolve(root, sourcePath))), acceptedHash, "Accepted original movie changed");

try { await access(resolve(root, `${directory}/manifest.json`)); }
catch {
  const extraction = spawnSync(process.execPath, ["scripts/extract-frames.mjs", sourcePath, directory,
    "--fps", "12", "--widths", "1280,960", "--quality", "52"], { cwd: root, stdio: "inherit" });
  assert.equal(extraction.status, 0, "Frame extraction failed");
}
const sequence = JSON.parse(await readFile(resolve(root, `${directory}/manifest.json`), "utf8"));
assert.equal(sequence.fps, 12);
assert.deepEqual(sequence.widths, [1280, 960]);
const poster = await readFile(resolve(root, `${directory}/poster.webp`));
for (const variant of [{ name: "desktop", width: 1280, height: 720 }, { name: "mobile", width: 480, height: 720 }]) {
  for (const format of ["avif", "webp"]) {
    const bytes = await sharp(poster).resize(variant.width, variant.height, { fit: "cover", position: "centre" })
      [format]({ quality: format === "avif" ? 35 : 42 }).toBuffer();
    await writeFile(resolve(root, `${directory}/poster-${variant.name}.${format}`), bytes);
  }
}
const files = ["poster.webp", "poster-desktop.avif", "poster-desktop.webp", "poster-mobile.avif", "poster-mobile.webp"];
for (const width of sequence.widths) {
  for (const file of (await readdir(resolve(root, `${directory}/${width}`))).sort()) files.push(`${width}/${file}`);
}
const outputs = [];
for (const file of files) {
  const bytes = await readFile(resolve(root, `${directory}/${file}`));
  const image = await sharp(bytes).metadata();
  outputs.push({ file: `${prefix}${file}`, sha256: hash(bytes), bytes: bytes.length,
    width: image.width, height: image.height, format: file.endsWith(".avif") ? "avif" : "webp" });
}
const provenance = {
  version: 1,
  authorization: "user-2026-11-01-selected-cinematic-kit",
  provider: "Google Flow",
  source: { sha256: acceptedHash, userAccepted: true, width: 1280, height: 720 },
  derivation: { fps: 12, widths: [1280, 960], quality: 52, toneMapping: false },
  sequence: { manifest: `${prefix}manifest.json`, ...sequence },
  outputs,
};
await writeFile(resolve(root, "lib/media/cinematic-hero.json"), `${JSON.stringify(provenance, null, 2)}\n`);
console.log("PASS: cinematic media prepared", await checkCinematicHero({ root }));
