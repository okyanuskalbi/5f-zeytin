import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function runtimeAssets(manifest) {
  return { assets: Object.fromEntries(Object.entries(manifest.assets)
    .filter(([key]) => /^(?:hero-|urun-|\d{2}-)/.test(key))
    .map(([key, image]) => [key, { alt: image.alt, outputs: image.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })) }])) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(import.meta.dirname, "..");
  const manifest = JSON.parse(await readFile(resolve(root, "public/images/v3/manifest.json"), "utf8"));
  await writeFile(resolve(root, "lib/media/v4-assets.json"), JSON.stringify(runtimeAssets(manifest), null, 2) + "\n");
}
