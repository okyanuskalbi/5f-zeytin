import type { Metadata } from "next";
import type { JSX } from "react";
import styles from "@/components/landing/ClassicHome.module.css";
import { ClassicHero, TrustStrip, ClassicFacility, ClassicBusiness, ClassicAbout } from "@/components/landing/ClassicHome";
import { ProductGroups } from "@/components/landing/ProductGroups";
import { QuoteSection, TrustAndContact } from "@/components/landing/RenewalLanding";
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
  return <QuoteJourneyProvider><ProductDetailProvider products={products} quoteEnabled><main className={styles.root}>
    <BusinessJsonLd />
    <ClassicHero />
    <TrustStrip />
    <ClassicFacility />
    <ProductGroups products={products} />
    <ClassicBusiness />
    <ClassicAbout />
    <QuoteSection products={products} />
    <TrustAndContact />
  </main></ProductDetailProvider></QuoteJourneyProvider>;
}
