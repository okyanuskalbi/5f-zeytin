import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import type { JSX, ReactNode } from "react";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { CartProvider } from "@/components/cart/CartProvider";
import { MotionProvider } from "@/components/site/MotionProvider";
import { MembershipDialogProvider } from "@/components/account/MembershipDialogProvider";
import { getProducts } from "@/lib/catalog/static-products";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import { storefrontMotionStyles } from "@/lib/ui-motion";
import { siteIdentity } from "@/lib/site/identity";
import type { Product } from "@/types/catalog";
import "./globals.css";

// Self-hosted at build time by next/font: no runtime font request, CSP unchanged.
// Only the faces the first screen needs are preloaded; the rest arrive on demand
// (same family name), so the hero poster is not queued behind unused font files.
const display = Cormorant({
  weight: ["600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

// The hero's one italic phrase: same family name, so it joins --font-cormorant; never preloaded.
const displayItalic = Cormorant({ weight: ["700"], style: ["italic"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-cormorant-italic" });

const body = Montserrat({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-montserrat",
});

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#243A29" };

export const metadata: Metadata = {
  metadataBase: new URL(siteIdentity.origin),
  title: siteIdentity.title,
  description: siteIdentity.description,
  other: { app: "zeytin" },
  icons: {
    icon: { url: "/brand/favicon.svg", type: "image/svg+xml" },
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
  twitter: {
    card: "summary_large_image",
    title: siteIdentity.title,
    description: siteIdentity.description,
    images: ["/brand/og-zeytinyagi.webp"],
  },
  openGraph: {
    title: siteIdentity.title,
    description: siteIdentity.description,
    url: "/",
    type: "website",
    locale: "tr_TR",
    siteName: siteIdentity.name,
    images: [{ url: "/brand/og-zeytinyagi.webp", width: 1200, height: 630, alt: "Afina Zeytin. Kökü toprakta, yeri sofrada." }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
  let products: readonly Product[] | null;
  try { products = await getProducts(); } catch { products = null; }
  return (
    <html lang="tr" data-scroll-behavior="smooth" className={`${display.variable} ${displayItalic.variable} ${body.variable}`}>
      <body style={storefrontMotionStyles}>
        <a
          href="#ana-icerik"
          className="fixed top-4 left-4 z-[100] -translate-y-32 rounded-full bg-primary px-5 py-3 text-primary-foreground focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Ana içeriğe geç
        </a>
        <MotionProvider><CartProvider products={products} checkoutHref={isCheckoutDemoEnabled() ? "/odeme" : null}>
          <MembershipDialogProvider><StoreHeader />
          <div id="ana-icerik" tabIndex={-1} className="scroll-mt-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
            {children}
          </div>
          <StoreFooter /></MembershipDialogProvider>
        </CartProvider></MotionProvider>
      </body>
    </html>
  );
}
