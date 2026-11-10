"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { m, useAnimationControls } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/media/use-deferred-enhancement";
import { motionTokens, springs } from "@/lib/ui-motion";
import { Menu, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { useMembershipDialog } from "@/components/account/MembershipDialogProvider";
import { productGroups } from "@/lib/catalog/groups";
import { BrandLogo } from "./BrandLogo";
import styles from "./Navbar.module.css";

let navbarMenuPromise: Promise<typeof import("./NavbarMenu")["NavbarMenu"]> | undefined;
const NavbarMenu = dynamic(() => navbarMenuPromise ??= import("./NavbarMenu").then(module => module.NavbarMenu));

function preloadNavbarMenu(): void {
  if (navbarMenuPromise) return;
  navbarMenuPromise = import("./NavbarMenu").then(module => module.NavbarMenu);
  // An optional preload failure must still allow the normal menu load to retry.
  void navbarMenuPromise.catch(() => { navbarMenuPromise = undefined; });
}

export const links = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Ürünler", href: "/urunler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Toptan Satış", href: "/toptan-satis" },
  { label: "Bayilik", href: "/bayilik" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/hakkimizda#iletisim" },
];

function subscribeLocation(notify: () => void): () => void {
  window.addEventListener("popstate", notify);
  window.addEventListener("hashchange", notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener("hashchange", notify); };
}
const publicPathname = () => window.location.pathname;

/** The initial stored quantity is static; only a later addition acknowledges input. */
export function CartCountBadge({ count, hydrated }: { count: number; hydrated: boolean }): JSX.Element | null {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  const previous = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) { previous.current = null; return; }
    if (!reduced && previous.current !== null && count > previous.current) {
      void controls.start({ scale: [1, motionTokens.storefront.badgeScale, 1], transition: { type: "tween", duration: springs.badge.visualDuration, ease: motionTokens.storefront.ease } });
    } else controls.set({ scale: 1 });
    previous.current = count;
  }, [count, hydrated, reduced, controls]);
  return count > 0 ? <m.span data-slot="count-badge" aria-hidden="true" className={styles.badge}
    initial={false} animate={controls} style={reduced ? { transform: "none" } : undefined}>
    {count > 99 ? "99+" : count}
  </m.span> : null;
}

export function Navbar(): JSX.Element {
  const pathname = usePathname();
  const locationListener = useRef<(() => void) | null>(null);
  const subscribe = useCallback((notify: () => void) => {
    locationListener.current = notify;
    const unsubscribe = subscribeLocation(notify);
    return () => { locationListener.current = null; unsubscribe(); };
  }, []);
  // Vercel prerenders the root artifact with pathname /index; the browser
  // hydrates it at /. Normalize that known root alias before hydration so its
  // attributes match: React does not repair mismatched attributes on mount.
  // Subsequent navigation still follows the public URL, including interior pages.
  const prerenderPathname = pathname === "/index" ? "/" : pathname;
  const visiblePathname = useSyncExternalStore(subscribe, publicPathname, () => prerenderPathname);
  // Next commits pushState after render without emitting popstate. Recheck the
  // address after that commit even when the pre-commit snapshot was unchanged.
  useEffect(() => { locationListener.current?.(); }, [pathname]);
  const landing = !visiblePathname || visiblePathname === "/";
  const cart = useCart();
  const openMembership = useMembershipDialog();
  const itemCount = cart?.state.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    let idle: number | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const schedule = (): void => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(preloadNavbarMenu);
      else fallback = setTimeout(preloadNavbarMenu, 2000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const desktop = window.matchMedia("(min-width: 1361px)");
    const closeOnDesktop = (): void => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    // Preserve Radix focus management while also hiding background live regions.
    const background = [...document.querySelectorAll<HTMLElement>("#ana-icerik, footer")];
    const previous = background.map(node => ({ node, inert: node.inert, hidden: node.getAttribute("aria-hidden") }));
    background.forEach(node => { node.inert = true; node.setAttribute("aria-hidden", "true"); });
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      previous.forEach(({ node, inert, hidden }) => {
        node.inert = inert;
        if (hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", hidden);
      });
    };
  }, [isOpen]);

  return (
    <header data-site-navbar="" data-tone="solid"
      data-over-hero="false" className={`site-bar ${styles.bar}`}>
      <div className={styles.row}>
        <Link ref={homeRef} href="/" onClick={event => { if (landing && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) window.scrollTo({ top: 0, behavior: "instant" }); }} aria-label="Afina Zeytin ana sayfa" className={styles.home}>
          <BrandLogo tone="light" className={styles.logo} />
        </Link>
        <nav aria-label="Ana navigasyon" className={styles.desktop}>
          {links.map(link => <div key={link.href} className={styles.navItem}>
            <Link href={link.href} className={styles.link}
              aria-current={link.href === "/" ? landing ? "location" : undefined : visiblePathname === link.href || (link.href === "/urunler" && visiblePathname?.startsWith("/urunler/")) ? "page" : undefined}>{link.label}</Link>
            {link.href === "/urunler" && <details className={styles.categories} onKeyDown={event => {
              if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); }
            }}>
              <summary aria-label="Ürün kategorileri"><span aria-hidden="true">⌄</span></summary>
              <nav aria-label="Ürün kategorileri" className={styles.categoryLinks}>
                {productGroups.map(group => <Link key={group.id} href={`/urunler/${group.id}`} className={group.parentId ? styles.subcategory : undefined}>{group.name}</Link>)}
              </nav>
            </details>}
          </div>)}
        </nav>
        <div className={styles.actions}>
          <Link href="/urunler" className={styles.shop} aria-current={visiblePathname === "/urunler" ? "page" : undefined}>Online Mağaza</Link>
          <Button variant="ghost" size="icon" className={`${styles.control} ${styles.cart}`}
            aria-label={`Sepetim, ${itemCount} adet`} aria-haspopup="dialog" aria-expanded={cart?.open ?? false}
            disabled={!cart?.state.hydrated || cart.products === null}
            onClick={event => cart?.openCart(event.currentTarget)}>
            <ShoppingCart className={styles.cartIcon} strokeWidth={1.75} aria-hidden="true" />
            <CartCountBadge count={itemCount} hydrated={cart?.state.hydrated ?? false} />
          </Button>
          <Button asChild variant="ghost" className={`${styles.control} ${styles.account}`}>
            <Link href="/hesabim" onClick={event => { if(openMembership && pathname !== "/giris" && pathname !== "/kayit" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey){event.preventDefault();openMembership(event.currentTarget);} }} aria-label="Hesabım"><UserRound className={styles.accountIcon} strokeWidth={1.75} aria-hidden="true" /></Link>
          </Button>
          <Button ref={triggerRef} variant="ghost" className={`${styles.control} ${styles.trigger}`} aria-label="Menüyü aç"
            onPointerEnter={preloadNavbarMenu} onFocus={preloadNavbarMenu} onTouchStart={preloadNavbarMenu}
            aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
            <Menu className={styles.menuIcon} strokeWidth={1.75} aria-hidden="true" /><span className={styles.menuLabel}>Menü</span>
          </Button>
          {isOpen && <NavbarMenu links={links} activeHref={landing ? undefined : visiblePathname} onClose={() => setIsOpen(false)}
            onRestoreFocus={() => (window.matchMedia("(min-width: 1361px)").matches ? homeRef : triggerRef).current?.focus()} />}

        </div>
      </div>
    </header>
  );
}
