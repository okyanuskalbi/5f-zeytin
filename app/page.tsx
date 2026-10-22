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
    <Hero products={families.find(family => family.id === "dogal-kirma")?.variants} />
    <TrustStrip />
    <Pantry families={families} />
    <Facility />
    <div className="page-wrap"><Faq /></div>
  </main>;
}
