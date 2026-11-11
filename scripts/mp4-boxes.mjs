import assert from "node:assert/strict";

/** Top-level MP4 boxes establish progressive startup without requiring ffprobe
 * on the deployment builder. Geometry/streams were probed before the reviewed
 * artifact hash was recorded; CI checks that exact derivative remains intact. */
export function movieBoxes(bytes) {
  const boxes = [];
  let offset = 0;
  while (offset < bytes.length) {
    assert(offset + 8 <= bytes.length, "Truncated MP4 atom header");
    let size = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      assert(offset + 16 <= bytes.length, "Truncated large MP4 atom header");
      const largeSize = bytes.readBigUInt64BE(offset + 8);
      assert(largeSize <= BigInt(Number.MAX_SAFE_INTEGER), "MP4 atom is too large");
      size = Number(largeSize);
      header = 16;
    } else if (size === 0) size = bytes.length - offset;
    assert(size >= header && offset + size <= bytes.length, "Invalid or truncated MP4 atom size");
    boxes.push({ type, offset, size, header });
    offset += size;
  }
  assert(boxes[0]?.type === "ftyp" && boxes[0].size >= 16, "MP4 ftyp box is required first");
  const brand = bytes.toString("ascii", boxes[0].offset + boxes[0].header, boxes[0].offset + boxes[0].header + 4);
  assert(["isom", "iso2", "mp41", "mp42", "avc1"].includes(brand), "Unsupported MP4 ftyp brand");
  const moov = boxes.find(box => box.type === "moov");
  const mdat = boxes.find(box => box.type === "mdat");
  assert(moov && mdat && moov.size > moov.header && mdat.size > mdat.header, "MP4 moov and mdat boxes are required");
  assert(moov.offset < mdat.offset, "Fast-start MP4 requires moov before mdat");
  return boxes;
}
