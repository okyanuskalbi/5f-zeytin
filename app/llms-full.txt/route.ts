import { GET as discovery } from "@/app/llms.txt/route";
import { siteIdentity } from "@/lib/site/identity";
import { quoteDeliveryExplanation } from "@/lib/site/public-content";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const summary = await (await discovery()).text();
  const origin = siteIdentity.origin;
  const body = [summary,
    "## Satın alma ve kurumsal talep yolları", "",
    `- [Ürün seçimi](${origin}/#urunler): Mevcut ambalajları inceleyin. Ürün ayrıntıları her ürünün ayrı sayfasındadır; bu sayfalarda boy ve adet seçip sepete ekleyebilirsiniz.`,
    `- [Kurumsal talep](${origin}/?sekme=toptan#toptan-bayilik): Ürünü ve işletme segmentini seçip miktar, teslimat yeri ve firma bilgileriyle talebinizi hazırlayın.`, "",
    quoteDeliveryExplanation, "",
    "Ambalaj, minimum sipariş ve teslimat koşulları teklif aşamasında netleştirilir.", "",
    "## Kaynak ve kapsam", "",
    `Kaynak: [AFİNA ZEYTİN ana sayfası](${origin}/). Üretim yerinin görünür fotoğrafı ve açıklaması [tesis bölümündedir](${origin}/#hikayemiz).`,
    "Bu metin sitenin kamuya açık bilgilerini bir araya getirir. Fiyat ve stok bilgileri temsili; gerçek fiyat ve stok onayı bekleniyor. Online ödeme henüz açık değildir.", "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Link": `<${origin}/>; rel="canonical"` } });
}
