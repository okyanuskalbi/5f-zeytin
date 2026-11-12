import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { generateMetadata } from "@/app/urun/[slug]/page";
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
it("keeps selected packaging in product metadata and canonical", async () => {
 const metadata = await generateMetadata({ params: Promise.resolve({ slug: "naturel-sizma-zeytinyagi" }), searchParams: Promise.resolve({ boy: "5 L" }) });
 expect(metadata.title).toContain("5 L");
 expect(metadata.description).toContain("5 L");
 expect(metadata.alternates?.canonical).toBe("/urun/naturel-sizma-zeytinyagi?boy=5%20L");
 expect(metadata.openGraph).toMatchObject({ title: metadata.title, description: metadata.description, url: metadata.alternates?.canonical });
});
it("rejects an unknown packaging query and uses the actual default variant", async () => {
 const metadata = await generateMetadata({ params: Promise.resolve({ slug: "naturel-sizma-zeytinyagi" }), searchParams: Promise.resolve({ boy: "999 L" }) });
 expect(metadata.title).toContain("1 L"); expect(metadata.title).not.toContain("999");
});
it("uses the A product tiles and the wholesale form on the home page", () => {
 // Task208: the catalogue and the wholesale form are sections of the home page.
 const home = readFileSync("components/storefront/StoreHome.tsx", "utf8");
 expect(home).toContain("ProductTile");
 expect(home).toContain("QuoteComposer");
 expect(home).not.toContain("components/landing");
});
