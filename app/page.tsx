import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { Products } from "@/components/landing/Products";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Story } from "@/components/landing/Story";
import { HeroBand } from "@/components/landing/HeroBand";
import { WholesaleFaq } from "@/components/landing/WholesaleFaq";
import { MobileBuyBar } from "@/components/landing/MobileBuyBar";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
import { getProductFamilies } from "@/lib/catalog/static-products";

export default async function Home(): Promise<JSX.Element> {
  const families = await getProductFamilies();
  return <main>
    <BusinessJsonLd />
    <Hero products={families.find(family => family.id === "dogal-kirma")?.variants} />
    <TrustStrip />
    <Products products={families.flatMap(family => family.variants)} />
    <Story />
    <HeroBand products={families.find(family => family.id === "dogal-kirma")?.variants ?? []} />
    <WholesaleFaq />
    <MobileBuyBar product={families.find(family => family.id === "dogal-kirma")?.variants.find(product => product.id === "sample-green-olive-10kg")} />
  </main>;
}
