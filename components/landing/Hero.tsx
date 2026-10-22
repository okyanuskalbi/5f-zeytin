import type { JSX } from "react";
import type { Product } from "@/types/catalog";
import { V3Picture } from "@/components/media/V3Picture";
import { v3Image } from "@/lib/media/v3-assets";
import { SofraHero } from "./SofraHero";

/** Keep the art-directed LCP image and its media-matched preload in the SSR. */
export function Hero({ products }: { products?: readonly Product[] }): JSX.Element {
  const desktop = v3Image("hero-masaustu");
  const mobile = v3Image("hero-mobil");
  return <>
    {[mobile, desktop].map((image, index) => <link key={index} rel="preload" as="image" type="image/avif"
      media={index === 0 ? "(max-width: 900px)" : "(min-width: 901px)"}
      imageSrcSet={image.outputs.filter(output => output.format === "avif").map(output => `${output.file} ${output.width}w`).join(", ")}
      imageSizes="100vw" fetchPriority="high" />)}
    <SofraHero products={products} productImage={<V3Picture image={v3Image("urun-01-kirma-10kg")} sizes="(max-width: 900px) 72px, 96px" decorative />}>
      <V3Picture image={desktop} mobile={mobile} mobileMedia="(max-width: 900px)" sizes="100vw" eager decorative />
    </SofraHero>
  </>;
}
