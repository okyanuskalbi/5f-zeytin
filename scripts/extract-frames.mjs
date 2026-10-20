#!/usr/bin/env node
import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import sharp from "sharp";

// Usage: node scripts/extract-frames.mjs video.mp4 public/media/scene --fps 24 --widths 1920,960 --quality 72
// Layout: manifest.json, poster.webp, <width>/frame-0001.webp ... (1-based on disk).
function options(args) {
  const [video, output, ...flags] = args;
  if (!video || !output) throw new Error("Usage: extract-frames.mjs <video> <output> [--fps 24 --widths 1920,960 --quality 72]");
  const values = { fps: "24", widths: "1920,960", quality: "72" };
  for (let i = 0; i < flags.length; i += 2) {
    const key = flags[i].slice(2);
    if (!flags[i].startsWith("--") || !Object.hasOwn(values, key) || !flags[i + 1]) {
      throw new Error(`Invalid option: ${flags[i]}`);
    }
    values[key] = flags[i + 1];
  }
  const fps = Number(values.fps);
  const quality = Number(values.quality);
  const widths = values.widths.split(",").map(Number);
  if (!Number.isFinite(fps) || fps <= 0 || fps > 120
    || !Number.isInteger(quality) || quality < 1 || quality > 100
    || widths.some((width) => !Number.isInteger(width) || width < 1 || width > 7680)
    || !widths.length || new Set(widths).size !== widths.length) {
    throw new Error("Invalid fps, widths or quality.");
  }
  return { video: resolve(video), output: resolve(output), fps, quality, widths: widths.sort((a, b) => b - a) };
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data; });
    child.stderr.on("data", (data) => { stderr = (stderr + data).slice(-4000); });
    child.on("error", () => reject(new Error(`${command} unavailable; install ffmpeg and ffprobe first.`)));
    child.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(`${command} failed (${code}): ${stderr}`)));
  });
}

let staging;
try {
  const { video, output, fps, quality, widths } = options(process.argv.slice(2));
  try {
    await stat(output);
    throw new Error("Output already exists; choose a new directory to preserve the existing sequence.");
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const probe = JSON.parse(await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,sample_aspect_ratio:stream_side_data=rotation", "-of", "json", video]));
  const stream = probe.streams?.[0];
  if (!stream?.width || !stream?.height) throw new Error("No readable video stream.");
  const [sarWidth, sarHeight] = (stream.sample_aspect_ratio ?? "1:1").split(":").map(Number);
  const sar = sarWidth > 0 && sarHeight > 0 ? sarWidth / sarHeight : 1;
  let aspect = stream.width * sar / stream.height;
  const rotation = Math.abs(stream.side_data_list?.find((item) => Number.isFinite(item.rotation))?.rotation ?? 0) % 180;
  if (rotation === 90) aspect = 1 / aspect;
  await mkdir(dirname(output), { recursive: true });
  staging = await mkdtemp(join(dirname(output), `.${basename(output)}-extract-`));
  let count;
  let totalBytes = 0;
  const nativeWebP = /\blibwebp\b/.test(await run("ffmpeg", ["-hide_banner", "-encoders"]));
  for (const width of widths) {
    const directory = join(staging, String(width));
    await mkdir(directory);
    const height = Math.max(1, Math.round(width / aspect));
    const encoding = nativeWebP ? ["-c:v", "libwebp", "-quality", String(quality)] : ["-c:v", "png"];
    await run("ffmpeg", ["-v", "error", "-nostdin", "-i", video, "-map", "0:v:0", "-vf", `fps=${fps},scale=${width}:${height},setsar=1`, "-an", ...encoding, "-start_number", "1", join(directory, `frame-%04d.${nativeWebP ? "webp" : "png"}`)]);
    // Minimal ffmpeg builds may omit libwebp; keep ffmpeg extraction, encode with the existing sharp dependency.
    if (!nativeWebP) {
      for (const file of await readdir(directory)) {
        await sharp(join(directory, file)).webp({ quality }).toFile(join(directory, file.replace(/\.png$/, ".webp")));
        await rm(join(directory, file));
      }
    }
    const files = (await readdir(directory)).filter((file) => /^frame-\d{4,}\.webp$/.test(file));
    if (!files.length || (count !== undefined && count !== files.length)) throw new Error("Frame sets must have the same nonzero count.");
    count = files.length;
    const bytes = (await Promise.all(files.map(async (file) => (await stat(join(directory, file))).size))).reduce((a, b) => a + b, 0);
    totalBytes += bytes;
    if (width === 1920 && bytes > 12 * 1024 * 1024) throw new Error("1920 set exceeds 12 MB; reduce fps/quality or shorten the video.");
  }
  await copyFile(join(staging, String(widths[0]), "frame-0001.webp"), join(staging, "poster.webp"));
  totalBytes += (await stat(join(staging, "poster.webp"))).size;
  const manifest = { count, fps, widths, aspect, poster: "poster.webp" };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  if (totalBytes + Buffer.byteLength(json) > 50 * 1024 * 1024) throw new Error("Sequence exceeds 50 MB; reduce fps/quality/widths.");
  await writeFile(join(staging, "manifest.json"), json);
  await rename(staging, output);
  staging = undefined;
  process.stdout.write(`PASS: ${count} frames per set (${widths.join(", ")}), ${(totalBytes / 1024 / 1024).toFixed(2)} MB.\n`);
} catch (error) {
  process.stderr.write(`FAIL: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (staging) await rm(staging, { recursive: true, force: true });
}
