import type { JSX } from "react";
import { HeroLabel } from "@/components/landing/HeroLabel";
import type { Product } from "@/types/catalog";

export function Hero({ products }: { products: readonly Product[] }): JSX.Element {
  return <HeroLabel products={products} />;
}
