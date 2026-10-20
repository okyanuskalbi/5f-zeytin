import type { JSX } from "react";
import { preload } from "react-dom";
import { HeroLabel } from "@/components/landing/HeroLabel";
import type { Product } from "@/types/catalog";
import { heroPoster } from "@/lib/media/hero-poster";

export function Hero({ products }: { products: readonly Product[] }): JSX.Element {
  preload(heroPoster.mobileSrcSet.split(" ")[0], { as: "image", type: "image/avif", media: "(max-width: 767px) and (orientation: portrait)", imageSrcSet: heroPoster.mobileSrcSet, imageSizes: "100vw", fetchPriority: "high" });
  preload(heroPoster.desktopSrcSet.split(" ")[0], { as: "image", type: "image/avif", media: "(min-width: 768px), (orientation: landscape)", imageSrcSet: heroPoster.desktopSrcSet, imageSizes: "100vw", fetchPriority: "high" });
  return <HeroLabel products={products} />;
}
