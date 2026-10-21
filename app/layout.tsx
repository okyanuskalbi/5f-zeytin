import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import type { JSX, ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { getProducts } from "@/lib/catalog/static-products";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import type { Product } from "@/types/catalog";
import "./globals.css";

const Fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces-normal.woff2", weight: "500 700", style: "normal" },
  ],
  display: "swap",
  // Only the normal face is used in runtime; discover the hero headline font early.
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const bodyFont = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  weight: ["400", "600", "800"],
  variable: "--font-body",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afinazeytin.com"),
  title: "Afina Zeytin | Zeytin ve Zeytinyağı",
  description:
    "Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin, salamura zeytin ve zeytinyağını toptan ve perakende müşterileriyle buluşturuyor.",
  other: { app: "zeytin" },
  icons: { icon: { url: "/brand/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Afina Zeytin — Kökü toprakta. Yeri sofrada." }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
  let products: readonly Product[] | null;
  try { products = await getProducts(); } catch { products = null; }
  return (
    <html lang="tr" className={`${Fraunces.variable} ${bodyFont.variable}`}>
      <body>
        <a
          href="#ana-icerik"
          className="fixed top-4 left-4 z-[100] -translate-y-32 rounded-none bg-primary px-5 py-3 text-primary-foreground focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Ana içeriğe geç
        </a>
        <CartProvider products={products} checkoutHref={isCheckoutDemoEnabled() ? "/odeme" : null}>
          <Navbar />
          <div id="ana-icerik" tabIndex={-1} className="scroll-mt-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
