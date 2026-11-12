import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import Article from "@/app/blog/[slug]/page";
import Kvkk from "@/app/kvkk/page";
import NotFound from "@/app/not-found";
import Unauthorized from "@/app/unauthorized";
import TrackingPage from "@/app/siparis-takip/page";
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
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search),
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));
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
const home = async (): Promise<Document> => parse(renderToStaticMarkup(await Home()));
const profile = { name: "Deniz Sofra", email: "deniz@example.test", phone: null };

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

// Task208: the about page is the #hikayemiz section of the home page. The moving strip (AboutStrip), the arch
// frame, the four production-stage cards and the page's own "Ürünleri İnceleyin" action were retired with it.
describe("Task206 step 1 → Task208: the story section of the home page", () => {
  it("Task208: heads the section with SectionHeading under the page's single h1 and shows the factory photograph on a card corner", async () => {
    const doc = await home();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    const story = doc.querySelector("#hikayemiz")!;
    expect(story.querySelector("[data-section-heading] h2")?.textContent).toBe("Nesillerin Emeği, Toprağın Bereketi");
    expect(story.querySelector("[data-home-facility] img")?.getAttribute("src")).toContain("/images/customer-home/fabrika-");
    expect(rule(css("components/storefront/StoreHome.module.css"), ".facilityPhoto")).toContain("border-radius: var(--sf-radius-card)");
  });

  it("Task208: carries exactly one still stamp on the whole page, with the customer's permitted claim, inside the story", async () => {
    const doc = await home();
    const stamps = doc.querySelectorAll("[data-stamp]");
    expect(stamps).toHaveLength(1);
    expect(stamps[0].getAttribute("aria-label")).toBe("%100 Doğal ve Katkısız");
    expect(stamps[0].closest("#hikayemiz")).not.toBeNull();
    // Still: no animation is ever attached to the seal.
    expect(css("components/storefront/ui/ui.module.css")).not.toMatch(/\.stamp[^{]*\{[^}]*animation/);
  });

  it("Task208: has no moving strip and no dark band; the page keeps a single sliding element nowhere", async () => {
    const doc = await home();
    expect(doc.querySelector("[data-about-strip]")).toBeNull();
    expect(doc.querySelector('[data-tone="dark"], main [data-surface="dark"]')).toBeNull();
    // Task208: the only keyframes are the one-time section arrival; nothing loops.
    const homeStyles = css("components/storefront/StoreHome.module.css");
    expect(homeStyles.match(/@keyframes [\w-]+/g)).toEqual(["@keyframes section-arrive"]);
    expect(homeStyles.match(/animation: [^;]+/g)).toEqual(["animation: section-arrive 280ms ease-out"]);
    expect(homeStyles).not.toMatch(/infinite/);
  });

  it("Task208: marks each value and harvest step with a medallion or the seal and rounds the FAQ rows to the field radius", async () => {
    const doc = await home();
    const story = doc.querySelector("#hikayemiz")!;
    expect(story.querySelectorAll("[data-story-values] > li")).toHaveLength(3);
    expect(story.querySelectorAll("[data-story-values] li [data-medallion]")).toHaveLength(2);
    expect(story.querySelectorAll("[data-story-values] li [data-stamp]")).toHaveLength(1);
    expect(story.querySelectorAll("[data-harvest-ledger] li [data-medallion]")).toHaveLength(3);
    expect(rule(css("components/storefront/content/StoreFaq.module.css"), ".answers details")).toContain("border-radius: var(--sf-radius-field)");
    // The section tells; the one products action stays in the hero.
    expect(story.querySelector("a")).toBeNull();
    expect([...doc.querySelectorAll('a[data-pill][href="/#urunler"]')].map(link => link.textContent)).toEqual(["Ürünleri İnceleyin"]);
  });
});

describe("Task206 step 2: wholesale and dealership", () => {
  // Task208: one sage section with a two-pill switch replaces the two page bands.
  it("Task208: opens wholesale and dealership in one sage section with a pill switch and a medallion note", async () => {
    const section = (await home()).querySelector("#toptan-bayilik")!;
    expect(section.querySelector("[data-section-heading] h2")?.textContent).toBe("Toptan & Bayilik");
    const pills = [...section.querySelectorAll('[role="radiogroup"][data-pill-switch] [role="radio"]')];
    expect(pills.map(pill => [pill.textContent, pill.getAttribute("aria-checked")])).toEqual([["Toptan Satış", "true"], ["Bayilik", "false"]]);
    expect(section.querySelector('[data-business-panel="toptan"] [data-medallion]')).not.toBeNull();
    expect(section.querySelector("picture")).toBeNull();
    expect(rule(css("components/storefront/StoreHome.module.css"), ".business")).toContain("background: var(--sf-sage)");
  });

  it("submits the quote with a full-width primary pill and draws fields to the form contract", async () => {
    const doc = await home();
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

  it("Task208: submits the dealership form, the only primary action of its pill, with a full-width pill", () => {
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

  // Task208: the list page is the home page's #blog section: three equal cards under an h2.
  it("Task208: shows three equal article cards on the home page and keeps the large/small card for the article pages", async () => {
    const blog = (await home()).querySelector("#blog")!;
    expect(blog.querySelector("[data-section-heading] h2")?.textContent).toBe("Zeytin Defteri");
    expect(blog.querySelectorAll("a")).toHaveLength(3);
    expect(blog.querySelectorAll("a picture img")).toHaveLength(3);
    expect(blog.querySelector("[data-pill]")).toBeNull();
    const article = parse(renderToStaticMarkup(await Article({ params: Promise.resolve({ slug: blogPosts[0].slug }) })));
    expect(article.querySelectorAll('[data-blog-card][data-blog-size="small"]')).toHaveLength(blogPosts.length - 1);
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
    // Task208: the products are a section of the home page.
    expect(doc.querySelector('a[data-pill][href="/#urunler"]')?.textContent).toBe("Ürünleri İnceleyin");
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
    // Task208: the products are a section of the home page.
    const products = doc.querySelector('a[data-pill][href="/#urunler"]')!;
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
    // Task208: the about, dealership and wholesale page sheets were retired; the landing sheets take their place.
    "components/storefront/StoreHome.module.css", "components/storefront/content/StoreFaq.module.css", "components/storefront/Navigation.module.css",
    "components/storefront/content/Blog.module.css", "components/storefront/content/Content.module.css",
    "components/storefront/quote/QuoteComposer.module.css", "components/dealership/DealershipForm.module.css",
    "components/storefront/account/AccountSurface.module.css", "components/storefront/account/ServiceState.module.css",
    "components/account/Membership.module.css", "components/account/AccountSummary.module.css",
    "components/orders/Tracking.module.css", "components/site/InnerPage.module.css",
    "components/admin/AdminShell.module.css", "components/admin/Products.module.css",
    "components/ui/contact-fields.css", "components/ui/phone-country-search.css",
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
    for (const path of ["components/storefront/StoreHome.tsx", "components/storefront/home/BusinessTabs.tsx", "components/storefront/home/ProductShowcase.tsx", "components/storefront/home/DeferredDealershipForm.tsx", "components/storefront/StoreFooter.tsx", "components/storefront/StoreMenu.tsx", "components/storefront/site-sections.ts", "components/storefront/content/LegalDocument.tsx", "app/not-found.tsx", "components/site/EmptyState.tsx"]) {
      const visible = css(path).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      expect(visible, path).not.toMatch(/[—–]/);
    }
  });
});
