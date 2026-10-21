import approvals from "./v3-asset-approvals.json" with { type: "json" };

// Pinned verbatim SHA rows from the two user-approved ONAY.md files (21 Oct).
// Original images and approval documents remain read-only outside this repo.
export { approvals };
export const formats = ["avif", "webp"];
const background = (id, alt, widths, budget) => ({ id, group: "v3", source: `${id}.webp`, alt, widths, budget });
const cutout = (id, alt, threshold = 40) => ({ id, group: "v3", source: `${id}.png`, alt, heights: [300, 600], threshold, budget: 90_000 });
export const specs = [
  background("hero-masaustu", "Düziçi’nde kahvaltı sofrasında Afina yeşil zeytin tenekesi", [1920, 2880], 180_000),
  background("hero-mobil", "Sabah ışığında Afina zeytiniyle hazırlanan kahvaltı sofrası", [750, 1150], 120_000),
  background("kiler-duvar", "Pencere ışığının vurduğu yeşil badanalı kiler duvarı", [1920, 2880], 150_000),
  { ...background("kraft-doku", "Kraft kâğıt dokusu", [512]), square: true },
  { id: "raf-ceviz", group: "v3", source: "raf-ceviz.png", alt: "Ceviz ağacından yatay kiler rafı", widths: [1920, 2880], threshold: 200 },
  cutout("kargo-kolisi", "Afina logolu kraft kargo kolisi"),
  cutout("urun-01-kirma-10kg", "Doğal Kırma Yeşil Zeytin, 10 kg teneke"),
  cutout("urun-02-kirma-1kg", "Doğal Kırma Yeşil Zeytin, 1 kg kavanoz"),
  cutout("urun-03-siyah-1kg", "Salamura Siyah Zeytin, 1 kg kavanoz"),
  cutout("urun-04-yag-1l", "Natürel Sızma Zeytinyağı, 1 L cam şişe"),
  cutout("urun-05-yag-5l", "Natürel Sızma Zeytinyağı, 5 L teneke"),
  cutout("urun-06-salamura-yesil-5kg", "Salamura Yeşil Zeytin, 5 kg teneke"),
  { id: "tesis-osmaniye", group: "facility", source: "tesis-osmaniye-plaka-bulanik.jpg", alt: "Afina Zeytin’in Ellek, Düziçi’ndeki üretim tesisi", widths: [800, 1600] },
];
for (const source of Object.keys(approvals.gallery.hashes).filter(file => file.endsWith(".webp"))) {
  const number = Number(source.slice(0, 2));
  const product = specs.find(spec => spec.id.startsWith(`urun-${String(number).padStart(2, "0")}-`));
  const studio = source.includes("-studyo.");
  specs.push({ id: source.replace(".webp", ""), group: "gallery", source, alt: `${product.alt}, ${studio ? "stüdyo çekimi" : "sofra sunumu"}`, widths: [800, 1600], aspect: studio ? 4 / 5 : 16 / 9 });
}
