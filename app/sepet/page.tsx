import type { Metadata } from "next";
import { connection } from "next/server";
import type { JSX } from "react";
import { CartPage } from "@/components/cart/CartSummary";
import { getProducts } from "@/lib/catalog/static-products";
import type { Product } from "@/types/catalog";

export const metadata: Metadata = { title: "Sepetim | Afina Zeytin", robots: { index: false, follow: false } };

export default async function Page(): Promise<JSX.Element> {
  // Re-read the catalog on each request/refresh; never restore browser prices.
  await connection();
  let products: readonly Product[] | null;
  try { products = await getProducts(); } catch { products = null; }
  return <CartPage products={products} />;
}
