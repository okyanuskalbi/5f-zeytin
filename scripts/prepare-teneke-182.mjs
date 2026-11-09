// Historical command name: rebuild only the six active tin keys (Task182/183).
// Other products stay byte-identical.
import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { approvedSource, encodeV3Output, repoRoot, sha256, sourceDirectories } from "./prepare-v3-assets.mjs";
import { approvals, formats, outputDimensions, specs } from "./v3-asset-specs.mjs";
import { runtimeAssets, heroCardAsset } from "./prepare-v4-assets.mjs";
const path = resolve(repoRoot, "public/images/v3/manifest.json");
const manifest = JSON.parse(await readFile(path, "utf8"));
for (const spec of specs.filter(spec => spec.group === "teneke182" || spec.group === "teneke183")) {
  const source = await approvedSource(spec);
  const meta = await sharp(source).metadata();
  const previous = manifest.assets[spec.id];
  const entry = { source: `${sourceDirectories[spec.group]}/${spec.source}`, sourceSha256: sha256(source), approval: approvals[spec.group].file, alt: spec.alt, sourceWidth: meta.width, sourceHeight: meta.height, crop: null, alphaThreshold: null, outputs: [] };
  for (const dimensions of outputDimensions(spec)) for (const format of formats) {
    if (dimensions.width > meta.width || dimensions.height > meta.height) throw new Error("Source enlargement forbidden");
    const output = await encodeV3Output(source, spec, null, dimensions, format);
    const file = `/images/v3/${spec.id}-${dimensions.height ? "h" : "w"}${dimensions.height ?? dimensions.width}.${format}`;
    await writeFile(resolve(repoRoot, `public${file}`), output.data);
    entry.outputs.push({ file, format, width: output.info.width, height: output.info.height, bytes: output.data.length, sha256: sha256(output.data), quality: output.quality });
  }
  for (const old of previous.outputs) if (!entry.outputs.some(output => output.file === old.file)) await unlink(resolve(repoRoot, `public${old.file}`));
  manifest.assets[spec.id] = entry;
}
await writeFile(path, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(resolve(repoRoot, "lib/media/v4-assets.json"), JSON.stringify(runtimeAssets(manifest), null, 2) + "\n");
await writeFile(resolve(repoRoot, "lib/media/hero-card-asset.json"), JSON.stringify(heroCardAsset(manifest), null, 2) + "\n");
console.log("PASS: Active approved tin sources rebuilt without enlargement");
