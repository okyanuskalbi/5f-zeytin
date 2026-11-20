import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import { execute, parseTarget, sqlText } from "./d1.mjs";

export function parseSeedArguments(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) return { apply: false };
  if (args.length === 2 && args.includes("--apply") && args.some(arg => arg === "--local" || arg === "--remote")) {
    return { apply: true, target: parseTarget(args.filter(arg => arg !== "--apply")) };
  }
  throw new Error("Use db:seed [--dry-run] or db:seed --apply --local|--remote");
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

/** Tohum SQL'i: yalnız onaylı statik katalog; tek toplu çağrı olarak çalışır, değişmeyen satırlara dokunmaz. */
export function seedStatements(plan) {
  const num = value => { if (!Number.isSafeInteger(value)) throw new Error("Invalid seed number"); return String(value); };
  const statements = plan.products.map(product => `INSERT INTO products
    (id,name,category,weight,price_kurus,stock,currency,is_active,category_label,show_category_label)
    VALUES (${sqlText(product.id)},${sqlText(product.name)},${sqlText(product.category)},${sqlText(product.weight)},${num(product.price_kurus)},${num(product.stock)},
      ${sqlText(product.currency)},${product.is_active ? 1 : 0},${product.category_label === null ? "NULL" : sqlText(product.category_label)},${product.show_category_label ? 1 : 0})
    ON CONFLICT (id) DO UPDATE SET name=excluded.name,category=excluded.category,
      weight=excluded.weight,price_kurus=excluded.price_kurus,stock=excluded.stock,
      currency=excluded.currency,is_active=excluded.is_active,category_label=excluded.category_label,
      show_category_label=excluded.show_category_label
    WHERE products.name IS NOT excluded.name OR products.category IS NOT excluded.category OR products.weight IS NOT excluded.weight
      OR products.price_kurus IS NOT excluded.price_kurus OR products.stock IS NOT excluded.stock OR products.currency IS NOT excluded.currency
      OR products.is_active IS NOT excluded.is_active OR products.category_label IS NOT excluded.category_label
      OR products.show_category_label IS NOT excluded.show_category_label;`);
  for (const upsell of plan.upsells) {
    statements.push(`INSERT INTO product_upsells(product_id,upsell_id) VALUES(${sqlText(upsell.productId)},${sqlText(upsell.upsellId)}) ON CONFLICT(product_id,upsell_id) DO NOTHING;`);
  }
  return statements;
}

export function seedCatalog(options = { apply: false }, run = execute) {
  return loadStaticCatalog().then(plan => {
    if (!options.apply) return { mode: "dry-run", ...plan };
    const results = run(options.target, { command: seedStatements(plan).join("\n") });
    const changes = results.map(result => result?.meta?.changes ?? 0);
    const productChanges = changes.slice(0, plan.products.length).reduce((sum, value) => sum + value, 0);
    // wrangler değişiklik sayısını hedefe göre farklı bildirir (tetikleyiciler dahil); gerçek durumu ayrıca okuruz.
    const activeProducts = run(options.target, { command: "SELECT count(*) AS n FROM products WHERE is_active = 1" })[0]?.results?.[0]?.n ?? null;
    return { mode: "applied", productChanges, upsellChanges: changes.slice(plan.products.length).reduce((sum, value) => sum + value, 0), products: plan.products.length, activeProducts };
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await seedCatalog(parseSeedArguments(process.argv.slice(2))), null, 2));
  } catch {
    console.error("Catalog seed failed. Use --apply --local|--remote only with a migrated database.");
    process.exitCode = 1;
  }
}
