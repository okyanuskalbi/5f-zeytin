// Representative prices/stock only; approved packaging sizes are fixed.
// Families are display groups. Cart/checkout continue to use variant IDs.
import manifest from "@/public/images/v3/manifest.json";
import type { ProductFamily, ProductVariant } from "@/types/catalog";

function variant(familyId: string, name: string, category: ProductVariant["category"], id: string, weight: string, priceKurus: number, stock: number, imageKey: keyof typeof manifest.assets): ProductVariant {
  const prefix = imageKey.slice(5, 7);
  return { id, familyId, name, category, weight, priceKurus, stock, imageKey,
    galleryKeys: Object.keys(manifest.assets).filter(key => key.startsWith(`${prefix}-`)) };
}

const families: readonly ProductFamily[] = [
  { id: "dogal-kirma", name: "Doğal Kırma Yeşil Zeytin", category: "sofralik-zeytin", variants: [
    variant("dogal-kirma", "Doğal Kırma Yeşil Zeytin", "sofralik-zeytin", "sample-green-olive-1kg", "1 kg", 22000, 12, "urun-02-kirma-1kg"),
    variant("dogal-kirma", "Doğal Kırma Yeşil Zeytin", "sofralik-zeytin", "sample-green-olive-10kg", "10 kg", 220000, 6, "urun-01-kirma-10kg"),
  ] },
  { id: "salamura-siyah", name: "Salamura Siyah Zeytin", category: "salamura-zeytin", variants: [
    variant("salamura-siyah", "Salamura Siyah Zeytin", "salamura-zeytin", "sample-black-olive-1kg", "1 kg", 22000, 0, "urun-03-siyah-1kg"),
  ] },
  { id: "naturel-sizma", name: "Natürel Sızma Zeytinyağı", category: "zeytinyagi", variants: [
    variant("naturel-sizma", "Natürel Sızma Zeytinyağı", "zeytinyagi", "sample-olive-oil-1l", "1 L", 35000, 8, "urun-04-yag-1l"),
    variant("naturel-sizma", "Natürel Sızma Zeytinyağı", "zeytinyagi", "sample-olive-oil-5l", "5 L", 175000, 6, "urun-05-yag-5l"),
  ] },
  { id: "salamura-yesil", name: "Salamura Yeşil Zeytin", category: "salamura-zeytin", variants: [
    variant("salamura-yesil", "Salamura Yeşil Zeytin", "salamura-zeytin", "sample-brined-green-olive-5kg", "5 kg", 110000, 8, "urun-06-salamura-yesil-5kg"),
  ] },
];

export async function getProductFamilies(): Promise<readonly ProductFamily[]> {
  return families.map(family => ({ ...family, variants: family.variants.map(product => ({ ...product, galleryKeys: [...product.galleryKeys] })) }));
}

/** Flat Product contract remains compatible with existing cart/checkout logic. */
export async function getProducts(): Promise<readonly ProductVariant[]> {
  return (await getProductFamilies()).flatMap(family => family.variants);
}
