import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { alphaBounds, approvedSource, encodeV3Output, sha256 } from "./prepare-v3-assets.mjs";
import { formats, specs } from "./v3-asset-specs.mjs";

export function runtimeAssets(manifest) {
  return { assets: Object.fromEntries(Object.entries(manifest.assets)
    .filter(([key]) => /^(?:hero-|urun-|\d{2}-)/.test(key))
    .map(([key, image]) => [key, { alt: image.alt, outputs: image.outputs
      // Card-only derivatives stay out of manifests imported by client cart components.
      .filter(output => key !== "urun-01-kirma-10kg" || !/-w\d+\./.test(output.file))
      .map(({ file, format, width, height }) => ({ file, format, width, height })) }])) };
}

export function heroCardAsset(manifest) {
  const image = manifest.assets["urun-01-kirma-10kg"];
  return { alt: image.alt, outputs: image.outputs.filter(output => /-w\d+\./.test(output.file))
    .map(({ file, format, width, height }) => ({ file, format, width, height })) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(import.meta.dirname, "..");
  const manifest = JSON.parse(await readFile(resolve(root, "public/images/v3/manifest.json"), "utf8"));
  // Add only card-sized derivatives. Existing hero and catalogue files stay byte-identical.
  const spec = specs.find(spec => spec.id === "urun-01-kirma-10kg");
  const source = await approvedSource(spec);
  const asset = manifest.assets[spec.id];
  assert.equal(sha256(source), asset.sourceSha256, "Hero kartı onaylı kaynaktan türetilmeli");
  const crop = await alphaBounds(source, spec.threshold);
  assert.deepEqual(crop, asset.crop, "Hero kartının kırpımı korunmalı");
  const outputs = [];
  for (const width of spec.widths) for (const format of formats) {
    const output = await encodeV3Output(source, spec, crop, { width }, format);
    const file = `/images/v3/${spec.id}-w${width}.${format}`;
    await writeFile(resolve(root, `public${file}`), output.data);
    outputs.push({ file, format, width: output.info.width, height: output.info.height, bytes: output.data.length, sha256: sha256(output.data), quality: output.quality });
  }
  asset.outputs = [...asset.outputs.filter(output => !outputs.some(added => added.file === output.file)), ...outputs];
  await writeFile(resolve(root, "public/images/v3/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(resolve(root, "lib/media/v4-assets.json"), JSON.stringify(runtimeAssets(manifest), null, 2) + "\n");
  await writeFile(resolve(root, "lib/media/hero-card-asset.json"), JSON.stringify(heroCardAsset(manifest), null, 2) + "\n");
  console.log(`PASS: ${outputs.length} onaylı hero kartı türevi ve runtime manifest hazır.`);
}
