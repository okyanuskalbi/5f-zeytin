import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { MiniCart } from "@/components/cart/MiniCart";
import { BusinessTabs } from "@/components/storefront/home/BusinessTabs";
import { ProductShowcase } from "@/components/storefront/home/ProductShowcase";
import { ProductTile } from "@/components/storefront/ProductTile";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { getProductFamilies } from "@/lib/catalog/static-products";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => navigation.pathname, useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => ({
  state: { hydrated: true, items: [{ productId: "olive", quantity: 1 }] },
  products: [{ id: "olive", stock: 2, priceKurus: 12550 }], open: false, openCart: vi.fn(), store: { addItem: vi.fn() },
}) }));
vi.mock("@/components/account/MembershipDialogProvider", () => ({ useMembershipDialog: () => null }));

const PHONE_QUERY = "max-width: 767px";
const SCREENS = ["hero", "products", "story", "facility", "harvest", "business", "blog", "faq", "contact"];
const css = (path: string) => readFileSync(path, "utf8");
const address = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

/** jsdom has no layout: the phone is a media query answer. */
function viewport(phone: boolean): void {
  window.matchMedia = vi.fn((query: string) => ({
    matches: phone && query.includes(PHONE_QUERY), media: query,
    addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
/** The rules a phone gets: everything inside `@media (max-width: 767px)` blocks. */
function phoneRules(sheet: string): string {
  const blocks: string[] = [];
  for (let start = sheet.indexOf(`@media (${PHONE_QUERY})`); start !== -1; start = sheet.indexOf(`@media (${PHONE_QUERY})`, start + 1)) {
    let depth = 0, index = sheet.indexOf("{", start);
    const open = index;
    do { if (sheet[index] === "{") depth++; else if (sheet[index] === "}") depth--; index++; } while (depth > 0);
    blocks.push(sheet.slice(open + 1, index - 1));
  }
  return blocks.join("\n");
}
/** Everything outside the phone blocks: what a tablet or a desktop reads. */
function widerRules(sheet: string): string {
  let rest = sheet;
  for (let start = rest.indexOf(`@media (${PHONE_QUERY})`); start !== -1; start = rest.indexOf(`@media (${PHONE_QUERY})`)) {
    let depth = 0, index = rest.indexOf("{", start);
    do { if (rest[index] === "{") depth++; else if (rest[index] === "}") depth--; index++; } while (depth > 0);
    rest = rest.slice(0, start) + rest.slice(index);
  }
  return rest;
}

beforeEach(() => {
  navigation.pathname = "/";
  window.history.replaceState(null, "", "/");
  viewport(false);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

async function homeDocument(): Promise<Document> { return new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html"); }

describe("Task209 phone screens", () => {
  it("marks the nine blocks of the page in order, without splitting the story section", async () => {
    const page = await homeDocument();
    expect([...page.querySelectorAll("[data-phone-screen]")].map(block => block.getAttribute("data-phone-screen"))).toEqual(SCREENS);
    expect(page.querySelectorAll("[data-landing-section]")).toHaveLength(6);
    const story = page.querySelector("#hikayemiz")!;
    for (const name of ["story", "facility", "harvest"]) expect(story.querySelector(`[data-phone-screen="${name}"]`), name).not.toBeNull();
    expect(page.querySelector('#iletisim [data-phone-screen="faq"] #sik-sorulanlar')).not.toBeNull();
  });

  it("marks the footer as the tenth block", () => {
    render(<StoreFooter />);
    expect(screen.getByRole("contentinfo").getAttribute("data-phone-screen")).toBe("footer");
  });

  it("has no scrolling text strip, on any width", async () => {
    const page = await homeDocument();
    expect(page.querySelector("marquee, [data-marquee], [data-ticker]")).toBeNull();
    expect([...page.querySelectorAll("[class]")].some(node => /marquee|ticker/i.test(node.getAttribute("class") ?? ""))).toBe(false);
    for (const file of ["components/storefront/StoreHome.module.css", "components/storefront/Navigation.module.css", "app/globals.css"]) expect(css(file), file).not.toMatch(/marquee|ticker/i);
  });

  it("shows no mini cart bar on the home page of a phone, even with a full cart", () => {
    viewport(true);
    const view = render(<MiniCart />);
    expect(screen.queryByRole("complementary", { name: "Mini sepet" })).toBeNull();
    expect(view.container.childElementCount).toBe(0);
  });

  it("never snaps the page from block to block", () => {
    for (const file of ["components/storefront/StoreHome.module.css", "components/storefront/Navigation.module.css", "app/globals.css"]) {
      expect(css(file), file).not.toMatch(/scroll-snap-type:\s*(y|both|block)/);
      expect(css(file), file).not.toMatch(/animation-timeline|scroll-timeline/);
    }
  });
});

describe("Task209 product shelf", () => {
  async function shelf() {
    const families = await getProductFamilies();
    const items = families.flatMap(family => family.variants.map(product => ({ id: product.id, groups: [family.groupId], tile: <ProductTile product={product} /> })));
    render(<ProductShowcase items={items} />);
    return items;
  }

  it("turns the grid into a sideways shelf on a phone only", () => {
    const home = css("components/storefront/StoreHome.module.css");
    const phone = phoneRules(home).match(/\.productGrid \{[^}]*\}/)?.[0] ?? "";
    expect(phone).toMatch(/overflow-x: auto/);
    expect(phone).toMatch(/scroll-snap-type: x mandatory/);
    expect(phoneRules(home)).toMatch(/\.productCell \{[^}]*scroll-snap-align: start/);
    expect(widerRules(home)).not.toMatch(/scroll-snap|overflow-x/);
  });

  it("names the shelf and lets the keyboard reach every card on it", async () => {
    const items = await shelf();
    const list = screen.getByRole("list", { name: "Ürünler" });
    const cards = within(list).getAllByRole("listitem");
    expect(cards).toHaveLength(items.length);
    for (const card of cards) {
      expect(card.querySelector("a[href]"), "link").not.toBeNull();
      expect(card.querySelector("button"), "button").not.toBeNull();
      expect(card.querySelector('[tabindex="-1"]')).toBeNull();
    }
  });

  it("keeps the category pills over the shelf", async () => {
    await shelf();
    fireEvent.click(screen.getByRole("radio", { name: "Zeytinyağı" }));
    expect(within(screen.getByRole("list", { name: "Ürünler" })).getAllByRole("listitem").length).toBeGreaterThan(0);
    expect(window.location.search).toBe("?kategori=zeytinyagi");
  });
});

describe("Task209 wholesale and dealership on a phone", () => {
  const tabs = () => render(<section id="toptan-bayilik"><BusinessTabs
    wholesale={<div id="toptan"><span id="teklif" /><label>Firma<input name="firma" /></label><p>Teklif formu</p></div>}
    dealership={<div id="basvuru"><p>Bayilik formu</p></div>} /></section>);
  const sheet = (name: string) => screen.findByRole("dialog", { name });

  beforeEach(() => viewport(true));

  it("offers two cards and opens nothing by itself", () => {
    tabs();
    const cards = [...document.querySelectorAll("[data-business-card]")];
    expect(cards.map(card => within(card as HTMLElement).getByRole("heading", { level: 3 }).textContent)).toEqual(["Toptan Satış", "Bayilik"]);
    expect(cards.map(card => within(card as HTMLElement).getByRole("button").textContent)).toEqual(["Teklif iste", "Başvuru yap"]);
    for (const card of cards) expect(card.querySelector("[data-medallion]")).not.toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the wholesale form in a sheet from its card, moving the one form instead of copying it", async () => {
    tabs();
    const form = document.getElementById("toptan")!;
    fireEvent.click(screen.getByRole("button", { name: "Teklif iste" }));
    const dialog = await sheet("Toptan teklif formu");
    await waitFor(() => expect(dialog.contains(form)).toBe(true));
    expect(document.querySelectorAll("#toptan")).toHaveLength(1);
    expect(document.querySelectorAll("#teklif")).toHaveLength(1);
    expect(document.querySelectorAll('input[name="firma"]')).toHaveLength(1);
    expect(screen.getByText("Teklif formu").closest("[hidden]")).toBeNull();
    expect(address()).toBe("/?sekme=toptan#toptan-bayilik");
  });

  it("opens the dealership form from its card and hides the wholesale one", async () => {
    tabs();
    fireEvent.click(screen.getByRole("button", { name: "Başvuru yap" }));
    const dialog = await sheet("Bayilik başvurusu");
    await waitFor(() => expect(within(dialog).getByText("Bayilik formu")).toBeTruthy());
    expect(document.querySelectorAll("#basvuru")).toHaveLength(1);
    expect(screen.getByText("Teklif formu").closest("[hidden]")).not.toBeNull();
    expect(address()).toBe("/?sekme=bayilik#toptan-bayilik");
  });

  it("closes with Escape, puts the form back, returns focus to the card and keeps what was typed", async () => {
    tabs();
    const section = document.getElementById("toptan-bayilik")!;
    const field = section.querySelector<HTMLInputElement>('input[name="firma"]')!;
    const opener = screen.getByRole("button", { name: "Teklif iste" });
    fireEvent.click(opener);
    const dialog = await sheet("Toptan teklif formu");
    await waitFor(() => expect(dialog.contains(field)).toBe(true));
    fireEvent.change(field, { target: { value: "Ellek Lokantası" } });
    fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(section.contains(field)).toBe(true);
    expect(field.value).toBe("Ellek Lokantası");
    expect(address()).toBe("/");
    await waitFor(() => expect(document.activeElement).toBe(opener));
    fireEvent.click(opener);
    const again = await sheet("Toptan teklif formu");
    await waitFor(() => expect(again.contains(field)).toBe(true));
    expect(field.value).toBe("Ellek Lokantası");
  });

  it("closes with its own button, a 44 px target with a name", async () => {
    tabs();
    fireEvent.click(screen.getByRole("button", { name: "Başvuru yap" }));
    const dialog = await sheet("Bayilik başvurusu");
    fireEvent.click(within(dialog).getByRole("button", { name: "Pencereyi kapat" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const styles = css("components/ui/sheet.module.css");
    expect(styles).toMatch(/\.close \{[^}]*width: 44px;[^}]*height: 44px/);
  });

  it("closes when the visitor goes back", async () => {
    tabs();
    fireEvent.click(screen.getByRole("button", { name: "Teklif iste" }));
    await sheet("Toptan teklif formu");
    window.history.back();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(address()).toBe("/");
  });

  it.each([
    ["/?sekme=bayilik#toptan-bayilik", "Bayilik başvurusu"],
    ["/?sekme=toptan#toptan-bayilik", "Toptan teklif formu"],
    ["/#toptan", "Toptan teklif formu"],
    ["/#teklif", "Toptan teklif formu"],
    ["/#basvuru", "Bayilik başvurusu"],
    ["/?sekme=bayilik&teklif=sample-olive-oil-1l#toptan-bayilik", "Toptan teklif formu"],
  ])("opens the right sheet when the address is %s", async (path, title) => {
    window.history.replaceState(null, "", path);
    tabs();
    expect(await sheet(title)).toBeTruthy();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("leaves a tidy address behind when a sheet opened by a link is closed", async () => {
    window.history.replaceState(null, "", "/?kategori=zeytin&sekme=bayilik#basvuru");
    tabs();
    const dialog = await sheet("Bayilik başvurusu");
    fireEvent.click(within(dialog).getByRole("button", { name: "Pencereyi kapat" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(address()).toBe("/?kategori=zeytin#toptan-bayilik");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Başvuru yap" })));
  });

  it("styles the sheet in the storefront's own tokens and keeps it still for reduced motion", () => {
    expect(existsSync("components/ui/sheet.module.css")).toBe(true);
    const styles = css("components/ui/sheet.module.css");
    expect(styles).toMatch(/background: var\(--sf-ivory\)/);
    expect(styles).toMatch(/font-family: var\(--font-display\)/);
    expect(styles).toMatch(/background: var\(--sf-gold\)/);
    expect(styles).toMatch(/100dvh/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^}]*\{[^}]*animation: none/);
    expect(styles).not.toMatch(/[—–]/);
  });
});

describe("Task209 wholesale and dealership on wider screens", () => {
  it("keeps the two pills and opens no sheet, whatever the address says", () => {
    window.history.replaceState(null, "", "/?sekme=bayilik#toptan-bayilik");
    render(<BusinessTabs wholesale={<p>Teklif formu</p>} dealership={<p>Bayilik formu</p>} />);
    expect(screen.getByRole("radio", { name: "Bayilik" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("Bayilik formu").closest("[hidden]")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the cards to phones only and the pills to everyone else", () => {
    const home = css("components/storefront/StoreHome.module.css");
    expect(widerRules(home)).toMatch(/\.businessChooser \{ display: none; \}/);
    expect(phoneRules(home)).toMatch(/\.businessChooser \{[^}]*display: grid/);
    expect(phoneRules(home)).toMatch(/\.businessHead \[data-pill-switch\] \{ display: none; \}/);
    expect(phoneRules(home)).toMatch(/\.businessSlot \{ display: none; \}/);
  });

  it("carries one quote form and one of each form anchor on the home page", async () => {
    const page = await homeDocument();
    const section = page.querySelector("#toptan-bayilik")!;
    expect(section.querySelectorAll('form[aria-label="Kurumsal teklif talebi"]')).toHaveLength(1);
    expect(page.querySelectorAll("#toptan")).toHaveLength(1);
    expect(page.querySelectorAll("#teklif")).toHaveLength(1);
    expect(section.querySelectorAll("[data-business-card]")).toHaveLength(2);
    expect(section.querySelectorAll('[data-variant="primary"], [data-variant="gold"]').length).toBeLessThanOrEqual(1);
    expect(page.querySelector('[role="dialog"]')).toBeNull();
  });
});

describe("Task209 footer", () => {
  const groups = () => [...screen.getByRole("contentinfo").querySelectorAll<HTMLElement>("[data-footer-links] > section")];

  it("is unchanged on wider screens: three headings, every link, no toggle", () => {
    render(<StoreFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getAllByRole("heading", { level: 2 }).map(heading => heading.textContent)).toEqual(["Ürünler", "Kurumsal", "Yardım"]);
    expect(footer.querySelector("[data-footer-links] button")).toBeNull();
    expect(footer.querySelectorAll("[data-footer-links] a").length).toBeGreaterThanOrEqual(15);
  });

  it("folds the three link groups on a phone and opens one at a time", () => {
    viewport(true);
    render(<StoreFooter />);
    const footer = screen.getByRole("contentinfo");
    const toggles = within(footer).getAllByRole("button");
    expect(toggles.map(toggle => toggle.textContent)).toEqual(["Ürünler", "Kurumsal", "Yardım"]);
    expect(toggles.map(toggle => toggle.getAttribute("aria-expanded"))).toEqual(["false", "false", "false"]);
    for (const toggle of toggles) expect(toggle.closest("h2")).not.toBeNull();
    fireEvent.click(toggles[1]);
    expect(toggles.map(toggle => toggle.getAttribute("aria-expanded"))).toEqual(["false", "true", "false"]);
    expect(groups().map(group => group.hasAttribute("data-open"))).toEqual([false, true, false]);
    expect(document.getElementById(toggles[1].getAttribute("aria-controls")!)?.querySelector('a[href="/#hikayemiz"]')).not.toBeNull();
    fireEvent.click(toggles[2]);
    expect(toggles.map(toggle => toggle.getAttribute("aria-expanded"))).toEqual(["false", "false", "true"]);
    fireEvent.click(toggles[2]);
    expect(toggles.map(toggle => toggle.getAttribute("aria-expanded"))).toEqual(["false", "false", "false"]);
  });

  it("keeps every link, the legal pages and the payment logos within reach on a phone", () => {
    viewport(true);
    render(<StoreFooter />);
    const footer = screen.getByRole("contentinfo");
    const hrefs = [...footer.querySelectorAll("[data-footer-links] a")].map(link => link.getAttribute("href"));
    for (const href of ["/?kategori=zeytinyagi#urunler", "/#hikayemiz", "/?sekme=toptan#toptan-bayilik", "/?sekme=bayilik#toptan-bayilik", "/#blog", "/#iletisim", "/hesabim", "/siparis-takip", "/iade", "/kvkk", "/mesafeli-satis"]) expect(hrefs, href).toContain(href);
    expect(within(footer).getByRole("group", { name: "Güvenli ödeme" })).toBeTruthy();
    const navigation = css("components/storefront/Navigation.module.css");
    expect(phoneRules(navigation)).toMatch(/\.footerGroups section:not\(\[data-open\]\) > nav \{ display: none; \}/);
    expect(widerRules(navigation)).not.toMatch(/data-open/);
  });

  it("shows the links without script", () => {
    const markup = renderToStaticMarkup(<StoreFooter />);
    expect(markup).toMatch(/<noscript><style>[^<]*data-footer-links[^<]*<\/style><\/noscript>/);
    expect(markup).not.toContain("<button");
  });
});
