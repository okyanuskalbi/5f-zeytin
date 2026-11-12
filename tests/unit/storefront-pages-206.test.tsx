import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import About from "@/app/hakkimizda/page";
import Wholesale from "@/app/toptan-satis/page";
import Blog from "@/app/blog/page";
import Article from "@/app/blog/[slug]/page";
import Kvkk from "@/app/kvkk/page";
import NotFound from "@/app/not-found";
import Unauthorized from "@/app/unauthorized";
import TrackingPage from "@/app/siparis-takip/page";
import { AboutStrip } from "@/components/storefront/content/AboutStrip";
import { DealershipPage } from "@/components/storefront/content/DealershipPage";
import { DealershipForm } from "@/components/dealership/DealershipForm";
import { MembershipFrame } from "@/components/account/MembershipFrame";
import { SignIn } from "@/components/account/SignIn";
import { Register } from "@/components/account/Register";
import { AccountSummary } from "@/components/account/AccountSummary";
import { CustomerWorkspace } from "@/components/account/CustomerWorkspace";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductManager } from "@/components/admin/ProductManager";
import { blogPosts } from "@/lib/blog/posts";
import { getProductFamilies } from "@/lib/catalog/static-products";
import { adminProduct } from "../fixtures/admin-products";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }), usePathname: () => "/",
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("@/components/account/ConfiguredGoogleButton", () => ({ ConfiguredGoogleButton: () => null }));

