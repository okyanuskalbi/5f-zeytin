import type { Metadata } from "next";
import type { JSX } from "react";
import styles from "@/components/landing/RenewalLanding.module.css";
import { OliveScrollHero } from "@/components/landing/OliveScrollHero";
import { BrandIntroduction, ProductionFacility, RenewalProducts, ProductionJourney, BusinessSection, TrustAndContact } from "@/components/landing/RenewalLanding";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
import { ProductDetailProvider } from "@/components/catalog/ProductDetailProvider";
import { readProductFamilies } from "@/lib/catalog/read";

// This landing reads only anonymous catalog data, never session cookies.
// Cache its HTML for five minutes while keeping catalog/API reads uncached.
export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: process.env.VERCEL_ENV === "preview"
    ? { index: false, follow: false }
    : { "max-image-preview": "large", "max-snippet": -1 },
};

export default async function Home(): Promise<JSX.Element> {
  const families = await readProductFamilies();
  const products = families.flatMap(family => family.variants);
  return <ProductDetailProvider products={products}><main className={styles.root}>
    <BusinessJsonLd />
    <OliveScrollHero />
    <BrandIntroduction />
    <ProductionFacility />
    <RenewalProducts products={products} />
    <ProductionJourney />
    <BusinessSection products={products} />
    <TrustAndContact />
  </main></ProductDetailProvider>;
}
