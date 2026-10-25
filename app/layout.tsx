import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import type { JSX, ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { MotionProvider } from "@/components/site/MotionProvider";
import { getProducts } from "@/lib/catalog/static-products";
import { isCheckoutDemoEnabled } from "@/lib/checkout/adapter";
import type { Product } from "@/types/catalog";
import "./globals.css";

const Fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/Fraunces-italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  // Both real faces are local; the hero emphasis never synthesizes an italic.
  preload: true,
  adjustFontFallback: "Times New Roman",
  variable: "--font-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const bodyFont = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  // Explicit Arial metrics in globals.css also cover builds where Google's
  // loader emits no adjusted fallback. Values come from Next's Figtree metrics.
  fallback: ["Afina Figtree Fallback", "Arial", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: false,
});

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL("https://afinazeytin.com"),
  title: "Afina Zeytin | Zeytin ve Zeytinyağı",
  description:
    "Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin, salamura zeytin ve zeytinyağını toptan ve perakende müşterileriyle buluşturuyor.",
  other: { app: "zeytin" },
  icons: { icon: { url: "/brand/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Afina Zeytin. Kökü toprakta, yeri sofrada." }],
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
        <MotionProvider><CartProvider products={products} checkoutHref={isCheckoutDemoEnabled() ? "/odeme" : null}>
          <Navbar />
          <div id="ana-icerik" tabIndex={-1} className="scroll-mt-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
            {children}
          </div>
          <Footer />
        </CartProvider></MotionProvider>
      </body>
    </html>
  );
}
