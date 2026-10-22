"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, ClipboardList, LayoutDashboard, Menu, Search, ShoppingBasket, Tags, Truck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import styles from "./AdminShell.module.css";

export type AdminOverview =
  | { status: "fixture"; activeProducts: number; awaitingPayment: number; readyToShip: number }
  | { status: "loading" | "empty" | "error" };

const fixture: AdminOverview = { status: "fixture", activeProducts: 3, awaitingPayment: 2, readyToShip: 1 };
const areas = [
  { id: "admin-urunler", label: "Ürünler", group: "Operasyon", icon: Boxes, description: "En fazla 6 aktif ürünün katalog ve stok bilgilerini yönetin." },
  { id: "admin-siparisler", label: "Siparişler", group: "Operasyon", icon: ClipboardList, description: "Sipariş ve ödeme durumları burada görüntülenecek." },
  { id: "admin-kargo", label: "Kargo", group: "Operasyon", icon: Truck, description: "Siparişlerin kargo ve takip bilgileri burada yönetilecek." },
  { id: "admin-kampanyalar", label: "Kupon / Kampanya", group: "Pazarlama", icon: Tags, description: "Kupon ve kampanya koşulları burada yönetilecek." },
  { id: "admin-sepetler", label: "Terk Edilen Sepet", group: "Pazarlama", icon: ShoppingBasket, description: "İzinli sepet kayıtları burada görüntülenecek." },
  { id: "admin-musteriler", label: "Müşteriler", group: "Müşteriler", icon: Users, description: "Yetkili müşteri görünümü burada yer alacak." },
] as const;
const groups = ["Operasyon", "Pazarlama", "Müşteriler"] as const;

function isValid(overview: AdminOverview) {
  return overview.status !== "fixture" || (
    [overview.activeProducts, overview.awaitingPayment, overview.readyToShip].every(value => Number.isSafeInteger(value) && value >= 0)
    && overview.activeProducts <= 6
  );
}

/** Shared operation navigation and explicitly labelled overview fixtures.
 * Each operation page and API independently enforce server authorization. */
