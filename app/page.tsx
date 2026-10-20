import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { Facility } from "@/components/landing/Facility";
import { Moments } from "@/components/landing/Moments";
import { Faq } from "@/components/landing/Faq";
import { WholesaleContact } from "@/components/landing/WholesaleContact";
import { WholesaleForm } from "@/components/landing/WholesaleForm";
import { SceneFlow } from "@/components/landing/SceneFlow";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { getProducts } from "@/lib/catalog/static-products";

export default async function Home(): Promise<JSX.Element> {
  const products = (await getProducts()).slice(0, 6);
  return (
    <main>
      <SceneFlow>
        <div data-scene="hero"><Hero products={products} /></div>
        <ProductShowcase products={products} />
        <div className="page-wrap">
          <div
            id="hikayemiz"
            data-scene="story"
            className="scroll-mt-36"
          >
            <Facility />
          </div>
          <Moments />
          <Faq />
        </div>
        <WholesaleContact><WholesaleForm /></WholesaleContact>
      </SceneFlow>
    </main>
  );
}
