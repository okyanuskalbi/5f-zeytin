import type { Metadata } from "next";
import { siteIdentity } from "@/lib/site/identity";

/** Next metadata is shallowly merged: every page needs its own complete social card. */
export function completeMetadata(metadata: Metadata): Metadata {
  const title = typeof metadata.title === "string" ? metadata.title : siteIdentity.title;
  const description = metadata.description ?? siteIdentity.description;
  const images = [{ url: "/brand/og-zeytinyagi.webp", width: 1200, height: 630, alt: "AFİNA ZEYTİN. Kökü toprakta. Yeri sofrada." }];
  const canonical = metadata.alternates?.canonical;
  const canonicalUrl = typeof canonical === "string" || canonical instanceof URL ? canonical : canonical?.url;
  return {
    ...metadata,
    description,
    openGraph: {
      title, description, url: canonicalUrl ?? "/", type: "website",
      locale: "tr_TR", siteName: siteIdentity.name, images, ...metadata.openGraph,
    } as Metadata["openGraph"],
    twitter: { card: "summary_large_image", title, description, images: images.map(image => image.url), ...metadata.twitter },
  };
}
