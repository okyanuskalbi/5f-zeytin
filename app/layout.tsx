import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afina Zeytin | Zeytin ve Zeytinyağı",
  description:
    "Afina Zeytin, Osmaniye’deki fabrikasıyla zeytin, salamura zeytin ve zeytinyağını toptan ve perakende müşterileriyle buluşturuyor.",
  other: { app: "zeytin" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="tr">
      <body>
        <a
          href="#ana-icerik"
          className="fixed top-4 left-4 z-[100] -translate-y-32 rounded-md bg-primary px-5 py-3 text-primary-foreground focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Ana içeriğe geç
        </a>
        <Navbar />
        <div id="ana-icerik" tabIndex={-1} className="scroll-mt-28 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