const css = (path: string): string => readFileSync(path, "utf8");
/** The declarations of one rule, e.g. rule(sheet, ".arch"). */
function rule(sheet: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[},\\s])${escaped}\\s*\\{([^}]*)\\}`, "m").exec(sheet);
  if (!match) throw new Error(`No rule for ${selector}`);
  return match[1];
}
const parse = (html: string): Document => new DOMParser().parseFromString(html, "text/html");
const profile = { name: "Deniz Sofra", email: "deniz@example.test", phone: null };

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Task206 step 1: about page", () => {
  const sheet = css("components/storefront/content/AboutPage.module.css");

  it("heads the page with SectionHeading as the single h1 and frames the factory photograph as an arch", () => {
    const doc = parse(renderToStaticMarkup(<About />));
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("[data-section-heading] h1")?.textContent).toBe("Hakkımızda");
    const arch = doc.querySelector("[data-about-story] [data-about-arch]")!;
    expect(arch.querySelector("img")?.getAttribute("src")).toContain("/images/customer-home/fabrika-");
    expect(rule(sheet, ".arch")).toContain("border-radius: var(--sf-radius-arch)");
  });

  it("carries exactly one still stamp, with the customer's permitted claim", () => {
    const doc = parse(renderToStaticMarkup(<About />));
    const stamps = doc.querySelectorAll("[data-stamp]");
    expect(stamps).toHaveLength(1);
    expect(stamps[0].getAttribute("aria-label")).toBe("%100 Doğal ve Katkısız");
  });

  it("runs the strip on a deep green band in ivory Cormorant with a pill pause button", () => {
    render(<AboutStrip />);
    const pause = screen.getByRole("button", { name: "Şeridi duraklat" });
    expect(pause.hasAttribute("data-pill")).toBe(true);
    expect(pause.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(pause);
    expect(screen.getByRole("button", { name: "Şeridi oynat" }).getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector("[data-about-strip]")?.getAttribute("data-paused")).toBe("true");
    expect(rule(sheet, ".strip")).toMatch(/background: var\(--sf-green\)/);
    expect(rule(sheet, ".strip")).toMatch(/color: var\(--sf-ivory\)/);
    expect(rule(sheet, ".stripTrack li")).toContain("font-family: var(--font-display)");
    // Reduced motion: no animation, the words wrap and stay readable.
    const reduced = sheet.slice(sheet.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.stripTrack \{[^}]*animation: none/);
    expect(reduced).toMatch(/flex-wrap: wrap/);
  });

  it("marks each production stage and value with a medallion and rounds the FAQ rows to the field radius", () => {
    const doc = parse(renderToStaticMarkup(<About />));
    expect(doc.querySelectorAll("[data-about-facility] li [data-medallion]")).toHaveLength(4);
    expect(doc.querySelectorAll("[data-about-values] li [data-medallion]")).toHaveLength(3);
    expect(rule(sheet, ".answers details")).toContain("border-radius: var(--sf-radius-field)");
    const actions = doc.querySelector("[data-about-story]")!;
    expect(actions.querySelector('a[data-pill][data-variant="primary"]')?.textContent).toBe("Ürünleri İnceleyin");
  });
});

describe("Task206 step 2: wholesale and dealership", () => {
  it("opens wholesale with a sage band that holds the h1 and a photograph", async () => {
    const doc = parse(renderToStaticMarkup(await Wholesale()));
    const band = doc.querySelector("[data-page-band]")!;
    expect(band.querySelector("[data-section-heading] h1")?.textContent).toBe("Toptan Satış");
    expect(band.querySelector("picture img")?.getAttribute("src")).toContain("/images/klasik/depo-");
    expect(rule(css("components/storefront/ui/ui.module.css"), ".band")).toContain("background: var(--sf-sage)");
  });

  it("submits the quote with a full-width primary pill and draws fields to the form contract", async () => {
    const doc = parse(renderToStaticMarkup(await Wholesale()));
    const submit = doc.querySelector('form[aria-label="Kurumsal teklif talebi"] button[type="submit"]')!;
    expect(submit.getAttribute("data-variant")).toBe("primary");
    expect(submit.hasAttribute("data-full")).toBe(true);
    expect(submit.textContent).toBe("Talep özetini hazırla");
    const sheet = css("components/storefront/quote/QuoteComposer.module.css");
    const field = rule(sheet, ".field input, .field select");
    expect(field).toContain("min-height: 52px");
    expect(field).toContain("border: 1px solid var(--sf-line)");
    expect(field).toContain("border-radius: var(--sf-radius-field)");
    expect(rule(sheet, ".field label")).toMatch(/font-size: 14px;[^}]*font-weight: 600/);
  });

  it("opens dealership with a light sage band and two pill actions, then a pill submit", () => {
    const { container } = render(<DealershipPage />);
    const band = container.querySelector("[data-page-band]")!;
    expect(within(band as HTMLElement).getByRole("heading", { level: 1 }).textContent).toBe("Bayimiz Olun");
    expect(screen.getByRole("link", { name: "Başvuru Formu" }).getAttribute("data-variant")).toBe("primary");
    expect(screen.getByRole("link", { name: "Ürünleri İnceleyin" }).getAttribute("data-variant")).toBe("outline");
    expect(container.querySelectorAll("[data-medallion]").length).toBeGreaterThanOrEqual(7);
    cleanup();
    render(<DealershipForm />);
    const submit = screen.getByRole("button", { name: "Başvuru E-postasını Hazırla" });
    expect(submit.getAttribute("data-variant")).toBe("primary");
    expect(submit.hasAttribute("data-full")).toBe(true);
    const sheet = css("components/dealership/DealershipForm.module.css");
    expect(sheet).toContain("min-height: 52px");
    expect(sheet).not.toMatch(/border-radius:\s*0\b/);
  });
});

describe("Task206 step 3: blog", () => {
  const sheet = css("components/storefront/content/Blog.module.css");

  it("lists one large card and the rest small", () => {
    const doc = parse(renderToStaticMarkup(<Blog />));
    expect(doc.querySelectorAll("[data-blog-card]")).toHaveLength(blogPosts.length);
    expect(doc.querySelectorAll('[data-blog-card][data-blog-size="large"]')).toHaveLength(1);
    expect(doc.querySelector("[data-blog-card]")?.getAttribute("data-blog-size")).toBe("large");
    expect(doc.querySelectorAll('[data-blog-card][data-blog-size="small"]')).toHaveLength(blogPosts.length - 1);
    expect(doc.querySelector("[data-page-band] [data-section-heading] h1")?.textContent).toBe("Zeytin Defteri");
  });

  it("sets the article for reading: large Cormorant title, 17 px body, 68 character measure, contents pills, FAQ rows", async () => {
    const post = blogPosts[0];
    const doc = parse(renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: post.slug }) })));
    const contents = doc.querySelector('nav[aria-label="İçindekiler"]')!;
    const links = [...contents.querySelectorAll("a")];
    expect(links).toHaveLength(post.sections.length);
    for (const link of links) expect(doc.getElementById(link.getAttribute("href")!.slice(1))?.tagName).toBe("H2");
    expect(rule(sheet, ".articleHeader h1")).toContain("font-size: clamp(44px, 5vw, 56px)");
    const prose = rule(sheet, ".prose");
    expect(prose).toContain("max-width: 68ch");
    expect(prose).toContain("font-size: 17px");
    expect(prose).toContain("line-height: 1.7");
    expect(rule(sheet, ".faq details")).toContain("border-radius: var(--sf-radius-field)");
    // Findability (Task201) is untouched: the same three schema blocks.
    const types = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!)["@type"]);
    expect(types).toEqual(["BlogPosting", "BreadcrumbList", "FAQPage"]);
    expect(doc.querySelector("[data-article-answer]")).not.toBeNull();
  });
});

describe("Task206 step 4: sign-in, register, account, tracking", () => {
  const surface = css("components/storefront/account/AccountSurface.module.css");

  it("draws one paper panel and a pill switch between sign-in and register", () => {
    render(<MembershipFrame mode="login"><p>içerik</p></MembershipFrame>);
    const tabs = screen.getByRole("navigation", { name: "Üyelik işlemleri" });
    expect(tabs.hasAttribute("data-pill-switch")).toBe(true);
    expect(within(tabs).getByRole("link", { name: "Giriş yap" }).getAttribute("aria-current")).toBe("page");
    expect(within(tabs).getByRole("link", { name: "Hesap oluştur" }).getAttribute("href")).toBe("/kayit");
    expect(rule(surface, ".authFrame")).toContain("border-radius: var(--sf-radius-card)");
    expect(rule(surface, ".authFrame")).toContain("background: var(--sf-paper)");
  });

  it("signs in with a full-width primary pill and keeps the show/hide control inside the password field", () => {
    render(<SignIn />);
    const submit = screen.getByRole("button", { name: "E-posta ile giriş yap" });
    expect(submit.getAttribute("type")).toBe("submit");
    expect(submit.getAttribute("data-variant")).toBe("primary");
    expect(submit.hasAttribute("data-full")).toBe(true);
    expect(screen.getByRole("button", { name: "E-posta bağlantısıyla giriş" }).getAttribute("data-variant")).toBe("outline");
    const password = screen.getByLabelText("Şifre", { exact: true });
    const toggle = screen.getByRole("button", { name: "Şifreyi göster" });
    expect(toggle.parentElement).toBe(password.parentElement);
    fireEvent.click(toggle);
    expect((password as HTMLInputElement).type).toBe("text");
    const membership = css("components/account/Membership.module.css");
    expect(rule(membership, ".password button")).toContain("position: absolute");
  });

  it("registers with a full-width primary pill", () => {
    render(<Register />);
    const submit = screen.getByRole("button", { name: "Üyelik oluştur" });
    expect(submit.getAttribute("data-variant")).toBe("primary");
    expect(submit.hasAttribute("data-full")).toBe(true);
  });

  it("offers the account menu as pill links with a green current item and lets long values wrap", () => {
    render(<AccountSummary profile={{ ...profile, email: "cok-uzun-bir-eposta-adresi-ornegi-kirilmali@ornek-alan-adi-uzun.example.test" }} />);
    const menu = screen.getByRole("navigation", { name: "Müşteri hesabı" });
    expect(within(menu).getByRole("link", { name: "Hesap özeti" }).getAttribute("aria-current")).toBe("page");
    expect(rule(surface, ".customerNav a")).toContain("border-radius: var(--sf-radius-pill)");
    expect(rule(surface, '.customerNav a[aria-current="page"]')).toMatch(/background: var\(--sf-green\)/);
    expect(rule(surface, ".card dd")).toContain("overflow-wrap: anywhere");
    expect(screen.getByRole("button", { name: "Çıkış yap" }).getAttribute("data-variant")).toBe("outline");
  });

  it("shows the order status as a Tag", async () => {
    const order = { no: "AF-001", date: "2026-11-01T00:00:00Z", totalKurus: 50000, status: "shipped", items: [], deliveryAddress: "", shipping: null };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ data: { orders: [order], page: 1, total: 1 } })));
    render(<CustomerWorkspace section="orders" profile={profile} />);
    const status = await screen.findByText("Kargoya verildi");
    expect(status.closest("[data-tag]")).not.toBeNull();
    for (const name of ["Önceki", "Sonraki"]) expect(screen.getByRole("button", { name }).hasAttribute("data-pill")).toBe(true);
  });

  it("keeps the unavailable tracking page in the band layout with a pill action", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO", undefined);
    const doc = parse(renderToStaticMarkup(<TrackingPage />));
    expect(doc.querySelector("[data-page-band] [data-section-heading] h1")?.textContent).toBe("Sipariş takibi");
    expect(doc.querySelector('a[data-pill][href="/urunler"]')?.textContent).toBe("Ürünleri İnceleyin");
  });
});

describe("Task206 step 5: legal pages and 404", () => {
  const sheet = css("components/storefront/content/Content.module.css");

  it("sets legal text in a long-form column with contents", () => {
    const doc = parse(renderToStaticMarkup(<Kvkk />));
    expect(doc.querySelector("[data-section-heading] h1")?.textContent).toBe("KVKK");
    const contents = doc.querySelector('nav[aria-label="İçindekiler"]')!;
    for (const link of contents.querySelectorAll("a")) expect(doc.getElementById(link.getAttribute("href")!.slice(1))).not.toBeNull();
    expect(rule(sheet, ".paper")).toContain("max-width: 68ch");
    expect(doc.querySelectorAll("[data-stamp]")).toHaveLength(0);
  });

  it("answers a missing address with the olive branch and two pills", () => {
    const doc = parse(renderToStaticMarkup(<NotFound />));
    expect(doc.querySelector("h1")?.textContent).toBe("Sayfa bulunamadı");
    expect(doc.querySelectorAll("[data-olive-branch]")).toHaveLength(1);
    const home = doc.querySelector('a[data-pill][href="/"]')!;
    expect(home.getAttribute("data-variant")).toBe("primary");
    expect(home.textContent).toBe("Ana sayfa");
    const products = doc.querySelector('a[data-pill][href="/urunler"]')!;
    expect(products.getAttribute("data-variant")).toBe("outline");
    expect(products.textContent).toBe("Ürünler");
  });

  it("sends an unauthorised visitor to sign-in with a pill", () => {
    const doc = parse(renderToStaticMarkup(<Unauthorized />));
    expect(doc.querySelector("a[data-pill]")?.getAttribute("href")).toBe("/giris?next=%2Fadmin");
  });
});

describe("Task206 step 6: admin panel", () => {
  const shell = css("components/admin/AdminShell.module.css");
  const products = css("components/admin/Products.module.css");

  it("uses coinless pills for every panel action", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [{ ...adminProduct, isActive: true }], total: 1, activeCount: 1, page: 1, options: [] })));
    const { container } = render(<AdminShell area="admin-urunler"><ProductManager /></AdminShell>);
    await screen.findByRole("button", { name: "Test zeytin düzenle" });
    for (const name of ["Ürün ekle", "Test zeytin düzenle", "Test zeytin yayından kaldır", "Önceki", "Sonraki"]) {
      const button = screen.getByRole("button", { name });
      expect(button.hasAttribute("data-pill"), name).toBe(true);
    }
    expect(container.querySelectorAll("[data-coin]")).toHaveLength(0);
    cleanup();
    const overview = render(<AdminShell />);
    const manage = screen.getByRole("link", { name: "Ürünleri yönet" });
    expect(manage.hasAttribute("data-pill")).toBe(true);
    expect(overview.container.querySelectorAll("[data-coin]")).toHaveLength(0);
  });

  it("keeps table rows at 52 px and Cormorant on the page title alone", () => {
    expect(rule(products, ".scroll :is(th, td)")).toContain("height: 52px");
    expect(rule(shell, ".theme h1")).toContain("font-family: var(--font-display");
    expect(shell.match(/font-display/g)).toHaveLength(1);
    expect(products).not.toContain("font-display");
  });

  it("stacks the product table in a narrow panel instead of scrolling sideways, each value named and sorting kept", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [adminProduct], total: 1, activeCount: 0, page: 1, options: [] })));
    render(<ProductManager />);
    await screen.findByRole("button", { name: "Test zeytin düzenle" });
    const cells = [...document.querySelectorAll("tbody td")];
    expect(cells.map(cell => cell.getAttribute("data-label"))).toEqual(["Ürün", "Fiyat", "Stok", "Durum", "İşlemler"]);
    for (const label of ["Ürün", "Fiyat", "Stok", "Durum"]) expect(screen.getByRole("button", { name: `${label} ile sırala` })).toBeDefined();
    // The display changes in CSS, so the table parts state their roles; the old "scroll sideways" hint is gone.
    expect(screen.getByRole("region", { name: "Ürün tablosu" }).querySelector('table[role="table"] tbody[role="rowgroup"] tr[role="row"] td[role="cell"]')).not.toBeNull();
    expect(document.querySelectorAll('thead th[role="columnheader"]')).toHaveLength(5);
    expect(document.body.textContent).not.toContain("yana kaydırabilirsiniz");
    expect(rule(products, ".manager")).toContain("container-type: inline-size");
    const narrow = products.slice(products.indexOf("@container (max-width: 927px)"));
    expect(narrow).toMatch(/\.scroll table \{[^}]*min-width: 0/);
    expect(narrow).toMatch(/\.scroll td::before \{[^}]*content: attr\(data-label\)/);
    // The headers stay on screen as sort pills: thead is laid out, never hidden.
    expect(narrow).toMatch(/\.scroll thead tr \{[^}]*display: flex/);
    expect(narrow).not.toMatch(/thead[^{]*\{[^}]*(?:display: none|clip-path)/);
  });
});

describe("Task206 step 7: no leftover v2 shapes", () => {
  const sheets = [
    "components/storefront/content/AboutPage.module.css", "components/storefront/content/DealershipPage.module.css",
    "components/storefront/content/Blog.module.css", "components/storefront/content/Content.module.css",
    "components/storefront/quote/QuoteComposer.module.css", "components/dealership/DealershipForm.module.css",
    "components/storefront/account/AccountSurface.module.css", "components/storefront/account/ServiceState.module.css",
    "components/account/Membership.module.css", "components/account/AccountSummary.module.css",
    "components/orders/Tracking.module.css", "components/site/InnerPage.module.css",
    "components/admin/AdminShell.module.css", "components/admin/Products.module.css",
    "components/ui/contact-fields.css", "components/ui/phone-country-search.css", "app/toptan-satis/page.module.css",
  ];

  it.each(sheets)("%s takes every corner from the radius table", path => {
    const radii = [...css(path).matchAll(/border-radius:\s*([^;}]+)/g)].map(match => match[1].trim());
    for (const radius of radii) {
      // Every part is a table token (a flat edge may be 0); a bare 0 or a pixel value is not.
      expect(radius, `${path}: ${radius}`).toMatch(/^(?:(?:var\(--sf-radius-(?:pill|card|field|round|hero|arch)\)|0|inherit)(?: |$))+$/);
      expect(radius, `${path}: ${radius}`).not.toMatch(/^[0 ]+$/);
    }
  });

  it("writes no long dash in the visible text of the changed pages", () => {
    for (const path of ["components/storefront/content/AboutPage.tsx", "components/storefront/content/DealershipPage.tsx", "components/storefront/content/LegalDocument.tsx", "app/not-found.tsx", "app/blog/page.tsx", "app/toptan-satis/page.tsx", "components/site/EmptyState.tsx"]) {
      const visible = css(path).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      expect(visible, path).not.toMatch(/[—–]/);
    }
  });
});
