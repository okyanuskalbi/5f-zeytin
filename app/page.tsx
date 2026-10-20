import type { JSX } from "react";
import { Hero } from "@/components/landing/Hero";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getProducts } from "@/lib/catalog/static-products";

export default async function Home(): Promise<JSX.Element> {
  const products = await getProducts();
  return (
    <main>
      <Hero />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* The wholesale form belongs to Task 081. */}
        <section
          id="urunler"
          aria-labelledby="urunler-title"
          tabIndex={-1}
          className="scroll-mt-36 border-t border-border py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:py-16"
        >
          <p className="mb-3 text-xs font-medium tracking-widest text-gold-ink">PERAKENDE</p>
          <h2 id="urunler-title">Ürünlerimiz</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? <ProductCard product={null} /> : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <section
          id="toptan-iletisim"
          aria-labelledby="toptan-title"
          tabIndex={-1}
          className="scroll-mt-36 border-t border-border py-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:py-16"
        >
          <h2 id="toptan-title">Toptan satış</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">Toptan talep formu henüz kullanıma açık değil.</p>
        </section>
      </div>
    </main>
  );
}
