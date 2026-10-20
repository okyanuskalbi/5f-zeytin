import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { Facility } from "@/components/landing/Facility";
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
          <section
            id="toptan-iletisim"
            data-scene="wholesale"
            aria-labelledby="toptan-title"
            tabIndex={-1}
            className="scroll-mt-36 py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:py-16"
          >
            {/* The wholesale form belongs to Task 081. */}
            <div data-scene-reveal="" className="motion-reduce:transform-none">
              <h2 id="toptan-title">Toptan satış</h2>
              <p className="mt-4 max-w-xl text-muted-foreground">Toptan talep formu henüz kullanıma açık değil.</p>
            </div>
          </section>
        </div>
      </SceneFlow>
    </main>
  );
}
