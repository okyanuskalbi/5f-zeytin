import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import Home from "@/app/page";
import { getProductFamilies } from "@/lib/catalog/static-products";

vi.mock("@/lib/catalog/read", () => ({ readProductFamilies: () => getProductFamilies() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams(window.location.search), usePathname: () => "/" }));

// Task208: one landing page; every product once, the forms, questions and contact are sections of it.
it("serves the customer's ordered light storefront with one honest product grid and section destinations", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  expect([...doc.querySelectorAll("[data-home-section]")].map(node => node.getAttribute("data-home-section"))).toEqual([
    "hero", "products", "story", "business", "blog", "contact",
  ]);
  expect(doc.querySelectorAll("h1")).toHaveLength(1);
  expect(doc.querySelector('#baslangic a[href="/#urunler"]')?.textContent).toContain("Ürünleri İnceleyin");
  expect(doc.querySelectorAll("#baslangic a")).toHaveLength(1);
  expect(doc.querySelector('#baslangic a[href*="toptan"]')).toBeNull();
  const ids = [...doc.querySelectorAll("[data-product-id]")].map(item => item.getAttribute("data-product-id"));
  expect(ids).toHaveLength((await getProductFamilies()).flatMap(family => family.variants).length);
  expect(new Set(ids).size).toBe(ids.length);
  expect(doc.querySelectorAll('[data-home-section="products"] [data-product-id]')).toHaveLength(ids.length);
  expect(doc.querySelector('[data-home-section="featured"]')).toBeNull();
  expect(doc.querySelectorAll('[data-home-section="blog"] a[href^="/blog/"]')).toHaveLength(3);
  const story = doc.querySelector('[data-home-section="story"]')!;
  expect(story.textContent).toContain("Afina Zeytin, her hasatta aynı özenle doğanın bereketini seçkin bir lezzete dönüştürür.");
  expect(story.querySelectorAll("[data-harvest-ledger] li")).toHaveLength(3);
  expect(story.querySelectorAll("[data-stamp]")).toHaveLength(1);
  expect(doc.querySelector("main")?.textContent).not.toMatch(/Ayvalık|Köklü|Doğallığın En Güzel Halleri|kişi inceliyor|İndirimdeki|aynı gün kargo|Müşteri Yorumları|500.000/);
  expect(doc.querySelector('[data-home-section="business"] img')).toBeNull();
  expect(doc.querySelectorAll("form")).toHaveLength(1);
  expect(doc.querySelector('[data-home-section="business"] form')).not.toBeNull();
  expect(doc.querySelector('[data-home-section="contact"] #sik-sorulanlar')).not.toBeNull();
  expect(doc.querySelector('section#iletisim[data-home-section="contact"]')).not.toBeNull();
});

it("makes the hero poster the eager server image and keeps autoplay video out of the first paint", async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await Home()), "text/html");
  const poster = doc.querySelector<HTMLImageElement>('#baslangic [data-hero-photo] img')!;
  expect(poster.getAttribute("src")).toContain("hero-poster");
  expect(poster.getAttribute("loading")).toBe("eager");
  expect(poster.getAttribute("fetchPriority")).toBe("high");
  expect(doc.querySelector("#baslangic video")).toBeNull();
  expect(doc.querySelector('[data-home-section="marquee"], [data-home-section="trust"]')).toBeNull();
});
