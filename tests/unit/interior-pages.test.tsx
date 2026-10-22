import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import Kvkk from "@/app/kvkk/page";
import Sale from "@/app/mesafeli-satis/page";
import Returns from "@/app/iade/page";
import Tracking, { metadata as trackingMetadata } from "@/app/siparis-takip/page";
import NotFound from "@/app/not-found";

afterEach(() => vi.unstubAllEnvs());

for (const [name, Page] of [["KVKK", Kvkk], ["satış", Sale], ["iade", Returns]] as const) {
  it(`${name} keeps the draft visible while publishing only confirmed seller details`, () => {
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = renderToStaticMarkup(<Page />);
    expect(doc.querySelector("main")?.textContent).toContain("Onaylı metin henüz eklenmedi.");
    const seller = doc.querySelector('section[aria-labelledby="seller-title"]');
    expect(seller?.textContent).toContain("AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ");
    expect(seller?.textContent).toContain("0091520061");
    expect(seller?.textContent).toContain("No: 35, Ellek Beldesi, Düziçi / Osmaniye");
    expect(doc.querySelector('a[href^="tel:"], a[href^="mailto:"], form, input')).toBeNull();
    expect(doc.querySelector('nav a[aria-current="page"]')).not.toBeNull();
  });
}

// Account now has its own authenticated page acceptance in account-ui.test.tsx.
for (const [title, Page, metadata] of [["Sipariş takibi", Tracking, trackingMetadata], ["Sayfa bulunamadı", NotFound, null]] as const) {
  it(`${title} exposes a recovery link without collecting data or simulating a service`, () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO", undefined);
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = renderToStaticMarkup(<Page />);
    expect(doc.querySelector("h1")?.textContent).toBe(title);
    expect(doc.querySelector("main a")?.getAttribute("href")).toBe(metadata ? "/#urunler" : "/");
    expect(doc.querySelector("form, input, iframe")).toBeNull();
    if (metadata) {
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(doc.querySelector("main")?.textContent).toContain("yakında.");
    }
  });
}
