import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";

// Adapted from 21st Footer Two (meschacirung), with official AFİNA copy only.
const groups = [
  {
    title: "Keşfedin",
    links: [
      { label: "Ürünlerimizi Keşfedin", href: "/#urunler" },
      { label: "Tesisimiz", href: "/#tesisimiz" },
      { label: "Toptan Satış İçin İletişime Geçin", href: "/#toptan-iletisim" },
    ],
  },
  {
    title: "Yasal bilgiler",
    links: [
      { label: "KVKK", href: "/kvkk" },
      { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis" },
      { label: "İade ve İptal", href: "/iade" },
    ],
  },
];

const footerLink = "inline-flex min-h-11 max-w-full items-center rounded-none py-2 text-sm underline-offset-4 hover:text-primary-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground";

export function Footer(): JSX.Element {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="page-wrap pt-12 pb-6 sm:pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-16">
          <div className="min-w-0 md:col-span-2 lg:col-span-1">
            <Link href="/" className={footerLink} aria-label="Afina Zeytin ana sayfa">
              <Image
                src="/brand/afina-zeytin-dark.svg"
                alt="Afina Zeytin"
                width={145}
                height={167}
                unoptimized
                className="h-32 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-base">Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
            <p className="mt-3 text-base text-primary-foreground">Osmaniye üretim tesisi</p>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="min-w-0">
              <h2 className="mb-3 font-sans text-base font-semibold">{group.title}</h2>
              <ul className="grid gap-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">© {new Date().getFullYear()} Afina Zeytin</p>
          <a href="https://afina.com.tr" className={footerLink} aria-label="AFİNA Şirketler Topluluğu">
            <Image
              src="/brand/afina-topluluk-dark.svg"
              alt="AFİNA Şirketler Topluluğu"
              width={381}
              height={225}
              unoptimized
              className="h-auto w-40"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
