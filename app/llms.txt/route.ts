import { getProducts } from "@/lib/catalog/static-products";
import { siteIdentity } from "@/lib/site/identity";
import { verifiedFaqs } from "@/lib/site/faqs";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const products = await getProducts();
  const origin = siteIdentity.origin;
  const body = [
    `# ${siteIdentity.name}`, "", `> ${siteIdentity.description}`, "",
    `İçerik güncellemesi: ${siteIdentity.contentUpdated}. Ana marka mesajı: Kökü toprakta. Yeri sofrada.`, "",
    "## Bölümler", "",
    `- [Marka ve yöre](${origin}/#kurumsal): AFİNA ZEYTİN ve Ellek ile bağı.`,
    `- [Üretim tesisi](${origin}/#tesisimiz): ${siteIdentity.facility.locality}, ${siteIdentity.facility.region} konumu ve tesis görseli.`,
    `- [Ürün koleksiyonu](${origin}/#urunler): Zeytin ve zeytinyağı çeşitlerini inceleyin.`,
    `- [Toptan satış için iletişim](${origin}/#toptan-iletisim): İşletmeler için ürün, ambalaj ve miktar odaklı teklif hazırlığı.`,
    `- [Sık sorulanlar](${origin}/#sik-sorulanlar): Marka, ürün alanları, tesis ve kurumsal alım hakkında kısa cevaplar.`,
    `- [İletişim](${origin}/#iletisim): Ellek / Düziçi / Osmaniye ve mevcut iletişim kanalları.`,
    `- [AFİNA Şirketler Topluluğu](${siteIdentity.communityUrl}): Markanın bağlı olduğu şirketler topluluğu.`, "",
    "## Ürünler", "",
    ...products.map(product => `- ${product.name} — ${product.weight}`), "",
    "## Tesis", "", `${siteIdentity.facility.locality} / ${siteIdentity.facility.region}`, "",
    "## Sık sorulanlar", "",
    ...verifiedFaqs.flatMap(faq => [`### ${faq.question}`, "", faq.answer, ""]),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Link": `<${origin}/llms.txt>; rel="describedby"` } });
}
