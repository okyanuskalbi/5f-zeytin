import type { Metadata } from "next";
import type { JSX } from "react";
import styles from "@/components/landing/ScrollingSections.module.css";
import { HarvestJourney } from "@/components/landing/HarvestJourney";
import { RenewalProducts, BusinessSection, QuoteSection, TrustAndContact } from "@/components/landing/RenewalLanding";
import { QuoteJourneyProvider } from "@/components/landing/QuoteJourneyProvider";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
import { ProductDetailProvider } from "@/components/catalog/ProductDetailProvider";
import { readProductFamilies } from "@/lib/catalog/read";

// This landing reads only anonymous catalog data, never session cookies.
// Cache its HTML for five minutes while keeping catalog/API reads uncached.
export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/atom+xml": [{ url: "/feed.xml", title: "AFİNA ZEYTİN içerik güncellemeleri" }] },
  },
  robots: process.env.VERCEL_ENV === "preview"
    ? { index: false, follow: false }
    : { "max-image-preview": "large", "max-snippet": -1 },
};

export default async function Home(): Promise<JSX.Element> {
  const families = await readProductFamilies();
  const products = families.flatMap(family => family.variants);
  return <ProductDetailProvider products={products}><QuoteJourneyProvider><main className={styles.root}>
    <BusinessJsonLd />
    <HarvestJourney />
    <RenewalProducts products={products} />
    <BusinessSection />
    <QuoteSection products={products} />
    <TrustAndContact />
  </main></QuoteJourneyProvider></ProductDetailProvider>;
}
