import type { JSX } from "react";
import type { Product } from "@/types/catalog";
import { V3Picture } from "@/components/media/V3Picture";
import layers from "@/lib/media/hero-layers.json";
import product from "@/lib/media/hero-card-asset.json";
import { SofraHero } from "./SofraHero";

/** Keep the art-directed LCP image and its media-matched preload in the SSR. */
export function Hero({ products }: { products?: readonly Product[] }): JSX.Element {
  const desktop = layers.assets["arka-masaustu"];
  const mobile = layers.assets["arka-mobil"];
  const cardMobile = { ...product, outputs: product.outputs.filter(output => [72, 144, 216].includes(output.width)) };
  const cardDesktop = { ...product, outputs: product.outputs.filter(output => [96, 192, 288].includes(output.width)) };
  const cardSizes = "(max-width: 900px) 72px, 96px";
  return <>
    {[{ images: [mobile, desktop], sizes: "100vw" }, { images: [cardMobile, cardDesktop], sizes: cardSizes }].flatMap(({ images, sizes }, group) => images.map((image, index) => <link key={`${group}-${index}`} rel="preload" as="image" type="image/avif"
      media={index === 0 ? "(max-width: 900px)" : "(min-width: 901px)"}
      imageSrcSet={image.outputs.filter(output => output.format === "avif").map(output => `${output.file} ${output.width}w`).join(", ")}
      imageSizes={sizes} fetchPriority="high" />))}
    <SofraHero products={products} productImage={<V3Picture image={cardDesktop} mobile={cardMobile} mobileMedia="(max-width: 900px)" sizes={cardSizes} eager decorative />}>
      <V3Picture image={desktop} mobile={mobile} mobileMedia="(max-width: 900px)" sizes="100vw" eager decorative />
    </SofraHero>
  </>;
}
