import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { Products } from "@/components/landing/Products";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Story } from "@/components/landing/Story";
import { HeroBand } from "@/components/landing/HeroBand";
import { WholesaleContact } from "@/components/landing/WholesaleContact";
import { Faq } from "@/components/landing/Faq";
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
    <WholesaleContact preserveAnchor />
    <div className="page-wrap"><Faq /></div>
  </main>;
}
