import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProductShowcase } from "@/components/storefront/home/ProductShowcase";
import { productGroups } from "@/lib/catalog/groups";

// Task208: the category photo links and the catalogue shell were replaced by category pills over the
// product grid of the home page (`#urunler`). The choice is a radiogroup and lives in `?kategori=`.
beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); });

const pills = [
  ["", "Tümü"], ["zeytinyagi", "Zeytinyağı"], ["zeytin", "Zeytin"],
  ["siyah-zeytin", "Siyah"], ["yesil-zeytin", "Yeşil"], ["kirma-zeytin", "Kırma"],
] as const;
const items = productGroups.map(group => ({ id: `urun-${group.id}`, groups: [group.id], tile: <article data-testid={group.id}>{group.name}</article> }));

it("offers the whole catalogue and every category as pills before JavaScript, without links or a dialog", () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<ProductShowcase items={items} />), "text/html");
  const group = doc.querySelector('[role="radiogroup"][aria-label="Ürün kategorisi"]')!;
  expect([...group.querySelectorAll('[role="radio"]')].map(pill => pill.textContent)).toEqual(pills.map(([, label]) => label));
  expect(group.querySelectorAll('[aria-checked="true"]')).toHaveLength(1);
  expect(group.querySelector('[aria-checked="true"]')?.textContent).toBe("Tümü");
  expect(doc.querySelectorAll("article")).toHaveLength(items.length);
  expect(doc.querySelector('a, [aria-haspopup], [role="dialog"]')).toBeNull();
  // Every category of the public tree has its pill: no group is reachable only by address.
  expect(pills.slice(1).map(([id]) => id).sort()).toEqual(productGroups.map(entry => entry.id).sort());
});

it.each(pills)("marks only the %s pill as chosen and keeps the pills above the grid", (id, name) => {
  history.replaceState(null, "", id ? `/?kategori=${id}#urunler` : "/");
  render(<ProductShowcase items={items} />);
  const group = screen.getByRole("radiogroup", { name: "Ürün kategorisi" });
  const radios = within(group).getAllByRole("radio");
  expect(radios).toHaveLength(6);
  expect(radios.filter(pill => pill.getAttribute("aria-checked") === "true")).toEqual([within(group).getByRole("radio", { name })]);
  expect(radios.filter(pill => pill.tabIndex === 0)).toEqual([within(group).getByRole("radio", { name })]);
  const grid = document.querySelector("[data-product-grid]")!;
  expect(grid.getAttribute("data-category")).toBe(id || "tumu");
  expect(group.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const children = productGroups.filter(entry => entry.parentId === id).map(entry => entry.id);
  const expected = id ? [id, ...children] : productGroups.map(entry => entry.id);
  expect(screen.getAllByRole("article").map(card => card.getAttribute("data-testid")).sort()).toEqual([...expected].sort());
});

it("moves the choice with the arrow keys and writes it to the address without leaving the page", () => {
  history.replaceState({ keep: true }, "", "/?kaynak=yerel#urunler");
  render(<ProductShowcase items={items} />);
  const first = screen.getByRole("radio", { name: "Tümü" });
  first.focus();
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const oil = screen.getByRole("radio", { name: "Zeytinyağı" });
  expect(oil.getAttribute("aria-checked")).toBe("true");
  expect(document.activeElement).toBe(oil);
  expect(`${location.pathname}${location.search}${location.hash}`).toBe("/?kaynak=yerel&kategori=zeytinyagi#urunler");
  expect(history.state).toEqual({ keep: true });
  fireEvent.keyDown(oil, { key: "ArrowLeft" });
  expect(first.getAttribute("aria-checked")).toBe("true");
  expect(`${location.pathname}${location.search}${location.hash}`).toBe("/?kaynak=yerel#urunler");
});

it("follows the browser's back and forward buttons", () => {
  render(<ProductShowcase items={items} />);
  history.replaceState(null, "", "/?kategori=yesil-zeytin");
  fireEvent(window, new PopStateEvent("popstate"));
  expect(screen.getByRole("radio", { name: "Yeşil" }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getAllByRole("article").map(card => card.getAttribute("data-testid"))).toEqual(["yesil-zeytin"]);
});
