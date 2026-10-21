import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { Pantry } from "@/components/landing/Pantry";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Facility } from "@/components/landing/Facility";
import { Faq } from "@/components/landing/Faq";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
import { getProductFamilies } from "@/lib/catalog/static-products";

export default async function Home(): Promise<JSX.Element> {
  const families = await getProductFamilies();
  return <main>
    <BusinessJsonLd />
    <Hero product={families.find(family => family.id === "dogal-kirma")?.variants.find(variant => variant.weight === "10 kg")} />
    <Pantry families={families} />
    <TrustStrip />
    <Facility />
    <div className="page-wrap"><Faq /></div>
  </main>;
}
