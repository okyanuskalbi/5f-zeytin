import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { JSX, ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { MotionProvider } from "@/components/site/MotionProvider";
import { MembershipDialogProvider } from "@/components/account/MembershipDialogProvider";
import { getProducts } from "@/lib/catalog/static-products";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import { storefrontMotionStyles } from "@/lib/ui-motion";
import { siteIdentity } from "@/lib/site/identity";
import type { Product } from "@/types/catalog";
import "./globals.css";

const Fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces-tr.woff2", weight: "500 700", style: "normal" },
    { path: "./fonts/Fraunces-italic.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  // The harvest journey uses the original italic for its editorial emphasis.
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const bodyFont = localFont({
  src: [{ path: "./fonts/Inter-tr.woff2", weight: "400 800", style: "normal" }],
  display: "swap",
  preload: true,
  variable: "--font-body",
  fallback: ["Arial", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: "Arial",
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
    <html lang="tr" className={`${Fraunces.variable} ${bodyFont.variable}`}>
      <body style={storefrontMotionStyles}>
        <a
          href="#ana-icerik"
          className="fixed top-4 left-4 z-[100] -translate-y-32 rounded-none bg-primary px-5 py-3 text-primary-foreground focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Ana içeriğe geç
        </a>
        <MotionProvider><CartProvider products={products} checkoutHref={isCheckoutDemoEnabled() ? "/odeme" : null}>
          <MembershipDialogProvider><Navbar />
          <div id="ana-icerik" tabIndex={-1} className="scroll-mt-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
            {children}
          </div>
          <Footer /></MembershipDialogProvider>
        </CartProvider></MotionProvider>
      </body>
    </html>
  );
}
