"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { BrandLogo } from "@/components/site/BrandLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, ClipboardList, LayoutDashboard, Menu, Search, Store, Truck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import styles from "./AdminShell.module.css";

export type AdminOverview =
  | { status: "fixture"; activeProducts: number; awaitingPayment: number; readyToShip: number }
  | { status: "loading" | "empty" | "error" };

const destinations = [
  { id: "admin-genel-bakis", label: "Panel", href: "/admin", icon: LayoutDashboard },
  { id: "admin-urunler", label: "Ürünler", href: "/admin/urunler", icon: Boxes },
] as const;
const planned = [{ label: "Siparişler", icon: ClipboardList }, { label: "Müşteriler", icon: Users }];

function isValid(overview: AdminOverview) {
  return overview.status !== "fixture" || (
    [overview.activeProducts, overview.awaitingPayment, overview.readyToShip].every(value => Number.isSafeInteger(value) && value >= 0)
    && overview.activeProducts <= 6
  );
}

/** Presentation only. Each page and API retains its independent authorization gate.
 * Layout reference: 21st App Dashboard Layout (28770); no demo metrics or charts. */
export function AdminShell({ overview = { status: "empty" }, children, area }: { overview?: AdminOverview; children?: ReactNode; area?: "admin-urunler" }) {
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const active = area ?? "admin-genel-bakis";
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingFocus = useRef<string | null>(null);
  const pendingMenuFocus = useRef(false);
  const search = query.trim().toLocaleLowerCase("tr-TR");
  const matches = destinations.filter(item => item.label.toLocaleLowerCase("tr-TR").includes(search));
  const failed = overview.status === "error" || !isValid(overview);
  const sample = overview.status === "fixture" && !failed ? overview : null;
  const loading = overview.status === "loading";

  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: { matches: boolean }) => { if (event.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [menuOpen]);

  // Focus after search results unmount, so removing the clicked link cannot steal it.
  useEffect(() => {
    if (query || menuOpen || pendingMenuFocus.current || !pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [query, menuOpen]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (id === active) {
      event.preventDefault();
      pendingFocus.current = id;
      pendingMenuFocus.current = menuOpen;
      if (!query && !menuOpen) document.getElementById(id)?.focus();
    }
    setQuery("");
    setMenuOpen(false);
  }

  function navigation() {
    return <>
      <SidebarGroup>
        <SidebarGroupLabel>Yönetim</SidebarGroupLabel>
        <SidebarMenu>{destinations.map(item => <SidebarMenuItem key={item.id}>
          <SidebarMenuButton asChild data-active={active === item.id}>
            <Link prefetch={false} href={item.href} aria-current={active === item.id ? "page" : undefined} onClick={event => navigate(event, item.id)}>
              <item.icon aria-hidden="true" />{item.label}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>)}</SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Planlanan</SidebarGroupLabel>
        <ul className={styles.planned}>{planned.map(item => <li key={item.label}><item.icon aria-hidden="true" /><span>{item.label}</span></li>)}</ul>
      </SidebarGroup>
    </>;
  }

  const summaries = [
    { title: "Aktif ürün", value: sample ? `${sample.activeProducts} / 6` : "Veri yok", icon: Boxes },
    { title: "Ödeme bekleyen sipariş", value: sample ? String(sample.awaitingPayment) : "Veri yok", icon: ClipboardList },
    { title: "Kargoya hazır sipariş", value: sample ? String(sample.readyToShip) : "Veri yok", icon: Truck },
  ];

  return <div data-admin-shell="" data-surface="admin" className={`${styles.theme} ${styles.shell}`}>
    <a href="#admin-content" className={styles.skip}>İçeriğe geç</a>
    <Sidebar className={styles.desktopSidebar}>
      <div className={styles.brand}><BrandLogo tone="light" /><span>Yönetim paneli</span></div>
      <SidebarContent><nav aria-label="Yönetim navigasyonu">{navigation()}</nav></SidebarContent>
      <Link prefetch={false} href="/" className={styles.storeLink}><Store aria-hidden="true" />Vitrine dön</Link>
    </Sidebar>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.location}>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="outline" size="icon" className={styles.menuTrigger} aria-label="Yönetim menüsünü aç"><Menu aria-hidden="true" /></Button></SheetTrigger>
            <SheetContent placement="fullscreen" data-surface="admin" className={`${styles.theme} ${styles.mobilePanel}`} onCloseAutoFocus={event => {
              // Same-page navigation owns focus; Escape keeps Radix trigger restoration.
              if (pendingMenuFocus.current) {
                event.preventDefault();
                document.getElementById(active)?.focus();
                pendingFocus.current = null;
                pendingMenuFocus.current = false;
              }
            }}>
              <div className={styles.mobileHeading}>
                <SheetTitle>Yönetim menüsü</SheetTitle>
                <SheetDescription>AFİNA ZEYTİN</SheetDescription>
              </div>
              <nav aria-label="Mobil yönetim navigasyonu">{navigation()}</nav>
              <Link prefetch={false} href="/" className={styles.storeLink}><Store aria-hidden="true" />Vitrine dön</Link>
            </SheetContent>
          </Sheet>
          <span>Yönetim / <strong>{area ? "Ürünler" : "Panel"}</strong></span>
        </div>
        <div role="search" aria-label="Yönetim alanı arama" className={styles.search}>
          <label htmlFor={searchId} className="sr-only">Yönetim alanlarında ara</label>
          <Search aria-hidden="true" className={styles.searchIcon} />
          <Input id={searchId} name="admin-search" type="search" value={query} autoComplete="off" placeholder="Panel veya ürünler ara…" aria-controls={search ? `${searchId}-results` : undefined}
            onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(""); }} />
          {search && <div className={styles.searchResults}>
            <p role="status">{matches.length ? `${matches.length} yönetim alanı bulundu.` : "Eşleşen yönetim alanı bulunamadı."}</p>
            <nav id={`${searchId}-results`} aria-label="Arama sonuçları">{matches.map(item => <Link prefetch={false} key={item.id} href={item.href} onClick={event => navigate(event, item.id)}>{item.label}</Link>)}</nav>
          </div>}
        </div>
      </header>
      <main id="admin-content" tabIndex={-1} className={styles.content}>
        {children ?? <section aria-labelledby="admin-genel-bakis" className={styles.overview}>
          <div className={styles.overviewHeading}><div><h1 id="admin-genel-bakis" tabIndex={-1}>Panel</h1><p className={styles.muted}>Ürünlerinizi yönetin.</p></div><PillButton href="/admin/urunler" icon="none">Ürünleri yönet</PillButton></div>
          {sample && <p className={styles.notice}>Örnek özet. Gerçek işlem verisi değildir.</p>}
          {loading && <p role="status">Özet yükleniyor…</p>}
          {failed && <div className={styles.error}><p role="alert">Özet yüklenemedi. Lütfen yeniden deneyin.</p><PillButton icon="none" size="md" onClick={() => router.refresh()}>Yeniden dene</PillButton></div>}
          <section aria-label="Operasyon özeti" aria-busy={loading} className={styles.summaries}>
            {summaries.map((summary, index) => <Card key={summary.title} role="region" aria-labelledby={`admin-summary-${index}`}>
              <CardHeader><summary.icon aria-hidden="true" /><h2 id={`admin-summary-${index}`}>{summary.title}</h2>{sample && <Badge variant="outline">Test verisi</Badge>}</CardHeader>
              <CardContent><p className={sample ? styles.value : styles.unavailable}>{loading ? "Yükleniyor…" : failed ? "Alınamadı" : summary.value}</p>{!sample && !loading && !failed && <span className="sr-only">Henüz veri yok</span>}</CardContent>
            </Card>)}
          </section>
          <section aria-labelledby="admin-orders-title" className={styles.emptyState}>
            <ClipboardList aria-hidden="true" /><div><h2 id="admin-orders-title">Sipariş görünümü</h2><p className={styles.muted}>Sipariş ve müşteri yönetimi henüz kullanıma açık değil.</p></div>
          </section>
        </section>}
      </main>
    </div>
  </div>;
}
