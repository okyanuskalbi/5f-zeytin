import type { Metadata } from "next";
import type { JSX } from "react";
import styles from "@/components/landing/ClassicHome.module.css";
import { ClassicHero } from "@/components/landing/ClassicHome";
import { HomeCategories, HomeProductGrid, HomeStory, HomeBanners, HomeHarvest, HomeBusiness, HomeBlog, HomeTrust } from "@/components/landing/CustomerHome";
import { CustomerMarquee } from "@/components/landing/CustomerMarquee";
import { QuoteSection, TrustAndContact } from "@/components/landing/RenewalLanding";
import { QuoteQuerySelection } from "@/components/landing/QuoteQuerySelection";
import { QuoteJourneyProvider } from "@/components/landing/QuoteJourneyProvider";
import { BusinessJsonLd } from "@/components/site/BusinessJsonLd";
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
  return <QuoteJourneyProvider><main className={styles.root}>
    <QuoteQuerySelection products={products} />
    <BusinessJsonLd />
    <ClassicHero />
    <HomeCategories />
    <HomeProductGrid products={products} />
    <HomeStory />
    <HomeProductGrid products={products} featured />
    <HomeBanners />
    <HomeHarvest />
    <CustomerMarquee />
    <HomeBusiness />
    <HomeBlog />
    <HomeTrust />
    <QuoteSection products={products} />
    <TrustAndContact />
  </main></QuoteJourneyProvider>;
}
