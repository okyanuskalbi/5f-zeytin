import { getImageProps } from "next/image";

// Same approved photograph. scripts/optimize-hero.mjs records source/output hashes.
const source = { src: "/images/hero/zeytinlik-2400.webp", alt: "", width: 2400, height: 1350, sizes: "100vw" };
export const heroPoster = {
  ...source,
  srcSet: getImageProps(source).props.srcSet!,
  // The portrait keeps the right-hand crop at its original pixel density.
  mobileSrcSet: "/images/hero/optimized/mobile.avif 900w",
  mobileWebpSrcSet: "/images/hero/optimized/mobile.webp 900w",
  desktopSrcSet: "/images/hero/optimized/desktop.avif 2400w",
  desktopWebpSrcSet: "/images/hero/optimized/desktop.webp 2400w",
};
