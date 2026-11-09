import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = "AFINA-KAYNAK/tasarim/klasik-anasayfa-c/fotograflar";
const provenance = JSON.parse(await readFile(resolve(root, sourceDirectory, "uretim.json"), "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const specs = [
  { id: "hero", widths: [640, 960, 1440, 1880], alt: "Ahşap kasede siyah zeytinler, zeytinyağı ve zeytin dalı" },
  { id: "hero-mobile", widths: [640, 960], alt: "Zeytinlik önünde siyah zeytin kasesi ve zeytinyağı" },
  { id: "siyah-zeytin", widths: [400, 800], alt: "Ahşap kasede siyah zeytin" },
  { id: "yesil-zeytin", widths: [400, 800], alt: "Ahşap kasede yeşil zeytin" },
  { id: "kirma-zeytin", widths: [400, 800], alt: "Ahşap kasede doğal kırma yeşil zeytin" },
  { id: "zeytinyagi", widths: [400, 800], alt: "Cam şişede zeytinyağı ve zeytin dalı" },
  { id: "depo", widths: [400, 800], alt: "Koliler ve forklift ile temsili toptan sevkiyat görünümü" },
  { id: "zeytin-dali", widths: [400, 800], alt: "Güneş ışığında yeşil zeytin dalı" },
  { id: "zeytinlik", widths: [960, 1440, 1880], alt: "Güneş ışığında zeytinlik" },
];

await mkdir(resolve(root, "public/images/klasik"), { recursive: true });
const manifest = {
  version: 1,
  authorization: "task-184-classic-home-original-photography",
  provider: "built-in image_gen",
  paidApi: false,
  note: "Original generated editorial food photography; not documentary facility imagery. The real facility uses its existing approved asset separately.",
  assets: {},
};
for (const spec of specs) {
  const sourceFile = `${sourceDirectory}/${spec.id}.png`;
  const source = await readFile(resolve(root, sourceFile));
  const meta = await sharp(source).metadata();
  const asset = {
    source: sourceFile,
    sourceSha256: hash(source),
    sourceWidth: meta.width,
    sourceHeight: meta.height,
    prompt: provenance.assets[spec.id].prompt,
    alt: spec.alt,
    outputs: [],
  };
  for (const width of spec.widths) {
    if (width > meta.width) throw new Error(`Source enlargement forbidden: ${spec.id} ${width}`);
    for (const format of ["avif", "webp"]) {
      const quality = format === "avif" ? 52 : 76;
      const result = await sharp(source).resize({ width, withoutEnlargement: true })[format]({ quality, effort: 6 }).toBuffer({ resolveWithObject: true });
      const file = `/images/klasik/${spec.id}-${width}.${format}`;
      await writeFile(resolve(root, `public${file}`), result.data);
      asset.outputs.push({ file, format, width: result.info.width, height: result.info.height, bytes: result.data.length, sha256: hash(result.data) });
    }
  }
  manifest.assets[spec.id] = asset;
}
await writeFile(resolve(root, "lib/media/classic-home.json"), `${JSON.stringify(manifest, null, 2)}\n`);
const photos = {
  assets: Object.fromEntries(Object.entries(manifest.assets).map(([id, asset]) => [id, {
    alt: asset.alt,
    outputs: asset.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })),
  }])),
};
await writeFile(resolve(root, "lib/media/classic-photos.json"), `${JSON.stringify(photos, null, 2)}\n`);
console.log(`PASS: ${specs.length} classic photography assets prepared without enlargement`);
