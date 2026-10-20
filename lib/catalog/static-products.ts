// TEMSİLİ KATALOG: Bu ürünler, ambalajlar, fiyatlar ve stoklar gerçek satış
// verisi değildir. Task 030'un geçici veri kararıyla kullanılır; gerçek katalog
// kullanıcıdan gelir. Task 029 yalnız getProducts veri kaynağını değiştirir.
import type { Product } from "@/types/catalog";

const products: readonly Product[] = [
  { id: "sample-table-olive", name: "Sofralık Zeytin", category: "sofralik-zeytin", weight: "500 g", priceKurus: 12550, stock: 12 },
  { id: "sample-brined-olive", name: "Salamura Zeytin", category: "salamura-zeytin", weight: "1 kg", priceKurus: 22000, stock: 0 },
  { id: "sample-olive-oil", name: "Zeytinyağı", category: "zeytinyagi", weight: "500 ml", priceKurus: 35000, stock: 8 },
  // Task 103 explicitly permits representative 1/5/10 kg sizes. These are
  // UI fixtures, not approved SKUs, retail prices, availability or discounts.
  { id: "sample-green-olive-1kg", name: "Doğal Kırma Yeşil Zeytin", category: "sofralik-zeytin", weight: "1 kg", priceKurus: 22000, stock: 12 },
  { id: "sample-green-olive-5kg", name: "Doğal Kırma Yeşil Zeytin", category: "sofralik-zeytin", weight: "5 kg", priceKurus: 110000, stock: 8 },
  { id: "sample-green-olive-10kg", name: "Doğal Kırma Yeşil Zeytin", category: "sofralik-zeytin", weight: "10 kg", priceKurus: 220000, stock: 6 },
];

export async function getProducts(): Promise<readonly Product[]> {
  return products.slice(0, 6).map((product) => ({ ...product }));
}
