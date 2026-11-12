// Task 204-1: the eight photographs the user approved on 12 Nov 2026 (docs/tasks/204-… → Düzeltme 204-1).
// Reads the git-ignored originals, writes AVIF + WebP renditions and the two registers. No enlargement.
// node scripts/prepare-editorial-204.mjs
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = "AFINA-KAYNAK/higgsfield-2026-11-12";
const publicDirectory = "/images/editorial";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const style = "Photorealistic editorial food photography, natural warm Mediterranean light, soft golden-hour tones, color palette of deep olive green, warm ivory and champagne gold, shallow depth of field, shot on a full-frame camera with a 50mm lens, calm and appetizing, authentic and unstaged. No text, no letters, no logos, no labels, no watermarks, no brand names, no recognizable faces.";

/**
 * ratio: the frame the photograph was approved for; the crop keeps the full width and trims rows around `keep`.
 * focus: the point (percent of the cropped picture) that stays in view when a layout crops further.
 */
const specs = [
  {
    id: "hikaye-ana", ratio: [4, 5], keep: 0.62, focus: [52, 64], widths: [480, 800, 1200],
    alt: "Zeytinlikte yaşlı ve genç ellerin birlikte tuttuğu yeni toplanmış yeşil zeytinler",
    prompt: "An old gnarled olive tree in a sunlit grove in southern Turkey during harvest; in the foreground weathered hands of an elderly farmer and the smaller hands of a younger person together holding freshly picked green olives over a woven basket; rows of olive trees fading into warm haze behind.",
  },
  {
    id: "hikaye-dal", ratio: [1, 1], keep: 0.5, focus: [55, 50], widths: [240, 480],
    alt: "Çiy damlalı zeytin dalında yeşil ve mor zeytinler",
    prompt: "Extreme close-up of an olive branch heavy with plump green and a few purple-black olives, silvery-green leaves, morning dew, soft blurred olive grove background.",
  },
  {
    id: "zeytinyagi-dikey", ratio: null, keep: 0.5, focus: [62, 30], widths: [480, 720, 960],
    alt: "Cam şişeden fildişi kaseye dökülen zeytinyağı",
    prompt: "Golden extra virgin olive oil being poured in a thin glossy stream from a plain unlabeled clear glass bottle into a small ivory ceramic bowl on a rough natural stone countertop; a sprig of olive leaves and a few green olives beside it; soft out-of-focus green garden behind.",
  },
  {
    id: "zeytin-kase", ratio: null, keep: 0.5, focus: [55, 46], widths: [480, 720, 960],
    alt: "Ahşap kasede limon dilimli yeşil ve siyah zeytinler",
    prompt: "A hand-turned olive wood bowl filled with glossy green and black table olives, a few lemon slices and a sprig of thyme, on a linen cloth over a weathered wooden table; a small olive branch in the corner.",
  },
  {
    id: "zeytinyagi-yatay", ratio: [16, 9], keep: 0.5, focus: [85, 55], widths: [640, 960, 1440, 1920],
    alt: "Zeytinliğe bakan pencere önünde zeytinyağı şişesi ve yağa batırılmış ekmek",
    prompt: "A rustic wooden table by an open window overlooking an olive grove; a plain unlabeled dark green glass bottle of olive oil, a shallow dish of golden olive oil with a piece of crusty bread dipped in it, scattered olive leaves; generous empty space on the left side of the frame.",
  },
  {
    id: "blog-salamura", ratio: null, keep: 0.5, focus: [48, 15], widths: [480, 960, 1440],
    alt: "Cam kavanozdaki yeşil zeytinlerin üzerine salamura suyu dökülüyor",
    prompt: "Hands in a home kitchen preparing brined olives: fresh green olives in a large glass jar being covered with clear brine, coarse sea salt in a small bowl, lemon wedges and bay leaves on a wooden board.",
  },
  {
    id: "blog-kirma", ratio: null, keep: 0.5, focus: [65, 60], widths: [480, 960, 1440],
    alt: "Ahşap tahtada kırılmış yeşil zeytinler ve kırma taşı",
    prompt: "Freshly cracked green olives on a wooden board next to a smooth river stone used for cracking, a bowl of water with whole green olives, garlic cloves and lemon; rustic farmhouse table.",
  },
  {
    id: "blog-sofra", ratio: null, keep: 0.5, focus: [50, 55], widths: [480, 960, 1440],
    alt: "Kahvaltı sofrasında yeşil ve siyah zeytin, peynir, domates ve çay",
    prompt: "A traditional Turkish breakfast table seen from above at a slight angle: small plates of green and black olives, white cheese, tomatoes, cucumbers, a dish of olive oil, fresh simit bread and glasses of tea; warm morning light; olives are the clear focal point.",
  },
];

