/** Public catalog fields only. Prices are integer kuruş in TRY, not checkout quotes. */
export type Product = Readonly<{
  id: string;
  name: string;
  category: "sofralik-zeytin" | "salamura-zeytin" | "zeytinyagi";
  categoryLabel?: string | null;
  showCategoryLabel?: boolean;
  weight: string;
  priceKurus: number;
  stock: number;
}>;

/** Cart/checkout identifies a purchasable size, never a family. */
export type ProductVariant = Product & Readonly<{
  familyId: string;
  imageKey: string;
  galleryKeys: readonly string[];
}>;
export type ProductFamily = Readonly<{
  id: string;
  name: string;
  category: Product["category"];
  variants: readonly ProductVariant[];
}>;
