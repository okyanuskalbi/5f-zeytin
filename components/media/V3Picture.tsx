import type { JSX } from "react";
import type { V3Image } from "@/lib/media/v3-assets";

export function V3Picture({ image, mobile, mobileMedia = "(max-width: 767px)", sizes, className, eager = false, decorative = false }: {
  image: V3Image; mobile?: V3Image; mobileMedia?: string; sizes: string; className?: string; eager?: boolean; decorative?: boolean;
}): JSX.Element {
  const fallback = image.outputs.filter(output => output.format === "webp")[0];
  const srcSet = (asset: V3Image, format: string): string => asset.outputs.filter(output => output.format === format).map(output => `${output.file} ${output.width}w`).join(", ");
  return <picture className={className}>
    {mobile && <>
      <source media={mobileMedia} type="image/avif" srcSet={srcSet(mobile, "avif")} sizes={sizes} />
      <source media={mobileMedia} type="image/webp" srcSet={srcSet(mobile, "webp")} sizes={sizes} />
    </>}
    <source type="image/avif" srcSet={srcSet(image, "avif")} sizes={sizes} />
    {/* Pre-encoded srcsets preserve exact byte budgets and alpha. */}
    <img src={fallback.file} srcSet={srcSet(image, "webp")} sizes={sizes} alt={decorative ? "" : image.alt}
      width={fallback.width} height={fallback.height} loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"} decoding="async" />
  </picture>;
}
