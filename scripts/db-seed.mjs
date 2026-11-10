import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { operatorConnectionString } from "./db-operator.mjs";

export function parseSeedArguments(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) return { apply: false };
  if (args.length === 1 && args[0] === "--apply") return { apply: true };
  throw new Error("Use db:seed [--apply]");
}

/** Execute the same checked-in catalog module as the app, using Node 24's native
 * type removal. Only its JSON dependency location changes; no catalog values are
 * copied or parsed from source text. This CLI does not need a Next.js server.
 */
export async function loadStaticCatalog() {
  const sourceUrl = new URL("../lib/catalog/static-products.ts", import.meta.url);
  const manifestUrl = new URL("../lib/media/v4-assets.json", import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const dependency = 'import manifest from "@/lib/media/v4-assets.json" with { type: "json" };';
  if (!source.includes(dependency)) throw new Error("Catalog module dependency changed; review seed loader");
  const javascript = stripTypeScriptTypes(source.replace(dependency, `import manifest from ${JSON.stringify(manifestUrl.href)} with { type: "json" };`), { mode: "strip" });
  const catalog = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  const products = (await catalog.getProducts()).map(product => ({
    id: product.id, name: product.name, category: product.category, weight: product.weight,
    price_kurus: product.priceKurus, stock: product.stock, currency: "TRY", is_active: true,
    category_label: product.categoryLabel ?? null, show_category_label: product.showCategoryLabel ?? true,
  }));
  if (products.length === 0 || products.length > 6 || new Set(products.map(product => product.id)).size !== products.length) throw new Error("Invalid static catalog");
  // There are no explicit static upsell pairs. Derived cart recommendations stay in the app.
  return { products, upsells: [] };
}

export async function seedCatalog(pool, { apply = false } = {}) {
  const plan = await loadStaticCatalog();
  if (!apply) return { mode: "dry-run", ...plan };
  const client = await pool.connect();
  let productChanges = 0;
  let upsellChanges = 0;
  try {
    await client.query("BEGIN");
    // Share the product editor's transaction lock, preserving its six active slots.
    await client.query("SELECT pg_advisory_xact_lock($1)", [640064]);
    for (const product of plan.products) {
      const result = await client.query(`INSERT INTO public.products
        (id,name,category,weight,price_kurus,stock,currency,is_active,category_label,show_category_label,active_slot)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,(SELECT active_slot FROM public.products WHERE id=$1))
        ON CONFLICT (id) DO UPDATE SET name=excluded.name,category=excluded.category,
          weight=excluded.weight,price_kurus=excluded.price_kurus,stock=excluded.stock,
          currency=excluded.currency,is_active=excluded.is_active,category_label=excluded.category_label,
          show_category_label=excluded.show_category_label
        WHERE (products.name,products.category,products.weight,products.price_kurus,products.stock,
          products.currency,products.is_active,products.category_label,products.show_category_label)
        IS DISTINCT FROM (excluded.name,excluded.category,excluded.weight,excluded.price_kurus,excluded.stock,
          excluded.currency,excluded.is_active,excluded.category_label,excluded.show_category_label)`,
        [product.id, product.name, product.category, product.weight, product.price_kurus, product.stock,
          product.currency, product.is_active, product.category_label, product.show_category_label]);
      productChanges += result.rowCount ?? 0;
    }
    for (const upsell of plan.upsells) {
      const result = await client.query("INSERT INTO public.product_upsells(product_id,upsell_id) VALUES($1,$2) ON CONFLICT(product_id,upsell_id) DO NOTHING", [upsell.productId, upsell.upsellId]);
      upsellChanges += result.rowCount ?? 0;
    }
    await client.query("COMMIT");
    return { mode: "applied", productChanges, upsellChanges, products: plan.products.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let pool;
  try {
    const options = parseSeedArguments(process.argv.slice(2));
    if (options.apply) pool = new Pool({ connectionString: operatorConnectionString(), max: 1, connectionTimeoutMillis: 10000 });
    console.log(JSON.stringify(await seedCatalog(pool, options), null, 2));
  } catch {
    console.error("Catalog seed failed. Use --apply only with a reviewed DATABASE_URL_UNPOOLED and migrated database.");
    process.exitCode = 1;
  } finally { await pool?.end(); }
}
