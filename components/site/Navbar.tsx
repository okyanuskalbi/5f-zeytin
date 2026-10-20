"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// Adapted from 21st Mega Menu Navbar (anelkabag); AFİNA uses a single landing.
const links = [
  { label: "Ürünlerimizi Keşfedin", href: "/#urunler" },
  { label: "Tesisimiz", href: "/#tesisimiz" },
  { label: "Toptan Satış İçin İletişime Geçin", href: "/#toptan-iletisim" },
];

const navLink = "inline-flex min-h-11 items-center px-3 py-2 text-base font-medium hover:bg-accent active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export function Navbar(): JSX.Element {
  const cart = useCart();
  const itemCount = cart?.state.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Radix preserves live regions. Keep their containing page inert too, so
    // the hero's product announcements cannot expose the background to AT.
    const background = [...document.querySelectorAll<HTMLElement>("#ana-icerik, footer")];
    const previous = background.map(node => ({ node, inert: node.inert, hidden: node.getAttribute("aria-hidden") }));
    background.forEach(node => { node.inert = true; node.setAttribute("aria-hidden", "true"); });
    return () => previous.forEach(({ node, inert, hidden }) => {
      node.inert = inert;
      if (hidden === null) node.removeAttribute("aria-hidden");
      else node.setAttribute("aria-hidden", hidden);
    });
  }, [isOpen]);

  return (
    <header className="site-bar sticky top-0 z-30 bg-background">
      <div className="flex h-16 items-center justify-between gap-2">
        <Link
          href="/"
          aria-label="Afina Zeytin ana sayfa"
          className="inline-flex min-h-11 shrink-0 items-center font-serif text-base font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:text-xl"
        >
          AFİNA ZEYTİN
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href="/hesabim" aria-label="Hesabım"><UserRound aria-hidden="true" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative"
            aria-label={`Sepetim, ${itemCount} adet`} aria-haspopup="dialog" aria-expanded={cart?.open ?? false}
            disabled={!cart?.state.hydrated || cart.products === null}
            onClick={(event) => cart?.openCart(event.currentTarget)}>
            <ShoppingBag aria-hidden="true" />
            {/* Adapted from 21st sebafermanelli/Count Badge (37460). The button
                names the exact count; the capped visual badge is decorative. */}
            {itemCount > 0 && <span data-slot="count-badge" aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 inline-flex min-h-5 min-w-5 items-center justify-center bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="px-2" aria-label="Menüyü aç">
                Menü
              </Button>
            </DialogTrigger>
            <DialogContent
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                firstLinkRef.current?.focus();
              }}
            >
              <DialogHeader>
                <DialogTitle>Site menüsü</DialogTitle>
                <DialogDescription>Ürünler, tesisimiz ve toptan satış bağlantıları.</DialogDescription>
              </DialogHeader>
              <nav aria-label="Site navigasyonu" className="grid gap-2">
                {links.map((link, index) => (
                  <DialogClose key={link.href} asChild>
                    <Link ref={index === 0 ? firstLinkRef : undefined} href={link.href} className={navLink}>
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
