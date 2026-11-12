import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LegacyHomeNavigation, legacyHomeSection } from "@/components/site/LegacyHomeNavigation";

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
afterEach(() => { cleanup(); history.replaceState(null, "", "/"); HTMLElement.prototype.scrollIntoView = originalScrollIntoView; document.body.innerHTML = ""; });

// Task208: the old fragments now belong to sections of the one landing page.
it.each([
  ["#toptan-iletisim", "toptan-bayilik"], ["#hakkimizda", "hikayemiz"], ["#tesisimiz", "hikayemiz"], ["#kurumsal", "hikayemiz"],
  ["#uretim-yolculugu", "hikayemiz"], ["#kiler", "urunler"], ["#one-cikanlar", "urunler"],
])("moves the legacy %s hash to its section", (hash, section) => {
  expect(legacyHomeSection(hash, "?kaynak=eski")).toBe(section);
});

it.each(["", "#urunler", "#baslangic", "#__proto__", "#bilinmeyen", "#toptan", "#teklif", "#iletisim", "#sik-sorulanlar"])("keeps the live home hash %s where it is", hash => {
  expect(legacyHomeSection(hash, "")).toBeNull();
});

it("opens the products for the old shop query", () => {
  expect(legacyHomeSection("", "?magaza=ac")).toBe("urunler");
  expect(legacyHomeSection("", "?magaza=kapali")).toBeNull();
});

it("rewrites the address in place on entry and on later hash changes, keeping the source query", () => {
  const scroll = vi.fn();
  HTMLElement.prototype.scrollIntoView = scroll;
  document.body.innerHTML = '<section id="hikayemiz"></section><section id="urunler"></section>';
  history.replaceState(null, "", "/?kaynak=eski#tesisimiz");
  render(<LegacyHomeNavigation />);
  expect(`${location.pathname}${location.search}${location.hash}`).toBe("/?kaynak=eski#hikayemiz");
  expect(scroll).toHaveBeenCalledTimes(1);
  history.replaceState(null, "", "/?magaza=ac");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  expect(`${location.pathname}${location.search}${location.hash}`).toBe("/#urunler");
  expect(scroll).toHaveBeenCalledTimes(2);
});
