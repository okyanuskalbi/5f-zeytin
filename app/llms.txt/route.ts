import { getProducts } from "@/lib/catalog/static-products";
import { siteIdentity } from "@/lib/site/identity";
import { verifiedFaqs } from "@/lib/site/faqs";
import { blogPosts } from "@/lib/blog/posts";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const products = await getProducts();
  const origin = siteIdentity.origin;
  const body = [
    `# ${siteIdentity.name}`, "", `> ${siteIdentity.description}`, "",
    `İçerik güncellemesi: ${siteIdentity.contentUpdated}. Ana marka mesajı: Kökü toprakta. Yeri sofrada.`, "",
    "## Bölümler", "",
    `- [Marka ve yöre](${origin}/hakkimizda): AFİNA ZEYTİN ve Ellek ile bağı.`,
    `- [Üretim tesisi](${origin}/hakkimizda#tesisimiz): ${siteIdentity.facility.locality}, ${siteIdentity.facility.region} konumu ve tesis görseli.`,
    `- [Ürün koleksiyonu](${origin}/#urunler): Zeytin ve zeytinyağı çeşitlerini inceleyin.`,
    `- [Toptan satış için iletişim](${origin}/toptan-satis): İşletmeler için ürün, ambalaj ve miktar odaklı teklif hazırlığı.`,
    `- [Bayilik](${origin}/bayilik): İşletmeler için bayilik bilgileri ve başvuru e-posta taslağı hazırlayan form. Gönderimi başvuru sahibi e-posta uygulamasında tamamlar.`,
    `- [Sık sorulanlar](${origin}/hakkimizda#sik-sorulanlar): Marka, ürün alanları, tesis ve kurumsal alım hakkında kısa cevaplar.`,
    `- [İletişim](${origin}/hakkimizda#iletisim): Ellek / Düziçi / Osmaniye ve mevcut iletişim kanalları.`,
    `- [AFİNA Şirketler Topluluğu](${siteIdentity.communityUrl}): Markanın bağlı olduğu şirketler topluluğu.`, "",
    "## Zeytin Rehberi", "",
    `- [Blog](${origin}/blog): Zeytin ve zeytinyağı hakkında genel bilgiler.`,
    ...blogPosts.map(post => `- [${post.title}](${origin}/blog/${post.slug}): ${post.excerpt}`), "",
    "## Ek kaynaklar", "",
    `- [Tam kamuya açık metin](${origin}/llms-full.txt): Bölümler, ürünler, talep yolu ve kısa cevaplar.`,
    `- [İçerik güncellemeleri](${origin}/feed.xml): Gerçek ana sayfa güncelleme kaydı.`, "",
    "## Ürünler", "",
    ...products.map(product => `- ${product.name} — ${product.weight}`), "",
    "## Tesis", "", `${siteIdentity.facility.locality} / ${siteIdentity.facility.region}`, "",
    "## Sık sorulanlar", "",
    ...verifiedFaqs.flatMap(faq => [`### ${faq.question}`, "", faq.answer, ""]),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Link": `<${origin}/llms.txt>; rel="describedby"` } });
}