/** Full width, rows trimmed so `keep` (0 top … 1 bottom) of the surplus comes off the top. */
function cropFor(width, height, ratio, keep) {
  if (!ratio) return { left: 0, top: 0, width, height };
  const target = Math.round(width * ratio[1] / ratio[0]);
  if (target > height) throw new Error(`Source is not tall enough for ${ratio.join(":")}`);
  return { left: 0, top: Math.round((height - target) * keep), width, height: target };
}

const target = resolve(root, `public${publicDirectory}`);
await mkdir(target, { recursive: true });
for (const file of await readdir(target)) await rm(resolve(target, file));

const provenance = {
  version: 1,
  authorization: "user-2026-11-12-k5",
  provider: "Higgsfield",
  model: "GPT Image 2.5 Flare",
  quality: "Medium, 2K",
  sourceDirectory,
  note: "Representative editorial photographs approved by the user on 12 Nov 2026; no text, logo or face. Not documentary imagery of the facility.",
  style,
  assets: {},
};
for (const spec of specs) {
  const sourceFile = `${sourceDirectory}/${spec.id}.png`;
  const source = await readFile(resolve(root, sourceFile));
  const meta = await sharp(source).metadata();
  const crop = cropFor(meta.width, meta.height, spec.ratio, spec.keep);
  const asset = { source: sourceFile, sourceSha256: hash(source), sourceWidth: meta.width, sourceHeight: meta.height, prompt: spec.prompt, alt: spec.alt, crop, focus: spec.focus, outputs: [] };
  for (const width of spec.widths) {
    if (width > crop.width) throw new Error(`Source enlargement forbidden: ${spec.id} ${width}`);
    for (const format of ["avif", "webp"]) {
      const result = await sharp(source).extract(crop).resize({ width })[format]({ quality: format === "avif" ? 52 : 76, effort: 6 }).toBuffer({ resolveWithObject: true });
      const file = `${publicDirectory}/${spec.id}-${width}.${format}`;
      await writeFile(resolve(root, `public${file}`), result.data);
      asset.outputs.push({ file, format, width: result.info.width, height: result.info.height, bytes: result.data.length, sha256: hash(result.data) });
    }
  }
  provenance.assets[spec.id] = asset;
}
await writeFile(resolve(root, "lib/media/editorial-provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`);
const photos = {
  assets: Object.fromEntries(Object.entries(provenance.assets).map(([id, asset]) => [id, {
    alt: asset.alt,
    focus: asset.focus,
    outputs: asset.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })),
  }])),
};
await writeFile(resolve(root, "lib/media/editorial-photos.json"), `${JSON.stringify(photos, null, 2)}\n`);
const bytes = Object.values(provenance.assets).flatMap(asset => asset.outputs).reduce((sum, output) => sum + output.bytes, 0);
process.stdout.write(`PASS: ${specs.length} approved photographs, ${Object.values(provenance.assets).flatMap(asset => asset.outputs).length} renditions, ${Math.round(bytes / 1024)} KB\n`);
