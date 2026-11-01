import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
// @ts-expect-error Standalone build-time Node ESM asset guard.
import { checkCinematicFilm } from "../../scripts/check-cinematic-film.mjs";

const sourceHash = "be77f66a14e418791093fe53937598204313a99f6368204f1fbf6ebaacf14171";
const directories: string[] = [];
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
function atom(type: string, payload = Buffer.alloc(0)): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length);
  header.write(type, 4, "ascii");
  return Buffer.concat([header, payload]);
}
const ftyp = atom("ftyp", Buffer.from("isom\0\0\0\0isomiso2avc1mp41", "binary"));
const moov = atom("moov", Buffer.from("reviewed metadata"));
const mdat = atom("mdat", Buffer.from("reviewed video"));

async function fixture(bytes = Buffer.concat([ftyp, moov, mdat])) {
  const base = join(process.cwd(), ".cache/task-159-film-tests");
  await mkdir(base, { recursive: true });
  const root = await mkdtemp(join(base, "afina-film-"));
  directories.push(root);
  for (const directory of ["lib/media", "public/videos", "docs/referans"]) await mkdir(join(root, directory), { recursive: true });
  const manifest = {
    version: 1, authorization: "user-2026-11-01-cinematic-flow-hero-request", provider: "Google Flow",
    source: { file: "output/flow-keyframes/A-B-ilk-deneme.mp4", sha256: sourceHash, userAccepted: true,
      width: 1280, height: 720, fps: 24, videoFrames: 190, videoDurationSeconds: 190 / 24, containerDurationSeconds: 7.93 },
    derivation: { codec: "h264", pixelFormat: "yuv420p", crf: 27, preset: "slow", audio: false,
      fastStart: true, crop: false, toneMapping: false },
    output: { file: "/videos/afina-agac-dal.mp4", sha256: hash(bytes), bytes: bytes.length,
      width: 1280, height: 720, fps: 24, frames: 190, durationSeconds: 190 / 24 },
  };
  const approval = { video: { file: "A-B-ilk-deneme.mp4", sha256: sourceHash, userAccepted: true, provider: "Google Flow", transition: "A→B" } };
  await writeFile(join(root, "public/videos/afina-agac-dal.mp4"), bytes);
  await writeFile(join(root, "lib/media/cinematic-film.json"), JSON.stringify(manifest));
  await writeFile(join(root, "docs/referans/flow-keyframes.json"), JSON.stringify(approval));
  return { root, manifest, approval };
}
async function saveManifest(root: string, manifest: object) {
  await writeFile(join(root, "lib/media/cinematic-film.json"), JSON.stringify(manifest));
}
afterEach(async () => { await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true }))); });

it("accepts a pinned silent derivative with startup metadata before its media", async () => {
  const { root } = await fixture();
  await expect(checkCinematicFilm({ root })).resolves.toMatchObject({ checked: 1, fastStart: true, frames: 190 });
});
it("rejects source substitution even when the output manifest claims acceptance", async () => {
  const { root, manifest } = await fixture();
  manifest.source.sha256 = "a".repeat(64);
  await saveManifest(root, manifest);
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/source|accepted|onay/i);
});
it("requires the existing clip approval instead of trusting only the new manifest", async () => {
  const { root, approval } = await fixture();
  approval.video.userAccepted = false;
  await writeFile(join(root, "docs/referans/flow-keyframes.json"), JSON.stringify(approval));
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/accepted|approval|onay/i);
});
it("rejects changed video bytes without needing the ignored original in CI", async () => {
  const { root } = await fixture();
  const file = join(root, "public/videos/afina-agac-dal.mp4");
  const bytes = await readFile(file); bytes[bytes.length - 1] ^= 1;
  await writeFile(file, bytes);
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/hash/i);
});
it.each(["/videos/../private.mp4", "https://example.test/movie.mp4", "/videos/other.mp4"])("rejects the unexpected video path %s", async file => {
  const { root, manifest } = await fixture(); manifest.output.file = file;
  await saveManifest(root, manifest);
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/path|destination/i);
});
it("rejects an oversized derivative before loading it", async () => {
  const { root, manifest } = await fixture(); manifest.output.bytes = 5 * 1024 * 1024 + 1;
  await saveManifest(root, manifest);
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/size|budget|MiB/i);
});
it("requires moov before mdat for progressive browser playback", async () => {
  const { root } = await fixture(Buffer.concat([ftyp, mdat, moov]));
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/fast.?start|moov/i);
});
it("rejects a truncated MP4 atom despite a matching manifest hash", async () => {
  const { root } = await fixture(Buffer.concat([ftyp, moov, mdat.subarray(0, mdat.length - 1)]));
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/atom|box|truncat|MP4/i);
});
it("rejects a non-MP4 file despite a matching extension and hash", async () => {
  const { root } = await fixture(Buffer.from("not an MP4 movie"));
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/ftyp|atom|box|MP4/i);
});
it("rejects altered geometry or shortened visual duration", async () => {
  const { root, manifest } = await fixture(); manifest.output.width = 960;
  await saveManifest(root, manifest);
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/geometry|width/i);
  manifest.output.width = 1280; manifest.output.durationSeconds = 4;
  await saveManifest(root, manifest);
  await expect(checkCinematicFilm({ root })).rejects.toThrow(/duration|full/i);
});
