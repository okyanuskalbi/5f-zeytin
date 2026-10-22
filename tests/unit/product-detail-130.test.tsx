import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductDetailProvider } from "@/components/catalog/ProductDetailProvider";
import { Products } from "@/components/landing/Products";
import { Hero } from "@/components/landing/Hero";
import { MobileBuyBar } from "@/components/landing/MobileBuyBar";
import { CartProvider, useCart } from "@/components/cart/CartProvider";
import { getProductDetails } from "@/lib/catalog/product-details";
import { getProducts } from "@/lib/catalog/static-products";
import { CART_STORAGE_KEY } from "@/lib/cart/store";
import type { ProductVariant } from "@/types/catalog";

const media = new Map<string, MediaQueryList>();
const animation = vi.hoisted(() => ({ animate: vi.fn(), stop: vi.fn(), pause: vi.fn(), play: vi.fn() }));
vi.mock("motion/react-mini", () => ({ useAnimate: () => [useRef(null), animation.animate] }));
vi.mock("@/components/cart/MiniCart", () => ({ MiniCart: () => null }));
let width = 1440;
let reduced = true;

function setWidth(value: number): void {
  width = value;
  act(() => {
    for (const [query, list] of media) {
      Object.defineProperty(list, "matches", { configurable: true, value: query.includes("767px") ? width < 768 : reduced });
      list.dispatchEvent(new Event("change"));
    }
  });
}

beforeEach(() => {
  width = 1440; reduced = true; media.clear();
  animation.animate.mockReset().mockImplementation(() => Object.assign(Promise.resolve(), animation));
  animation.stop.mockClear();
  vi.stubGlobal("matchMedia", (query: string) => {
    if (!media.has(query)) {
      const list = new EventTarget() as MediaQueryList;
      Object.assign(list, { media: query, matches: query.includes("767px") ? width < 768 : reduced });
      media.set(query, list);
    }
    return media.get(query)!;
  });
});
afterEach(() => {
  cleanup(); localStorage.clear(); history.replaceState(null, "", "/");
  vi.unstubAllGlobals(); vi.restoreAllMocks();
});

const copy = [
  ["sample-green-olive-10kg", "Ellek, Düziçi'nde toplanan yeşil zeytinler geleneksel usulle kırılarak hazırlanır ve kendi tesisimizde tenekeye doldurulur. 10 kg teneke, kışlık kiler ve kalabalık sofralar için.", "10 kg", "teneke", "Sofralık zeytin"],
  ["sample-green-olive-1kg", "Aynı doğal kırma yeşil zeytin, günlük sofra için cam kavanozda. Kendi tesisimizde doldurulur.", "1 kg", "cam kavanoz", "Sofralık zeytin"],
  ["sample-black-olive-1kg", "Salamurada bekletilerek hazırlanan siyah zeytin, kahvaltı sofraları için 1 kg cam kavanozda. Kendi tesisimizde doldurulur.", "1 kg", "cam kavanoz", "Salamura zeytin"],
  ["sample-olive-oil-1l", "Natürel sızma zeytinyağı, sofra ve salata kullanımı için 1 litrelik cam şişede. Kendi tesisimizde doldurulur.", "1 L", "cam şişe", "Zeytinyağı"],
  ["sample-olive-oil-5l", "Natürel sızma zeytinyağı, mutfakta düzenli kullanım için 5 litrelik tenekede. Kendi tesisimizde doldurulur.", "5 L", "teneke", "Zeytinyağı"],
  ["sample-brined-green-olive-5kg", "Salamurada hazırlanan yeşil zeytin, kiler stoğu için 5 kg tenekede. Kendi tesisimizde doldurulur.", "5 kg", "teneke", "Salamura zeytin"],
] as const;

it.each(copy)("preserves the approved draft copy and six facts for %s", async (id, description, weight, packaging, category) => {
  const product = (await getProducts()).find(item => item.id === id)!;
  expect(getProductDetails(product)).toEqual({ description, information: [
    { label: "Net miktar", value: weight }, { label: "Ambalaj", value: packaging },
    { label: "Kategori", value: category }, { label: "Üretim yeri", value: "Ellek, Düziçi / Osmaniye" },
    { label: "Dolum", value: "Afina Zeytin tesisi" }, { label: "Kargo", value: "2–4 iş günü" },
  ] });
});

