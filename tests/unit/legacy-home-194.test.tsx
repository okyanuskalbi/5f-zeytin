import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LegacyHomeNavigation, legacyHomeDestination } from "@/components/site/LegacyHomeNavigation";
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); replace.mockClear(); });

it.each([
  ["#toptan", "/toptan-satis"], ["#teklif", "/toptan-satis"], ["#toptan-iletisim", "/toptan-satis"],
  ["#hakkimizda", "/hakkimizda"], ["#tesisimiz", "/hakkimizda"], ["#kurumsal", "/hakkimizda"],
  ["#uretim-yolculugu", "/hakkimizda"], ["#iletisim", "/hakkimizda#iletisim"], ["#sik-sorulanlar", "/hakkimizda#sik-sorulanlar"],
])("moves the legacy %s hash without losing the source query", (hash, target) => {
  const destination = new URL(target, "https://afinazeytin.com");
  destination.search = "kaynak=eski";
  expect(legacyHomeDestination(hash, "?kaynak=eski")).toBe(`${destination.pathname}${destination.search}${destination.hash}`);
});

it.each(["", "#urunler", "#baslangic", "#__proto__", "#bilinmeyen"])("keeps the live home hash %s on the home page", hash => {
  expect(legacyHomeDestination(hash, "")).toBeNull();
});

it("uses client navigation on initial legacy entry and later hash changes", () => {
  history.replaceState(null, "", "/?kaynak=eski#iletisim");
  render(<LegacyHomeNavigation />);
  expect(replace).toHaveBeenCalledWith("/hakkimizda?kaynak=eski#iletisim");
  history.replaceState(null, "", "/#teklif");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  expect(replace).toHaveBeenLastCalledWith("/toptan-satis");
});
