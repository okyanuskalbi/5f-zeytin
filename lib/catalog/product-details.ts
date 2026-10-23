// Müşteri onayı bekler.
import type { Product } from "@/types/catalog";
import { getCategoryLabel } from "@/lib/catalog/category-label";

const drafts: Readonly<Record<string, { description: string; packaging: string }>> = {
  "sample-green-olive-10kg": {
    description: "Ellek, Düziçi'nde toplanan yeşil zeytinler geleneksel usulle kırılarak hazırlanır ve kendi tesisimizde tenekeye doldurulur. 10 kg teneke, kışlık kiler ve kalabalık sofralar için.",
    packaging: "teneke",
  },
  "sample-green-olive-1kg": {
    description: "Aynı doğal kırma yeşil zeytin, günlük sofra için cam kavanozda. Kendi tesisimizde doldurulur.",
    packaging: "cam kavanoz",
  },
  "sample-black-olive-1kg": {
    description: "Salamurada bekletilerek hazırlanan siyah zeytin, kahvaltı sofraları için 1 kg cam kavanozda. Kendi tesisimizde doldurulur.",
    packaging: "cam kavanoz",
  },
  "sample-olive-oil-1l": {
    description: "Natürel sızma zeytinyağı, sofra ve salata kullanımı için 1 litrelik cam şişede. Kendi tesisimizde doldurulur.",
    packaging: "cam şişe",
  },
  "sample-olive-oil-5l": {
    description: "Natürel sızma zeytinyağı, mutfakta düzenli kullanım için 5 litrelik tenekede. Kendi tesisimizde doldurulur.",
    packaging: "teneke",
  },
  "sample-brined-green-olive-5kg": {
    description: "Salamurada hazırlanan yeşil zeytin, kiler stoğu için 5 kg tenekede. Kendi tesisimizde doldurulur.",
    packaging: "teneke",
  },
};

export function getProductDetails(product: Product): {
  description: string; information: readonly { label: string; value: string }[];
} | undefined {
  const draft = Object.hasOwn(drafts, product.id) ? drafts[product.id] : undefined;
  if (!draft) return undefined;
  const categoryLabel = getCategoryLabel(product);
  return { description: draft.description, information: [
    { label: "Net miktar", value: product.weight },
    { label: "Ambalaj", value: draft.packaging },
    ...(categoryLabel ? [{ label: "Kategori", value: categoryLabel }] : []),
    { label: "Üretim yeri", value: "Ellek, Düziçi / Osmaniye" },
    { label: "Dolum", value: "Afina Zeytin tesisi" },
    { label: "Kargo", value: "2–4 iş günü" },
  ] };
}
