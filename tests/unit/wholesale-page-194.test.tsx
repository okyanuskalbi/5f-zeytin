import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";

// Task208: the wholesale page is the "Toptan Satış" pill of the home page; `/toptan-satis` redirects there.
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: () => null }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); HTMLElement.prototype.scrollIntoView = originalScrollIntoView; history.replaceState(null, "", "/"); });

it("serves the truthful email draft form inside the wholesale section of the home page", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  const section = doc.querySelector("#toptan-bayilik")!;
  expect(section.querySelector("h2")?.textContent).toBe("Toptan & Bayilik");
  expect(section.textContent).toMatch(/otel, restoran, market ve toplu tüketim/i);
  expect(section.textContent).toContain("koli bazında");
  const form = section.querySelector<HTMLFormElement>('#toptan form[aria-label="Kurumsal teklif talebi"]')!;
  expect(form.getAttribute("method")).toBe("post");
  expect(form.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
  expect(form.querySelector('input[name="kvkk"][required]')).not.toBeNull();
  expect(section.textContent).toContain("Gönderimi e-posta uygulamanızda siz tamamlarsınız.");
});

it("keeps one buy action on every product card and moves quoting to the form's product picker", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  const cards = [...doc.querySelectorAll("[data-product-id]")];
  expect(cards).toHaveLength((await getProducts()).length);
  for (const card of cards) {
    expect(card.querySelector('a[href*="teklif="]')).toBeNull();
    expect(card.textContent).not.toContain("Teklife ekle");
  }
  expect(doc.querySelector('#toptan [name="productId"]')).not.toBeNull();
});

it("selects a known product query and keeps the existing incomplete-form errors without sending anything", async () => {
  history.replaceState(null, "", "/?sekme=toptan&teklif=sample-olive-oil-1l&kaynak=urun");
  HTMLElement.prototype.scrollIntoView = vi.fn();
  render(await Home());
  await waitFor(() => expect(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }).textContent).toContain("1 ürün"));
  expect(location.pathname).toBe("/");
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("urun");
  expect(new URL(location.href).searchParams.has("teklif")).toBe(false);
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Adınız veya firma adı" })));
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("kontrol"));
  expect(within(screen.getByRole("form", { name: "Kurumsal teklif talebi" })).getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
  expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull();
});
