// Task183: locally traced, filled silhouette of the approved black/gold A tins.
// No generative editing, color replacement, label redraw or background pixels.
// Coordinates follow the outer lip, curved body and lower gold rim at source size.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = resolve(root, "AFINA-KAYNAK/urun-gorselleri/teneke-3lt/siyah");
const evidence = resolve(root, ".cache/task-183");
const width = 1122, height = 1402;
const outline = [
  [558,149],[670,155],[755,170],[853,200],[918,240],[942,275],
  [949,295],[946,320],[943,350],[942,395],[958,450],[971,500],
  [981,550],[987,600],[990,650],[991,700],[988,750],[983,800],
  [976,850],[967,900],[955,950],[942,1000],[927,1050],[923,1080],
  [921,1105],[912,1130],[891,1155],[853,1180],[800,1201],
  [730,1220],[650,1232],[558,1238],[468,1233],[392,1220],
  [323,1202],[268,1181],[228,1157],[202,1129],[190,1102],
  [187,1074],[186,1055],[171,1000],[157,950],[145,900],[135,850],
  [128,800],[123,750],[121,700],[121,650],[125,600],[131,550],
  [141,500],[155,450],[172,400],[174,380],[172,350],[167,320],
  [164,295],[165,280],[173,260],[180,250],[190,240],[216,220],
  [253,200],[309,180],[374,165],[446,155],
];
// Closed Catmull-Rom curve, converted to cubic Beziers. This prevents polygon
// corners and keeps the solid neck connected to the lid on both dark sides.
let path = `M ${outline[0].join(" ")}`;
for (let i = 0; i < outline.length; i++) {
  const p0 = outline[(i - 1 + outline.length) % outline.length];
  const p1 = outline[i];
  const p2 = outline[(i + 1) % outline.length];
  const p3 = outline[(i + 2) % outline.length];
  const c1 = p1.map((v, axis) => v + (p2[axis] - p0[axis]) / 6);
  const c2 = p2.map((v, axis) => v - (p3[axis] - p1[axis]) / 6);
  path += ` C ${c1.join(" ")} ${c2.join(" ")} ${p2.join(" ")}`;
}
path += " Z";
const svg = Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}" fill="white"/></svg>`);
// Render at 4x, then downsample to retain a narrow, smooth alpha transition.
const mask = await sharp(svg, { density: 288 }).resize(width, height).ensureAlpha().extractChannel(3).png().toBuffer();
const alpha = await sharp(mask).greyscale().raw().toBuffer();
await mkdir(resolve(directory, "dekupe"), { recursive: true });
await mkdir(evidence, { recursive: true });
for (const name of ["dogal-kirma-yesil-3lt", "salamura-yesil-3lt"]) {
  const source = await readFile(resolve(directory, `A-${name}.png`));
  const meta = await sharp(source).metadata();
  if (meta.width !== width || meta.height !== height) throw new Error("Approved tin dimensions changed");
  const rgb = await sharp(source).removeAlpha().raw().toBuffer();
  const cutout = await sharp(rgb, { raw: { width, height, channels: 3 } }).joinChannel(alpha, { raw: { width, height, channels: 1 } }).png().toBuffer();
  await writeFile(resolve(root, `scripts/masks/task183-${name}.png`), mask);
  await writeFile(resolve(directory, `dekupe/A-${name}.png`), cutout);
  for (const [label, background] of [["cream", "#F7F4ED"], ["white", "#FFFFFF"]]) {
    const composite = await sharp({ create: { width, height, channels: 4, background } }).composite([{ input: cutout }]).png().toBuffer();
    await writeFile(resolve(evidence, `${name}-cutout-${label}.png`), composite);
    await sharp(composite).resize(width * 2, height * 2).png().toFile(resolve(evidence, `${name}-cutout-${label}-2x.png`));
  }
  console.log(`${name}: ${createHash("sha256").update(cutout).digest("hex")}; shadowBaseline=1238`);
}
