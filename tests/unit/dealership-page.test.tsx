import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { parse } from "postcss";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

// Task208: the dealership page is the "Bayilik" pill of the home page's #toptan-bayilik section
// (`/bayilik` redirects to `/?sekme=bayilik#toptan-bayilik`). The profile cards, the "Neden AFİNA ZEYTİN?"
// facts with packaging cutouts and the page's own H1 and anchors were retired with the page.
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));

beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }); });
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); });

const homeCss = parse(readFileSync("components/storefront/StoreHome.module.css", "utf8"));
function declarations(selector: string): Record<string, string> {
  const found: Record<string, string> = {};
  homeCss.walkRules(selector, rule => { if (rule.parent?.type === "root") rule.walkDecls(decl => { found[decl.prop] = decl.value; }); });
  return found;
}
async function openDealership() {
  history.replaceState(null, "", "/?sekme=bayilik#toptan-bayilik");
  const view = render(await Home());
  return { ...view, panel: screen.getByRole("group", { name: "Bayilik" }) };
}

it("Task208: introduces dealership inside the home section, under the page's single H1", async () => {
  const { container, panel } = await openDealership();
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 2, name: "Toptan & Bayilik" }).closest("#toptan-bayilik")).not.toBeNull();
  expect(screen.getByRole("radio", { name: "Bayilik" }).getAttribute("aria-checked")).toBe("true");
  expect(panel.closest("[hidden]")).toBeNull();
  expect(within(panel).getByText("AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın.")).toBeTruthy();
  expect(document.querySelector('[data-business-panel="toptan"]')?.hasAttribute("hidden")).toBe(true);
  // One way into the form and no second products button: the pill opens the panel, the menu owns the rest.
  expect(panel.querySelector('a[href="#basvuru"], a[href="/urunler"], a[href="/#urunler"]')).toBeNull();
  expect(container.querySelector("#toptan-bayilik video, #toptan-bayilik canvas")).toBeNull();
});

it("Task208: keeps the dealership panel on a light surface without a photograph or dark overlay", async () => {
  const { panel } = await openDealership();
  const section = panel.closest("section")!;
  expect(section.id).toBe("toptan-bayilik");
  expect(section.getAttribute("data-surface")).not.toBe("dark");
  expect(section.getAttribute("data-tone")).not.toBe("dark");
  expect(panel.querySelector("picture")).toBeNull();
  expect(declarations(".business").background).toBe("var(--sf-sage)");
  expect(declarations(".dealershipForm").background).toBe("var(--sf-paper)");
  expect(declarations(".businessCard > p").color).toBe("var(--sf-ink)");
});

it("Task208: explains the application in a real three-step ordered list", async () => {
  const { panel } = await openDealership();
  const list = within(panel).getByRole("list");
  expect(list.tagName).toBe("OL");
  const steps = within(list).getAllByRole("listitem");
  expect(steps).toHaveLength(3);
  expect(steps.map(step => step.querySelector("strong")?.textContent)).toEqual([
    "Formu doldurun", "Size dönüş yapalım", "Koşulları birlikte belirleyelim",
  ]);
  expect(steps.map(step => step.querySelector("span")?.textContent)).toEqual([
    "Firma ve bölge bilgilerinizi girin. Hazırlanan taslağı e-posta uygulamanızdan gönderin.",
    "Başvurunuzu inceledikten sonra sizinle iletişime geçeriz.",
    "Ürün, miktar ve sevkiyat planını birlikte netleştiririz.",
  ]);
  expect(panel.textContent).not.toMatch(/₺|fiyat|indirim|kâr marjı|bölge sözü|sertifika|Türkiye geneli|başvurunuz alındı/i);
});

it("Task208: provides the named application anchor and loads the separate, unchanged form when the pill is open", async () => {
  const { panel } = await openDealership();
  const anchor = panel.querySelector("#basvuru")!;
  expect(anchor).not.toBeNull();
  const form = await within(anchor as HTMLElement).findByRole("form", { name: "Bayilik başvurusu" });
  expect(within(form).getByRole("button", { name: "Başvuru E-postasını Hazırla" })).toBeTruthy();
  expect(within(anchor as HTMLElement).getByText(/e-posta taslağını hazırlar/i)).toBeTruthy();
  expect(form.querySelector('input[name="kvkk"][required]')).not.toBeNull();
});

it("Task208: leaves the dealership form out of the first HTML and keeps what was typed when the visitor switches pills", async () => {
  const markup = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  expect(markup.querySelector('[data-business-panel="bayilik"]')?.hasAttribute("hidden")).toBe(true);
  expect(markup.querySelector('form[aria-label="Bayilik başvurusu"]')).toBeNull();
  expect(markup.querySelector('#toptan form[aria-label="Kurumsal teklif talebi"]')).not.toBeNull();

  render(await Home());
  expect(screen.getByRole("radio", { name: "Toptan Satış" }).getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByRole("radio", { name: "Bayilik" }));
  expect(new URLSearchParams(location.search).get("sekme")).toBe("bayilik");
  const panel = screen.getByRole("group", { name: "Bayilik" });
  const company = await within(panel).findByRole("textbox", { name: /Firma adı/ });
  fireEvent.change(company, { target: { value: "Ellek Şarküteri" } });
  expect((company as HTMLInputElement).value).toBe("Ellek Şarküteri");
  fireEvent.click(screen.getByRole("radio", { name: "Toptan Satış" }));
  expect(panel.hasAttribute("hidden")).toBe(true);
  expect(screen.getByRole("group", { name: "Toptan Satış" }).hasAttribute("hidden")).toBe(false);
  expect(new URLSearchParams(location.search).has("sekme")).toBe(false);
  fireEvent.click(screen.getByRole("radio", { name: "Bayilik" }));
  expect(panel.hasAttribute("hidden")).toBe(false);
  expect((within(panel).getByRole("textbox", { name: /Firma adı/ }) as HTMLInputElement).value).toBe("Ellek Şarküteri");
});