function Count() {
  const cart = useCart();
  return <output aria-label="Sepetteki adet">{cart?.state.items.reduce((sum, item) => sum + item.quantity, 0)}</output>;
}
async function mount(products?: readonly ProductVariant[], hero = false, mobileBar = false) {
  const catalog = products ?? await getProducts();
  const view = render(<CartProvider products={catalog}><ProductDetailProvider products={catalog}>
    <Count />{hero && <Hero products={catalog} />}<Products products={catalog} />
    {mobileBar && <MobileBuyBar product={catalog[0]} />}
  </ProductDetailProvider></CartProvider>);
  const product = catalog.find(item => item.id === "sample-green-olive-10kg") ?? catalog[0];
  const card = document.querySelector<HTMLElement>(`[data-product-id="${product.id}"]`)!;
  return { ...view, catalog, product, card };
}
async function openCard(kind: "name" | "image" = "name") {
  const view = await mount();
  const trigger = kind === "name" ? within(view.card).getByRole("heading").querySelector("button")!
    : within(view.card).getByRole("img").closest("button")!;
  fireEvent.click(trigger);
  return { ...view, trigger, dialog: await screen.findByRole("dialog") };
}

it.each(["name", "image"] as const)("opens from the card %s and focuses the title", async kind => {
  const { dialog, trigger } = await openCard(kind);
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(within(dialog).getByRole("heading").textContent).toBe("Doğal Kırma Yeşil Zeytin");
  expect(within(dialog).getByText(copy[0][1])).toBeDefined();
  expect(within(dialog).getByRole("table", { name: "Ürün bilgileri" }).querySelectorAll("tr")).toHaveLength(6);
  await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("heading")));
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("adds from the card without opening details or the cart drawer", async () => {
  const { card } = await mount();
  fireEvent.click(within(card).getByRole("button", { name: "Sepete ekle" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(location.search).toBe("");
  expect(screen.getByLabelText("Sepetteki adet").textContent).toBe("1");
});

it("opens the hero's currently selected size from its product name", async () => {
  await mount(undefined, true);
  const hero = document.querySelector<HTMLElement>("[data-hero-card]")!;
  fireEvent.click(within(hero).getByRole("radio", { name: "1 kg" }));
  fireEvent.click(within(hero).getByRole("heading").querySelector("button")!);
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText(copy[1][1])).toBeDefined();
  expect(new URL(location.href).searchParams.get("urun")).toBe("sample-green-olive-1kg");
});

it.each([375, 390, 767, 768, 1440])("uses Sheet below 768 and Dialog from 768 at %ipx", async viewport => {
  setWidth(viewport);
  const { dialog } = await openCard();
  expect(dialog.getAttribute("data-slot")).toBe(viewport < 768 ? "sheet-content" : "dialog-content");
  expect(within(dialog).getAllByRole("button", { name: "Sepete ekle" })).toHaveLength(1);
});

describe.each([
  ["sample-green-olive-1kg", "10 kg", "sample-green-olive-10kg"],
  ["sample-olive-oil-1l", "5 L", "sample-olive-oil-5l"],
] as const)("family selection from %s", (id, size, nextId) => {
  it("switches only within its family, updates price, resets quantity and adds the selected quantity", async () => {
    history.replaceState(null, "", `/?urun=${id}`);
    const { catalog } = await mount();
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(within(dialog).getByRole("button", { name: "Adedi artır" }));
    fireEvent.click(within(dialog).getByRole("radio", { name: size }));
    const selected = catalog.find(item => item.id === nextId)!;
    expect(within(dialog).getByLabelText("Fiyat").textContent).toBe(new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(selected.priceKurus / 100));
    expect(within(dialog).getByLabelText("Adet").textContent).toBe("1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Adedi artır" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Sepete ekle" }));
    expect(within(dialog).getByRole("button", { name: "Eklendi ✓" })).toBeDefined();
    expect(screen.getByLabelText("Sepetteki adet").textContent).toBe("2");
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual([{ productId: nextId, quantity: 2 }]);
    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(new URL(location.href).searchParams.get("urun")).toBe(nextId);
  });
});

it("honors remaining stock including the cart and refuses another purchase when full", async () => {
  const catalog = (await getProducts()).map(product => ({ ...product, stock: 3 }));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ productId: catalog[0].id, quantity: 1 }]));
  history.replaceState(null, "", `/?urun=${catalog[0].id}`);
  await mount(catalog);
  const dialog = await screen.findByRole("dialog");
  const increase = within(dialog).getByRole("button", { name: "Adedi artır" });
  expect(within(dialog).getByRole("button", { name: "Adedi azalt" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(increase);
  expect(increase.hasAttribute("disabled")).toBe(true);
  fireEvent.click(increase);
  expect(within(dialog).getByLabelText("Adet").textContent).toBe("2");
  fireEvent.click(within(dialog).getByRole("button", { name: "Sepete ekle" }));
  expect(screen.getByLabelText("Sepetteki adet").textContent).toBe("3");
  expect(within(dialog).getByRole("button", { name: "Eklendi ✓" }).hasAttribute("disabled")).toBe(true);
});

it("shows unavailable stock with a disabled CTA and no quantity selector", async () => {
  history.replaceState(null, "", "/?urun=sample-black-olive-1kg");
  await mount();
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("button", { name: "Mevcut değil" }).hasAttribute("disabled")).toBe(true);
  expect(within(dialog).queryByLabelText("Adet")).toBeNull();
  expect(within(dialog).queryByRole("radiogroup")).toBeNull();
});

it("loads only studio and scene gallery images lazily and switches the large image", async () => {
  const { dialog } = await openCard();
  const main = dialog.querySelector<HTMLImageElement>("[data-product-detail-image] img")!;
  expect(main.getAttribute("src")).toContain("studyo");
  expect([...dialog.querySelectorAll("img")].every(image => image.getAttribute("loading") === "lazy")).toBe(true);
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  expect(main.getAttribute("src")).toContain("sahne");
  expect(within(dialog).getByRole("button", { name: "Sofra görseli" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(within(dialog).getByRole("button", { name: "Stüdyo görseli" }));
  expect(main.getAttribute("src")).toContain("studyo");
  expect(within(dialog).getByText("Güvenli Ödeme")).toBeDefined();
  expect(within(dialog).getByRole("img", { name: "Visa" })).toBeDefined();
  expect(within(dialog).getByRole("img", { name: "Mastercard" })).toBeDefined();
});

it("opens from the URL and removes only urun on close, retaining the history state and other parameters", async () => {
  history.replaceState({ preserved: true }, "", "/?utm_source=test&urun=sample-olive-oil-5l");
  const replace = vi.spyOn(history, "replaceState");
  await mount();
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText(copy[4][1])).toBeDefined();
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(location.search).toBe("?utm_source=test");
  expect(location.hash).toBe("");
  expect(history.state).toEqual({ preserved: true });
  expect(replace).toHaveBeenCalled();
});

it("ignores unknown IDs, follows popstate and leaves details unloaded on an ordinary visit", async () => {
  history.replaceState(null, "", "/?urun=unknown");
  await mount();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.querySelector("[data-product-detail-image]")).toBeNull();
  act(() => {
    history.replaceState(null, "", "/?urun=sample-olive-oil-1l");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  expect(await screen.findByRole("dialog")).toBeDefined();
  act(() => { history.replaceState(null, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("preserves selection and quantity across the breakpoint and skips all modal motion when reduced", async () => {
  const { dialog } = await openCard();
  fireEvent.click(within(dialog).getByRole("button", { name: "Adedi artır" }));
  setWidth(390);
  expect(screen.getByRole("dialog")).toBe(dialog);
  expect(dialog.getAttribute("data-slot")).toBe("sheet-content");
  expect(within(dialog).getByLabelText("Adet").textContent).toBe("2");
  expect(animation.animate).not.toHaveBeenCalled();
});

it("retains keyboard focus on the size control while resetting gallery and quantity for a new variant", async () => {
  const { dialog } = await openCard();
  fireEvent.click(within(dialog).getByRole("button", { name: "Sofra görseli" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Adedi artır" }));
  const size = within(dialog).getByRole("radio", { name: "1 kg" });
  size.focus();
  fireEvent.click(size);
  expect(document.activeElement).toBe(size);
  expect(within(dialog).getByLabelText("Adet").textContent).toBe("1");
  expect(dialog.querySelector("[data-product-detail-image] img")?.getAttribute("src")).toContain("studyo");
});

it("keeps the modal trap until exit motion completes, then restores focus", async () => {
  reduced = false;
  const { dialog, trigger } = await openCard();
  expect(animation.animate).toHaveBeenCalled();
  let finish!: () => void;
  animation.animate.mockReturnValueOnce(Object.assign(new Promise<void>(resolve => { finish = resolve; }), animation));
  fireEvent.click(within(dialog).getByRole("button", { name: "Kapat" }));
  expect(screen.getByRole("dialog")).toBe(dialog);
  expect(location.search).toContain("urun=");
  await act(async () => { finish(); });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("closes from the backdrop and restores the opener", async () => {
  const { trigger } = await openCard();
  const overlay = document.querySelector('[data-slot$="-overlay"]')!;
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1)); });
  fireEvent(overlay, new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
  fireEvent(overlay, new MouseEvent("pointerup", { bubbles: true, button: 0 }));
  fireEvent.click(overlay);
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("hides the mobile buy bar while the detail sheet is open", async () => {
  setWidth(390);
  vi.stubGlobal("innerWidth", 390); vi.stubGlobal("innerHeight", 844); vi.stubGlobal("scrollY", 900);
  const { card } = await mount(undefined, false, true);
  const bar = document.querySelector("[data-mobile-buy-bar]")!;
  await waitFor(() => expect(bar.getAttribute("aria-hidden")).toBe("false"));
  fireEvent.click(within(card).getByRole("heading").querySelector("button")!);
  await screen.findByRole("dialog");
  await waitFor(() => expect(bar.getAttribute("aria-hidden")).toBe("true"));
});
