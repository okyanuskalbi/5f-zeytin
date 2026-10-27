import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Format/size derivatives of the approved SVG; no new artwork.
const source = await readFile(new URL("../public/brand/favicon.svg", import.meta.url));
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(source, { density: 288 }).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2); // ICO image type
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (const [index, size] of sizes.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(images[index].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
}
await writeFile(new URL("../app/favicon.ico", import.meta.url), Buffer.concat([directory, ...images]));
await sharp(source, { density: 288 }).resize(180, 180).png().toFile(new URL("../app/apple-icon.png", import.meta.url).pathname);
