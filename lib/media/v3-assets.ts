import manifest from "./v4-assets.json" with { type: "json" };

export type V3Image = Readonly<{
  alt: string;
  /** Percent of the picture that must stay in view when a frame crops it (x, y). */
  focus?: readonly number[];
  outputs: readonly Readonly<{ file: string; format: string; width: number; height: number }>[];
}>;

export function v3Image(key: string): V3Image {
  const image = manifest.assets[key as keyof typeof manifest.assets];
  if (!image) throw new Error(`V3 görsel anahtarı bulunamadı: ${key}`);
  return { alt: image.alt, outputs: image.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })) };
}
