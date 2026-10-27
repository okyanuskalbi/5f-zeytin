import { getProducts } from "@/lib/catalog/static-products";
import { siteIdentity } from "@/lib/site/identity";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const products = await getProducts();
  const body = [
    `# ${siteIdentity.name}`,
    "",
    `> ${siteIdentity.description}`,
    "",
    "## Ürünler",
    "",
    ...products.map(product => `- ${product.name} — ${product.weight}`),
    "",
    "## Tesis",
    "",
    `${siteIdentity.facility.locality} / ${siteIdentity.facility.region}`,
    "",
    "## Bağlantılar",
    "",
    "- [Toptan satış için iletişim](/#toptan-iletisim)",
    "- [Sık sorulanlar](/#sik-sorulanlar)",
    `- [AFİNA Şirketler Topluluğu](${siteIdentity.communityUrl})`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
