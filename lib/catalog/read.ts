import "server-only";
import { getProductFamilies, getProducts } from "@/lib/catalog/static-products";
import { catalogProductLimit, parseCatalogProducts, type CatalogResponse } from "@/lib/contracts/catalog";
import { query } from "@/lib/db";

const catalogColumns = "id,name,category,category_label,show_category_label,weight,price_kurus,currency,stock,is_active";

async function readPublishedProducts() {
  const { rows: data } = await query(
    `SELECT ${catalogColumns} FROM public.products WHERE is_active = $1 ORDER BY active_slot ASC LIMIT $2`,
    [true, catalogProductLimit],
  );
  if (!Array.isArray(data)) return null;
  const products = data.map(row => {
    if (!row || typeof row !== "object" || row.is_active !== true || row.currency !== "TRY") return null;
    return { id: row.id, name: row.name, category: row.category, weight: row.weight,
      categoryLabel: row.category_label, showCategoryLabel: row.show_category_label,
      priceKurus: row.price_kurus, stock: row.stock };
  });
  return parseCatalogProducts(products);
}

/** Apply only label settings to approved display variants, matched by product ID. */
export async function readProductFamilies() {
  const [families, catalog] = await Promise.all([getProductFamilies(), readCatalog()]);
  if (catalog.source !== "database") return families;
  const settings = new Map(catalog.data.map(product => [product.id, product]));
  return families.map(family => ({ ...family, variants: family.variants.map(product => {
    const setting = settings.get(product.id);
    return setting ? { ...product, categoryLabel: setting.categoryLabel, showCategoryLabel: setting.showCategoryLabel } : product;
  }) }));
}

/** Each call reads afresh; neither database failures nor fallback data are cached. */
export async function readCatalog(): Promise<CatalogResponse> {
  try {
    const data = await readPublishedProducts();
    // An empty published catalog is valid and must not resurrect sample products.
    if (data !== null) return { data, source: "database" };
  } catch {
    // Configuration, network and timeout failures share the approved fallback.
    // Raw upstream errors can include credentials; expose only the source marker.
  }

  const data = parseCatalogProducts(await getProducts());
  if (data === null) throw new Error("Catalog unavailable");
  return { data, source: "static" };
}
