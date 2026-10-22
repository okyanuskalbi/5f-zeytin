import "server-only";
import { getProducts } from "@/lib/catalog/static-products";
import { catalogProductLimit, parseCatalogProducts, type CatalogResponse } from "@/lib/contracts/catalog";
import { createSupabasePublicClient } from "@/lib/supabase/public";

const catalogReadTimeoutMs = 5000;
const catalogColumns = "id,name,category,weight,price_kurus,currency,stock,is_active";

async function readPublishedProducts() {
  const { data, error } = await createSupabasePublicClient()
    .from("products")
    .select(catalogColumns)
    // RLS enforces publication; keep the explicit filter as defense in depth.
    .eq("is_active", true)
    .order("active_slot", { ascending: true })
    .limit(catalogProductLimit)
    .retry(false)
    .abortSignal(AbortSignal.timeout(catalogReadTimeoutMs));

  if (error || !Array.isArray(data)) return null;
  const products = data.map(row => {
    if (!row || typeof row !== "object" || row.is_active !== true || row.currency !== "TRY") return null;
    return { id: row.id, name: row.name, category: row.category, weight: row.weight,
      priceKurus: row.price_kurus, stock: row.stock };
  });
  return parseCatalogProducts(products);
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
