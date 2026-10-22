/* eslint-disable @next/next/no-img-element -- Local SVG artwork needs no optimizer or client image runtime. */
import type { JSX } from "react";

const logos = {
  paytr: { alt: "PayTR", width: 180, height: 32 },
  visa: { alt: "Visa", width: 82, height: 26 },
  mastercard: { alt: "Mastercard", width: 78, height: 48 },
  troy: { alt: "Troy", width: 109, height: 50 },
} as const;
type PaymentBrand = keyof typeof logos;
const allBrands: readonly PaymentBrand[] = ["paytr", "visa", "mastercard", "troy"];

type PaymentLogosProps = {
  /** Artwork colour: light on dark surfaces, dark on light surfaces. */
  tone: "light" | "dark";
  brands?: readonly PaymentBrand[];
  className?: string;
  /** Preserve the footer's existing card list without adding a surface wrapper. */
  asListItems?: boolean;
};

export function PaymentLogos({ tone, brands = allBrands, className, asListItems = false }: PaymentLogosProps): JSX.Element {
  return <>{brands.map(brand => {
    const logo = logos[brand];
    // Mastercard retains its original brand colours on either surface.
    const suffix = tone === "dark" && brand !== "mastercard" ? "-dark" : "";
    const image = <img key={brand} src={`/images/payment/${brand}${suffix}.svg`} alt={logo.alt}
      width={logo.width} height={logo.height} className={className} loading="lazy" decoding="async" />;
    return asListItems ? <li key={brand}>{image}</li> : image;
  })}</>;
}
