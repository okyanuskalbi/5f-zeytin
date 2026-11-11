import { PageBreadcrumbJsonLd } from "@/components/site/PageBreadcrumbJsonLd";
import { completeMetadata } from "@/lib/site/metadata";
import type { Metadata } from "next";
import { connection } from "next/server";
import type { JSX } from "react";
import { CartPage } from "@/components/cart/CartSummary";
import { getProducts } from "@/lib/catalog/static-products";
import type { Product } from "@/types/catalog";

export const metadata: Metadata = completeMetadata({
  description: "Sepetinizdeki ürünleri ve adetleri inceleyin. Online ödeme henüz açık değildir; ürünler için teklif hazırlayabilirsiniz.", title: "Sepetim | Afina Zeytin", alternates: { canonical: "/sepet" }, robots: { index: false, follow: false } });

export default async function Page(): Promise<JSX.Element> {
  // Re-read the catalog on each request/refresh; never restore browser prices.
  await connection();
  let products: readonly Product[] | null;
  try { products = await getProducts(); } catch { products = null; }
  return <><PageBreadcrumbJsonLd name="Sepetim" path="/sepet" /><CartPage products={products} /></>;
}
