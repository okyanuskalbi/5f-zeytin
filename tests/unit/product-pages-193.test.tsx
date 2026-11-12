import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { familySlugs, getFamilyBySlug, legacyProductRoutes, productHref } from "@/lib/catalog/product-pages";
import Page, { dynamicParams, generateMetadata, generateStaticParams, revalidate } from "@/app/urun/[slug]/page";
import { ProductDetail as ProductPage } from "@/components/storefront/ProductDetail";
import { CartProvider } from "@/components/cart/CartProvider";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} })));
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState(null, "", "/"); vi.unstubAllGlobals(); });

it("maps every original SKU to a single family page and an explicit size without changing the catalogue", async () => {
  const products = await getProducts();
  expect(Object.keys(familySlugs)).toHaveLength(4);
  expect(Object.entries(legacyProductRoutes)).toEqual(products.map(product => [product.id, productHref(product)]));
  expect(getFamilyBySlug(await getProductFamilies(), "unknown")).toBeUndefined();
});

it("generates four cached static pages with unknown slugs closed", async () => {
  expect(revalidate).toBe(300); expect(dynamicParams).toBe(false);
  expect(await generateStaticParams()).toEqual(Object.values(familySlugs).map(slug => ({ slug })));
  await expect(Page({ params: Promise.resolve({ slug: "unknown" }) })).rejects.toThrow("NEXT_NOT_FOUND");
});

it.each(Object.values(familySlugs))("serves %s with one title, canonical, noindex and breadcrumbs without commercial schema", async slug => {
  const family = getFamilyBySlug(await getProductFamilies(), slug)!;
  const params = Promise.resolve({ slug });
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Page({ params })), "text/html");
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector("h1")?.textContent).toBe(family.name);
  expect(await generateMetadata({ params })).toMatchObject({ alternates: { canonical: `/urun/${slug}?boy=${encodeURIComponent(family.variants[0].weight)}` }, robots: { index: false, follow: true } });
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!));
  expect(schemas.map(item => item["@type"])).toEqual(["BreadcrumbList"]);
  expect(schemas[0].itemListElement.at(-1).item).toBe(`https://afinazeytin.com/urun/${slug}`);
  // Task208: the trail leads to the home page's product section and to the family's category pill; no retired address remains.
  expect(doc.querySelector('nav[aria-label="İçerik yolu"] a[href="/#urunler"]')?.textContent).toBe("Ürünler");
  expect(doc.querySelector(`nav[aria-label="İçerik yolu"] a[href="/?kategori=${family.groupId}#urunler"]`)).not.toBeNull();
  expect(doc.querySelector('a[href^="/urunler"], a[href^="/toptan-satis"]')).toBeNull();
  expect(schemas[0].itemListElement[1]).toMatchObject({ name: "Ürünler", item: "https://afinazeytin.com/#urunler" });
  expect(schemas[0].itemListElement.at(-2).item).toBe(`https://afinazeytin.com/?kategori=${family.groupId}#urunler`);
  for (const entry of schemas[0].itemListElement) expect(entry.item).not.toMatch(/\/urunler(\/|$)/);
  expect(doc.body.textContent).toContain("Benzer Ürünler");
  expect(doc.body.textContent).not.toMatch(/kişi inceliyor|Ayvalık|Köklü/);
  const main = doc.querySelector("[data-product-page]")!;
  const related = [...doc.querySelectorAll('section[aria-labelledby="benzer-title"] [data-product-id]')];
  expect(related.length).toBe(4);
  expect(related.map(item => item.getAttribute("data-product-id"))).not.toContain(main.getAttribute("data-product-id"));
  expect(new Set(related.map(item => item.getAttribute("data-product-id"))).size).toBe(4);
  if (family.category === "zeytinyagi") {
    expect(related[0].getAttribute("data-category")).toBe("zeytinyagi");
    expect(related.slice(1).every(item => item.getAttribute("data-category") !== "zeytinyagi")).toBe(true);
  } else {
    expect(related.slice(0, 3).every(item => item.getAttribute("data-category") !== "zeytinyagi")).toBe(true);
    expect(related[3].getAttribute("data-category")).toBe("zeytinyagi");
  }
});

it("updates related products for the live size, excludes the current SKU and deduplicates its available pool", async () => {
  const families = await getProductFamilies();
  const family = families.find(item => item.id === "naturel-sizma")!;
  const products = families.flatMap(item => item.variants);
  history.replaceState(null, "", "/urun/naturel-sizma-zeytinyagi?boy=5%20L");
  const { container } = render(<ProductPage family={family} related={[...products, ...products]} />);
  const ids = () => [...container.querySelectorAll('section[aria-labelledby="benzer-title"] [data-product-id]')].map(node => node.getAttribute("data-product-id"));
  expect(ids()).toHaveLength(4);
  expect(ids()[0]).toBe("sample-olive-oil-1l");
  expect(ids()).not.toContain("sample-olive-oil-5l");
  expect(new Set(ids()).size).toBe(4);
  fireEvent.click(screen.getByRole("radio", { name: "1 L" }));
  expect(ids()[0]).toBe("sample-olive-oil-5l");
  expect(ids()).not.toContain("sample-olive-oil-1l");
  expect(ids()).toHaveLength(4);
});

it("hides the whole related section when its only supplied product is the current SKU", async () => {
  const family = (await getProductFamilies()).find(item => item.id === "salamura-siyah")!;
  const { container } = render(<ProductPage family={family} related={[family.variants[0]]} />);
  expect(screen.queryByRole("heading", { name: "Benzer Ürünler" })).toBeNull();
  expect(container.querySelector('section[aria-labelledby="benzer-title"]')).toBeNull();
});

it("reads a directly linked size, resets quantity on size change and adds the selected SKU", async () => {
  const families = await getProductFamilies();
  const family = families.find(item => item.id === "naturel-sizma")!;
  const products = families.flatMap(item => item.variants);
  history.replaceState({ keep: true }, "", "/urun/naturel-sizma-zeytinyagi?boy=5%20L&kaynak=test");
  render(<CartProvider products={products}><ProductPage family={family} related={[]} /></CartProvider>);
  const article = within(screen.getByRole("article"));
  expect(article.getByRole("radio", { name: "5 L" }).getAttribute("aria-checked")).toBe("true");
  expect(article.getByLabelText("Fiyat").textContent).toContain("1.750");
  fireEvent.click(article.getByRole("button", { name: "Adedi artır" }));
  fireEvent.click(article.getByRole("radio", { name: "1 L" }));
  expect(article.getByLabelText("Adet").textContent).toBe("1");
  expect(new URL(location.href).searchParams.get("boy")).toBe("1 L");
  expect(history.state).toEqual({ keep: true });
  expect(new URL(location.href).searchParams.get("kaynak")).toBe("test");
  fireEvent.click(article.getByRole("button", { name: "Sepete ekle" }));
  expect(JSON.parse(localStorage.getItem("afina-zeytin:cart") ?? "null")).toEqual([{ productId: "sample-olive-oil-1l", quantity: 1 }]);
  // Task208: quoting opens the wholesale pill of the home page with the product chosen.
  expect(article.getByRole("link", { name: "Teklife ekle" }).getAttribute("href")).toBe("/?sekme=toptan&teklif=sample-olive-oil-1l#toptan-bayilik");
});
