import type { JSX } from "react";
import { preload } from "react-dom";
import localFont from "next/font/local";
import { HeroIntro } from "@/components/landing/HeroIntro";
import type { Product } from "@/types/catalog";
import { heroPoster } from "@/lib/media/hero-poster";

// Same Fraunces outline/metrics/axes, limited to the fixed headline glyphs.
// The complete normal/italic faces remain available to the rest of the site.
const FrauncesHero = localFont({
  src: "../../app/fonts/Fraunces-hero.woff2",
  weight: "500 700",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-hero",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export function Hero({ products }: { products: readonly Product[] }): JSX.Element {
  preload(heroPoster.mobileSrcSet.split(" ")[0], { as: "image", type: "image/avif", media: "(max-width: 767px) and (orientation: portrait)", imageSrcSet: heroPoster.mobileSrcSet, imageSizes: "100vw", fetchPriority: "high" });
  preload(heroPoster.desktopSrcSet.split(" ")[0], { as: "image", type: "image/avif", media: "(min-width: 768px), (orientation: landscape)", imageSrcSet: heroPoster.desktopSrcSet, imageSizes: "100vw", fetchPriority: "high" });
  return <HeroIntro products={products} className={FrauncesHero.variable} />;
}
