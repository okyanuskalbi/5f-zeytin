import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import Kvkk from "@/app/kvkk/page";
import Sale from "@/app/mesafeli-satis/page";
import Returns from "@/app/iade/page";

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
