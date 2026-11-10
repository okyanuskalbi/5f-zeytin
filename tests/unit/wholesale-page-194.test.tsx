import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Page, { metadata } from "@/app/toptan-satis/page";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); HTMLElement.prototype.scrollIntoView = originalScrollIntoView; history.replaceState(null, "", "/"); });

it("serves an indexable wholesale page with a truthful email draft form and ordered breadcrumb", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Page()), "text/html");
  expect(doc.querySelector("h1")?.textContent).toBe("Toptan Satış");
  expect(doc.body.textContent).toMatch(/otel, restoran, market ve toplu tüketim/i);
  expect(doc.body.textContent).toContain("Koli bazında");
  const form = doc.querySelector<HTMLFormElement>('form[aria-label="Kurumsal teklif talebi"]')!;
  expect(form.getAttribute("method")).toBe("post");
  expect(form.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
  expect(form.querySelector('input[name="kvkk"][required]')).not.toBeNull();
  expect(doc.body.textContent).toContain("Gönderimi e-posta uygulamanızda siz tamamlarsınız.");
  expect(metadata.alternates).toEqual({ canonical: "/toptan-satis" });
  expect(metadata.robots).toEqual({ index: true, follow: true });
  const schema = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@type"]).toBe("BreadcrumbList");
  expect(schema.itemListElement.map((item: {name:string}) => item.name)).toEqual(["Ana Sayfa", "Toptan Satış"]);
});

it("moves the form off the home page and directs every home quote card to the wholesale page", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  expect(doc.querySelector("#toptan, #teklif, form")).toBeNull();
  const cards = [...doc.querySelectorAll('[data-product-id]')];
  expect(cards).toHaveLength(8);
  for (const card of cards) {
    const links = [...card.querySelectorAll<HTMLAnchorElement>('a[href^="/toptan-satis?teklif="]')];
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toBe("Teklife ekle");
    expect(links[0].getAttribute("href")).toBe(`/toptan-satis?teklif=${card.getAttribute("data-product-id")}`);
  }
});

it("selects a known product query and keeps the existing incomplete-form errors without sending anything", async () => {
  history.replaceState(null, "", "/toptan-satis?teklif=sample-olive-oil-1l&kaynak=urun");
  HTMLElement.prototype.scrollIntoView = vi.fn();
  render(await Page());
  await waitFor(() => expect(screen.getByRole("button", { name: "İlgilendiğiniz ürünler" }).textContent).toContain("1 ürün"));
  expect(location.pathname).toBe("/toptan-satis");
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("urun");
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Adınız veya firma adı" })));
  fireEvent.click(screen.getByRole("button", { name: "Talep özetini hazırla" }));
  expect(screen.getByRole("alert").textContent).toContain("kontrol");
  expect(within(screen.getByRole("form", { name: "Kurumsal teklif talebi" })).getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
  expect(screen.queryByRole("link", { name: "E-postayla gönder" })).toBeNull();
});
