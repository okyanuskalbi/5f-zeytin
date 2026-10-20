/** Public catalog fields only. Prices are integer kuruş in TRY, not checkout quotes. */
export type Product = Readonly<{
  id: string;
  name: string;
  category: "sofralik-zeytin" | "salamura-zeytin" | "zeytinyagi";
  weight: string;
  priceKurus: number;
  stock: number;
}>;
