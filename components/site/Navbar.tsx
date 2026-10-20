"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingBag, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// Adapted from 21st Mega Menu Navbar (anelkabag); AFİNA uses a single landing.
const links = [
  { label: "Ürünlerimizi Keşfedin", href: "/#urunler" },
  { label: "Tesisimiz", href: "/#tesisimiz" },
  { label: "Toptan Satış İçin İletişime Geçin", href: "/#toptan" },
];

const navLink = "inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent): void => {
      if (event.matches) setIsOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-6 sm:px-6">
        <Link
          ref={homeRef}
          href="/"
          aria-label="Afina Zeytin ana sayfa"
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Image
            src="/brand/afina-zeytin.svg"
            alt="Afina Zeytin"
            width={145}
            height={167}
            loading="eager"
            unoptimized
            className="h-16 w-auto sm:h-20"
          />
        </Link>

        <nav aria-label="Ana navigasyon" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href="/hesabim" aria-label="Hesabım"><UserRound aria-hidden="true" /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href="/sepet" aria-label="Sepetim"><ShoppingBag aria-hidden="true" /></Link>
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menüyü aç">
                <Menu aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                firstLinkRef.current?.focus();
              }}
              onCloseAutoFocus={(event) => {
                // On resize the mobile trigger is hidden; focus a visible destination.
                if (window.matchMedia("(min-width: 1024px)").matches) {
                  event.preventDefault();
                  homeRef.current?.focus();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>Site menüsü</DialogTitle>
                <DialogDescription>Ürünler, tesisimiz ve toptan satış bağlantıları.</DialogDescription>
              </DialogHeader>
              <nav aria-label="Mobil navigasyon" className="grid gap-2">
                {links.map((link, index) => (
                  <DialogClose key={link.href} asChild>
                    <Link ref={index === 0 ? firstLinkRef : undefined} href={link.href} className={`${navLink} border-b border-border py-3 text-base`}>
                      {link.label}
                    </Link>
                  </DialogClose>
                ))}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <DialogClose asChild><Link href="/hesabim" className={navLink}>Hesabım</Link></DialogClose>
                  <DialogClose asChild><Link href="/sepet" className={navLink}>Sepetim</Link></DialogClose>
                </div>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
