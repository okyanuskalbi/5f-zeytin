import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { Facility } from "@/components/landing/Facility";
import { SceneFlow } from "@/components/landing/SceneFlow";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getProducts } from "@/lib/catalog/static-products";

export default async function Home(): Promise<JSX.Element> {
  const products = (await getProducts()).slice(0, 6);
  return (
    <main>
      <SceneFlow>
        <div data-scene="hero"><Hero /></div>
        <div className="page-wrap">
          <section
            id="hikayemiz"
            data-scene="story"
            aria-labelledby="hikayemiz-title"
            tabIndex={-1}
            className="scroll-mt-36 py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:py-16"
          >
            <div data-scene-reveal="" className="grid gap-6 motion-reduce:transform-none lg:grid-cols-2 lg:gap-12">
              <div>
                <h2 id="hikayemiz-title">Hikâyemiz</h2>
              </div>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin ve zeytinyağını doğallığına önem veren bir anlayışla sunuyor; ürünlerini toptan ve perakende kanallarda müşterileriyle buluşturuyor.
              </p>
            </div>
            <Facility />
          </section>
          <section
            id="urunler"
            data-scene="products"
            aria-labelledby="urunler-title"
            tabIndex={-1}
            className="scroll-mt-36 py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:py-16"
          >
            <div data-scene-reveal="" className="motion-reduce:transform-none">
              <h2 id="urunler-title">Ürünlerimiz</h2>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.length === 0 ? <ProductCard product={null} /> : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
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