export function AdminShell({ overview = fixture, children, area }: { overview?: AdminOverview; children?: ReactNode; area?: "admin-urunler" }) {
  const router = useRouter();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(area ?? "admin-genel-bakis");
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingFocus = useRef<string | null>(null);
  const search = query.trim().toLocaleLowerCase("tr-TR");
  const matches = areas.filter(area => area.label.toLocaleLowerCase("tr-TR").includes(search));
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

  useEffect(() => {
    const updateLocation = () => {
      const id = window.location.hash.slice(1);
      setActive(area ?? (areas.some(area => area.id === id) ? id : "admin-genel-bakis"));
    };
    window.addEventListener("hashchange", updateLocation);
    return () => window.removeEventListener("hashchange", updateLocation);
  }, [area]);

  function href(id: string) {
    return id === "admin-urunler" ? "/admin/urunler" : `${children ? "/admin" : ""}#${id}`;
  }

  function navigate(id: string) {
    if (id !== "admin-urunler" && !children) setActive(id);
    setQuery("");
    if (menuOpen) {
      pendingFocus.current = id;
      setMenuOpen(false);
    } else document.getElementById(id)?.focus();
  }

  function navigation() {
    return <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem><SidebarMenuButton asChild data-active={active === "admin-genel-bakis"}>
            <Link href={href("admin-genel-bakis")} aria-current={active === "admin-genel-bakis" ? "location" : undefined} onClick={() => navigate("admin-genel-bakis")}>
              <LayoutDashboard aria-hidden="true" />Genel Bakış
            </Link>
          </SidebarMenuButton></SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      {groups.map(group => <SidebarGroup key={group}>
        <SidebarGroupLabel>{group}</SidebarGroupLabel>
        <SidebarMenu>{areas.filter(area => area.group === group).map(area => <SidebarMenuItem key={area.id}>
          <SidebarMenuButton asChild data-active={active === area.id}>
            <Link href={href(area.id)} aria-current={active === area.id ? "location" : undefined} onClick={() => navigate(area.id)}>
              <area.icon aria-hidden="true" />{area.label}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>)}</SidebarMenu>
      </SidebarGroup>)}
    </>;
  }

  const summaries = [
    { title: "Aktif ürün", value: sample ? `${sample.activeProducts} / 6` : "—" },
    { title: "Ödeme bekleyen sipariş", value: sample ? String(sample.awaitingPayment) : "—" },
    { title: "Kargoya hazır sipariş", value: sample ? String(sample.readyToShip) : "—" },
  ];

  return <div data-admin-shell="" className={`${styles.theme} ${styles.shell}`}>
    <Sidebar className={styles.desktopSidebar}>
      <div className={styles.brand}>AFİNA ZEYTİN<span>Yönetim paneli</span></div>
      <SidebarContent><nav aria-label="Yönetim navigasyonu">{navigation()}</nav></SidebarContent>
      <Link href="/" className={styles.storeLink}>Vitrine dön</Link>
    </Sidebar>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.location}>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="outline" size="icon" className={styles.menuTrigger} aria-label="Yönetim menüsünü aç"><Menu aria-hidden="true" /></Button></SheetTrigger>
            <SheetContent placement="fullscreen" className={`${styles.theme} ${styles.mobilePanel}`} onCloseAutoFocus={event => {
              if (pendingFocus.current) {
                event.preventDefault();
                document.getElementById(pendingFocus.current)?.focus();
                pendingFocus.current = null;
              }
            }}>
              <div className={styles.mobileHeading}>
                <SheetTitle>Yönetim menüsü</SheetTitle>
                <SheetDescription>AFİNA ZEYTİN yönetim alanları</SheetDescription>
              </div>
              <nav aria-label="Mobil yönetim navigasyonu">{navigation()}</nav>
              <Link href="/" className={styles.storeLink}>Vitrine dön</Link>
            </SheetContent>
          </Sheet>
          <span>Yönetim / <strong>{areas.find(area => area.id === active)?.label ?? "Genel Bakış"}</strong></span>
        </div>
        <div role="search" aria-label="Yönetim alanı arama" className={styles.search}>
          <label htmlFor={searchId} className="sr-only">Yönetim alanlarında ara</label>
          <Search aria-hidden="true" className={styles.searchIcon} />
          <Input id={searchId} type="search" value={query} autoComplete="off" placeholder="Yönetim alanlarında ara…" aria-describedby={`${searchId}-hint`} aria-controls={search ? `${searchId}-results` : undefined}
            onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(""); }} />
          <span id={`${searchId}-hint`} className="sr-only">Yalnız bu sayfadaki yönetim alanlarında arar; müşteri verilerinde arama yapmaz.</span>
          {search && <div className={styles.searchResults}>
            <p role="status">{matches.length ? `${matches.length} yönetim alanı bulundu.` : "Eşleşen yönetim alanı bulunamadı."}</p>
            <nav id={`${searchId}-results`} aria-label="Arama sonuçları">{matches.map(area => <Link key={area.id} href={href(area.id)} onClick={() => navigate(area.id)}>{area.label}</Link>)}</nav>
          </div>}
        </div>
      </header>
      <main className={styles.content}>
        {children ?? <><section aria-labelledby="admin-genel-bakis" className={styles.overview}>
          <div><p className={styles.eyebrow}>AFİNA ZEYTİN</p><h1 id="admin-genel-bakis" tabIndex={-1}>Genel Bakış</h1><p className={styles.muted}>Ürün, sipariş ve sevkiyat işlemlerinin yönetim alanı.</p></div>
          {sample && <p className={styles.notice}>Bu özet test verisi kullanır. Canlı operasyon verisi bağlı değildir.</p>}
          {loading && <p role="status">Özet yükleniyor…</p>}
          {failed && <div className={styles.error}><p role="alert">Özet yüklenemedi. Lütfen yeniden deneyin.</p><Button onClick={() => router.refresh()}>Yeniden dene</Button></div>}
          <section aria-label="Operasyon özeti" aria-busy={loading} className={styles.summaries}>
            {summaries.map((summary, index) => <Card key={summary.title} role="region" aria-labelledby={`admin-summary-${index}`}>
              <CardHeader><h2 id={`admin-summary-${index}`}>{summary.title}</h2>{sample && <Badge variant="outline">TEST VERİSİ</Badge>}</CardHeader>
              <CardContent><p className={styles.value}>{summary.value}</p>{!sample && !loading && !failed && <p className={styles.muted}>Henüz veri yok</p>}</CardContent>
            </Card>)}
          </section>
          <div className={styles.insights}>
            <section aria-labelledby="admin-insights-title" className={styles.panel}><h2 id="admin-insights-title">Bekleyen işlemler</h2><p className={styles.muted}>İşlem gerektiren kayıtlar bağlandığında burada görünecek. Şu anda doğrulanmış operasyon kaydı yok.</p></section>
            <section aria-labelledby="admin-orders-title" className={styles.panel}><h2 id="admin-orders-title">Sipariş görünümü</h2><p className={styles.muted}>Henüz sipariş verisi yok. Günlük sipariş grafiği için doğrulanmış kayıtlar ve tarih aralığı gerekir.</p></section>
          </div>
        </section>
        <div className={styles.areas}>{areas.map(area => <section key={area.id} aria-labelledby={area.id} className={styles.panel}>
          <h2 id={area.id} tabIndex={-1}>{area.label}</h2><p>{area.description}</p>{area.id === "admin-urunler" ? <Link href="/admin/urunler" className={styles.storeLink}>Ürünleri yönet</Link> : <p className={styles.muted}>Henüz operasyon verisi bağlı değil.</p>}
        </section>)}</div></>}
      </main>
    </div>
  </div>;
}
