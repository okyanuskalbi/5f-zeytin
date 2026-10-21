import manifest from "@/public/images/v3/manifest.json";

export type V3Image = Readonly<{
  alt: string;
  outputs: readonly Readonly<{ file: string; format: string; width: number; height: number }>[];
}>;

export function v3Image(key: string): V3Image {
  const image = manifest.assets[key as keyof typeof manifest.assets];
  if (!image) throw new Error(`V3 görsel anahtarı bulunamadı: ${key}`);
  return { alt: image.alt, outputs: image.outputs.map(({ file, format, width, height }) => ({ file, format, width, height })) };
}
