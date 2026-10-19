import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
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
      <body>{children}</body>
    </html>
  );
}
