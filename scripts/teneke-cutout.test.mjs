import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const manifest = JSON.parse(await readFile("public/images/v3/manifest.json", "utf8"));
const tins = Object.entries(manifest.assets).filter(([id]) => /^(urun-0[16]-|0[16]-)/.test(id));

// Task183 baseline: all product/studio/scene bytes for the four untouched SKUs.
const unchangedProducts = {
  "02": "3a1d3f55f08bbb2bb38cfc82b9b7773434d0704d4ee7c857c68ee6be4188241a",
  "03": "b3469abcc35ca688090b8abb3d3e7a09e8d0bdda59ef289184286565d3046d28",
  "04": "a315ba9bc8a10ccf2b588d68bef3cb3fabf03d223eeb80b94d12c77420e794f4",
  "05": "d53774118b48bee3c7c5e5e3f3b2599e985eaa031aa9917cb516e4d48adec62a",
};
for (const [number, expected] of Object.entries(unchangedProducts)) {
  test(`product ${number}: all twelve derivatives remain byte-identical`, async () => {
    const outputs = Object.entries(manifest.assets)
      .filter(([id]) => new RegExp(`^(urun-${number}-|${number}-)`).test(id))
      .flatMap(([, asset]) => asset.outputs)
      .sort((a, b) => a.file.localeCompare(b.file));
    assert.equal(outputs.length, 12);
    const hash = createHash("sha256");
    for (const { file } of outputs) {
      hash.update(file);
      hash.update(await readFile(`public${file}`));
    }
    assert.equal(hash.digest("hex"), expected);
  });
}

assert.equal(tins.length, 6, "Both product, studio and scene keys must remain available");
for (const [id, asset] of tins) {
  test(`${id}: uses the approved black-and-gold A cutout`, () => {
    const source = /^(urun-01-|01-)/.test(id) ? "A-dogal-kirma-yesil-3lt.png" : "A-salamura-yesil-3lt.png";
    assert.equal(asset.source, `urun-gorselleri/teneke-3lt/siyah/dekupe/${source}`);
    assert.equal(asset.sourceWidth, 1122);
    assert.equal(asset.sourceHeight, 1402);
  });

  test(`${id}: every size retains an opaque black body without the studio background`, async () => {
    for (const output of asset.outputs) {
      const { data, info } = await sharp(`public${output.file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const pixel = (x, y) => {
        const offset = (Math.min(info.height - 1, Math.floor(y * info.height)) * info.width + Math.min(info.width - 1, Math.floor(x * info.width))) * 4;
        return [...data.subarray(offset, offset + 4)];
      };
      const name = output.file;
      assert.equal(pixel(0.5, 0.5)[3], 255, `${name}: label must stay opaque`);
      for (const [x, y] of [[0.5, 0.36], [0.3, 0.68], [0.7, 0.68]]) {
        const [red, green, blue, alpha] = pixel(x, y);
        assert.equal(alpha, 255, `${name}: body must stay opaque`);
        assert(Math.max(red, green, blue) < 90, `${name}: approved matte black body was replaced`);
      }
      for (const [x, y] of [[0, 0], [0.999, 0], [0, 0.999], [0.999, 0.999], [0.2, 0.12], [0.8, 0.12], [0.07, 0.4], [0.93, 0.4], [0.07, 0.7], [0.93, 0.7]]) {
        assert(pixel(x, y)[3] <= 3, `${name}: dark studio remnants outside rounded silhouette at ${x},${y}`);
      }
      let softShadowPixels = 0;
      for (let y = Math.ceil(info.height * 0.9); y < Math.floor(info.height * 0.97); y++) {
        for (let x = Math.ceil(info.width * 0.3); x < Math.floor(info.width * 0.7); x++) {
          const alpha = data[(y * info.width + x) * 4 + 3];
          assert(alpha < 100, `${name}: opaque old ground remains below tin`);
          if (alpha > 0) softShadowPixels++;
        }
      }
      assert(softShadowPixels > 0, `${name}: soft ground shadow was lost`);
    }
  });
}
