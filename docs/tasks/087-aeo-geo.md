# Task 087: ZEYTİN AEO/GEO — ürün soruları ve kaynaklı entity

## Tür
frontend + içerik/teknik denetim; uygulama BEKLİYOR.

## Amaç ve bağımlılıklar
`074-seo.md` çıktısını genişlet: mevcut tek landing/ürün vitrini üzerinde doğrulanmış kısa soru-cevaplar, tekil schema ve llms keşfi. **addBlockedBy: 074, 073 (onaylı hukuk/iadeler), 081 (toptan formu)**. 074 zaten 029 gerçek katalog ve 080 marka varlıklarına bağlıdır; bu zincir atlanmaz. 074→087→076 yönü korunur; 074'e 087 geri bağımlılığı verilmez.

Bu bir plan belgesidir. Şimdi uygulama kodu, canlı araştırma hesabı, şirket/ürün kaydı, robots veya llms dosyası yazılmadı. Eksik politika/ürün verisi kullanıcıdan gelir; bu görev onları seçmez. 073 beklediği sürece hukuki/kargo cevapları yayınlanamaz; diğer adayların kaynak hazırlığı bağımsız yapılabilir.

## Kaynaklar ve araçlar

- Pazarlama metni: `../referans/icerik.md`, 01 çatı + 04 Zeytin; slogan, hikâye, faaliyet ve SEO çifti birebir korunur. Diğer marka metinlerini bu public repoya taşıma.
- Kamuya açık satıcı verisi: `~/PROJELER/AFINA-KAYNAK/sirket/SIRKET.md`. Aşağıdaki izinli alanlar bu belgeye aktarılmıştır; vergi levhası PDF'si, beyan/matrah/tutar, sır veya özel kişi verisi eklenmez.
- Tasarım: `../DESIGN.md`; mevcut onay/varlık kuralları, en fazla 6 gerçek aktif ürün ve fiyat/stok sunucu otoritesi korunur.
- Uygulamada ECC seo, frontend-patterns, accessibility, verification-loop; mevcut Next.js sürümünün yerel rehberi; Schema.org validator ve üretim HTML kontrolü. shadcn gerekirse resmi CLI; yeni kütüphane/hesap zorunluluğu yok.

## Soru madenciliği ve kayıt standardı

TR/tr odağı: sofralık zeytin, salamura zeytin, zeytinyağı, Osmaniye zeytin üretimi, toptan alım, perakende alım, teslimat/iade. Rehberin yöntemini izle: PAA/AlsoAsked/AnswerThePublic, ürün yorumları/rakip SSS, kullanıcının anonimleştirerek sağlayacağı satış soruları → tekrar temizleme → bilgi/ticari/lokal/fiyat/risk/süreç kümeleri → resmi kaynak → mevcut URL/bölüm → öncelik.

Her gözlemde soru metni, kaynak URL/araç, tarih, niyet, küme, resmi cevap kaynağı, hedef URL ve yayın durumu kaydedilir. Kaynak verilmemiş satış/DM kaydına erişildiği varsayılmaz. Ücretli araç satın alma veya hesap açma yok. Aşağıdaki **24 soru editoryal adaydır; gerçek arama hacmi/PAA/DM araştırması yapılmış sayılmaz**. P1/P2 iş sırasıdır, arama hacmi değildir. Her soruya yeni route açılmaz.

## Resmi cevabı olan 12 aday

B04 = `docs/referans/icerik.md` bölüm 04. S = izinli `SIRKET.md` alanı. Cevap seçkileri resmi metinden birebir parçalardır; sırf 40–70 kelimeye ulaşmak için yeni ürün bilgisi eklenmez.

| ID | Soru | Niyet / öncelik | Kaynaklı cevap seçkisi | Hedef |
|---|---|---|---|---|
| Z01 | Afina Zeytin hangi ürün alanlarında çalışıyor? | bilgi / P1 | “Sofralık zeytin • Salamura zeytin • Zeytinyağı” — B04 faaliyet | Vitrin / SSS |
| Z02 | Afina Zeytin sofralık zeytin sunuyor mu? | ürün / P1 | “Sofralık zeytin” — B04; gerçek çeşit/ambalajı bundan türetme | İlgili ürün bloğu |
| Z03 | Afina Zeytin salamura zeytin sunuyor mu? | ürün / P1 | “salamura zeytin çeşitlerini ve zeytinyağını hem bireysel tüketicilere hem de toptan alıcılara ulaştırıyor.” — B04 hikâye | İlgili ürün bloğu |
| Z04 | Afina Zeytin zeytinyağı alanında faaliyet gösteriyor mu? | ürün / P1 | “Osmaniye’de bulunan fabrikasıyla zeytin ve zeytinyağı alanında faaliyet gösteren Afina Zeytin” — B04 hikâye | İlgili ürün bloğu |
| Z05 | Toptan zeytin veya zeytinyağı talebi iletilebilir mi? | ticari / P1 | “Toptan satış”; CTA “Toptan Satış İçin İletişime Geçin” — B04 | Mevcut 081 formu |
| Z06 | Afina Zeytin perakende müşterilere de ulaşıyor mu? | ticari / P1 | “ürünlerini toptan ve perakende kanallarda müşterileriyle buluşturuyor.” — B04 kısa tanım | Vitrin / SSS |
| Z07 | Afina Zeytin'in üretim tesisi hangi şehirde? | lokal / P1 | “OSMANİYE / ÜRETİM TESİSİ” — B04 | Tesisimiz / SSS |
| Z08 | Afina Zeytin'in marka mesajı nedir? | bilgi / P2 | “Kökü toprakta. Yeri sofrada.” — B04 | Hikâye |
| Z09 | Satıcının ticari unvanı nedir? | güven/entity / P1 | “AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ” — S | Mevcut satıcı/hukuk alanı |
| Z10 | Satıcının kamuya açık adresi nedir? | lokal / P1 | “Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye” — S | Satıcı/iletişim; iade adresi diye varsayılmaz |
| Z11 | Satıcının vergi dairesi ve VKN'si nedir? | güven/entity / P2 | “Düziçi”; “0091520061” — S | Satıcı bilgisi; VKN string kalır |
| Z12 | Afina Zeytin ürünlerini kimlere ulaştırıyor? | bilgi/ticari / P2 | “hem bireysel tüketicilere hem de toptan alıcılara” — B04 hikâye | Vitrin / toptan |

## Kullanıcıdan teyit — 12 aday, cevap yayınlama

| ID | Soru | Niyet / öncelik | Durum / gereken bilgi |
|---|---|---|---|
| Z13 | Sipariş kaç günde ve hangi bölgelere gönderilir? | kargo / P1 | **KULLANICI KARARI BEKLİYOR — KULLANICIDAN TEYİT**: teslim kapsamı/süre, firma ve gerçek taahhüt. |
| Z14 | Kargo ücreti veya ücretsiz kargo eşiği nedir? | fiyat / P1 | **KULLANICI KARARI BEKLİYOR — KULLANICIDAN TEYİT**: ücret/eşik; örnek sepet verisi cevap değildir. |
| Z15 | İade koşulları ve süresi nedir? | iade/risk / P1 | **KULLANICI KARARI BEKLİYOR — KULLANICIDAN TEYİT**: 073'ün onaylı politika metni; gıda için otomatik süre/istisna hükmü yazma. |
| Z16 | İade nereye ve nasıl gönderilir? | iade/süreç / P1 | **KULLANICI KARARI BEKLİYOR — KULLANICIDAN TEYİT**: iade adresi/prosedürü; Z10 adresini otomatik iade adresi yapma. |
| Z17 | Toptan alımda minimum miktar ve fiyat nedir? | ticari/fiyat / P1 | KULLANICIDAN TEYİT: MOQ, ambalaj ve teklif koşulları; gerçek satış kanalı bilgisinden fiyat/limit türetme. |
| Z18 | Toptan talebe ne zaman ve hangi kanaldan dönülür? | süreç / P2 | KULLANICIDAN TEYİT: alıcı/telefon/e-posta ve yanıt süresi; 082 servis onayı ayrı. |
| Z19 | Hangi çeşit, gramaj, fiyat ve stoklar mevcut? | ürün/fiyat / P1 | KULLANICIDAN TEYİT: gerçek ≤6 SKU, varyant, ambalaj, fiyat/para birimi, stok; fixture veya temsili teneke etiketini gerçek katalog yapma. |
| Z20 | Zeytinyağının sıkım yöntemi, asitliği ve hasat kökeni nedir? | ürün/risk / P1 | KULLANICIDAN TEYİT: onaylı ambalaj/ürün teknik bilgisi; Osmaniye tesis bilgisi hasat menşeini kanıtlamaz. |
| Z21 | Ürün nasıl saklanır, raf ömrü/alerjen içeriği nedir? | ürün/risk / P1 | KULLANICIDAN TEYİT: ürün bazlı onaylı etiket/teknik belge; genel gıda tavsiyesi uydurma. |
| Z22 | Ürünün organik/doğal sertifikası var mı? | risk / P1 | KULLANICIDAN TEYİT: belge ve yayın izni; o zamana kadar sertifika, %100 doğal/organik iddiası/rozeti yok. |
| Z23 | Müşteri hizmetleri telefonu/e-postası nedir? | iletişim / P1 | KULLANICIDAN TEYİT: yayınlanabilir kanal; sahte iletişim veya KURUMSAL örnek footer verisi yok. |
| Z24 | MERSİS/KEP bilgisi nedir? | güven/entity / P2 | KULLANICIDAN TEYİT: S kaynağında eksik; bu alanlar/Identifier uydurulmaz. |

Bu tablo yalnız plan içindir. Teyit satırları ziyaretçi arayüzüne, schema'ya veya llms'e “bekliyor” cevabı olarak konmaz. Kargo/iade bilgisi 073 ve kullanıcı kararıyla netleşince kaynak/sürüm kaydıyla eklenir.

## Ürün soru-cevap blokları ve SSS

İlk ortak SSS seçimi Z01/Z05/Z06/Z07; satıcı unvan/adres mevcut satıcı/hukuk alanında görünür. Ürün bloğuna yalnız o gerçek ürüne ilişkin onaylı cevaplar eklenir. Bugünkü genel marka bilgisi belirli SKU'ya çeşit/gramaj/kalite iddiası kazandırmaz. Aynı soruyu tüm ürünlerde tekrarlama; ortak soruyu ortak alana bağla.

Tek landing korunur: ürün sayfası varsa gerçek canonical ürün URL'sindeki blok kullanılır; yoksa mevcut ürün ayrıntısı/vitrin alanı kullanılır, yeni ürün route'u bu görevle açılmaz. Kaynaklı veri modülü SSR HTML'yi ve JSON-LD'yi birlikte besler. JS kapalı veya reduced-motion'da metin/CTA erişilir; soru başlıkları semantik, Fraunces/Figtree rolleri ve `DESIGN.md` kompozisyonu korunur. Sırf SSS eklemek için ikonlu kart/eyebrow/hairline/gradyan oluşturma.

## Organization — kamuya açık alan sözleşmesi

| Alan | Yayınlanabilir değer / kaynak |
|---|---|
| `@id` | `https://afinazeytin.com/#organization` — 074'ün mevcut kimliği farklıysa mevcut kimliği koru ve tüm referansları birleştir |
| `name` / `url` | AFİNA ZEYTİN / `https://afinazeytin.com/` |
| `legalName` | AFİNA ZEYTİNCİLİK TARIM ÜRÜNLERİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ — S |
| `taxID` | `0091520061` — S; baştaki sıfırlar korunarak metin |
| `address` | Şehit Ali Gökçe Mah. Şehit Ömer Halis Demir Sk. No: 35, Ellek Beldesi, Düziçi / Osmaniye — S; PostalAddress'a ayrılırsa streetAddress ilk sokak/no, locality Ellek Beldesi, Düziçi; region Osmaniye; bilinmeyen posta kodu/koordinat yok |
| `logo`, `description` | 080 onaylı logo, B04 resmi açıklama; tüm çıktılarda aynı |

Vergi dairesi görünür satıcı bilgisinde Düziçi olarak korunur; hatalı bir schema property uydurulmaz. S kaynağındaki 10.03.2021 “işe başlama” tarihi otomatik foundingDate olmaz; çatıdaki 2010 inşaat deneyimi ZEYTİN kuruluş yılı değildir. Telefon/e-posta/MERSİS/KEP, farklı iade adresi, saat/koordinat ve doğrulanmamış sameAs eklenmez. ZEYTİN unvan/VKN/adresi KURUMSAL Organization'a taşınmaz.

## Schema ve teknik dosyalar — 074 ile tek üretici

- **074 sahipliği:** `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `lib/seo/schema.ts`, canonical/OG, `public/llms.txt` ve `tests/unit/seo.test.ts`. 087 bunları genişletir; ikinci Organization, çakışan robots veya bağımsız elle katalog kopyası üretmez.
- **Product + Offer:** yalnız gerçek görünür aktif ≤6 katalog ürünü; gerçek ad, görsel, SKU/URL ve onaylı fiyat/priceCurrency/availability. Offer.seller→aynı Organization; veriler sunucu katalog otoritesinden gelir. Gerçek teklif yoksa fiyat/stock/sıfır fiyat/sonsuz availability uydurulmaz ve yayın kabulü açık kalır. Review/aggregateRating/sertifika sahte veya fixture olamaz.
- **FAQPage:** Question.name ve acceptedAnswer.text yalnız aynı URL'de görünür, kaynağı doğrulanmış yanıtla eşleşir. Ortak SSS ve ürün SSS kimlikleri tekrar etmeyecek şekilde mevcut graph'a eklenir; görünmeyen teyit cevabı yok. Google FAQ zengin sonucu hedeflenmez.
- **BreadcrumbList:** yalnız gerçek görünür gezinme hiyerarşisi. Ayrı ürün sayfası varsa Ana sayfa→gerçek ürün; tek landing'de hayali kategori/ürün URL'si üretme. Görünür tek seviye varsa onu tanımla; snippet kazanmak için yol uydurma.
- **llms.txt:** 074'teki dosyaya resmi kısa tanım, Tesisimiz, gerçek ürün URL/bölümleri, ortak SSS, toptan formu ve yayınlanmış satıcı/politika bağlantıları; kısa açıklamalı gerçek linkler. Dinamik fiyat/stok elle kopyalanmaz, doğrulanmış sayfaya link verilir. Tam site özeti gerekirse aynı kaynakla llms-full ayrı gerekçelendirilir; bu görevde zorunlu ikinci dosya değildir.
- **Sitemap/canonical/robots:** canonical `https://afinazeytin.com`; yalnız 200 + indekslenebilir gerçek sayfalar. Fragment ve filtre sorguları ayrı sitemap sayfası sayılmaz. Admin/hesap/sepet/ödeme/preview/API/özel veri sitemap ve llms'te yok; gerekli auth/noindex korunur. Robots tek başına güvenlik veya indeks silme aracı değildir.
- **AI arama erişimi:** kamu içerikleri Googlebot/Bingbot, OAI-SearchBot, Claude-SearchBot ve PerplexityBot için engellenmemeli. Özel user-agent grupları eklenirse 074'ün özel yol engelleri her ilgili grupta korunur; geniş Allow ile admin/ödemeyi açma. Eğitim botu GPTBot/ClaudeBot kararı otomatik genişletilmez. WAF/CDN gerçek yanıtı ve preview noindex ayrıca kontrol edilir.
- **GSC/Bing:** yayın/hesap erişimi sonrası sahiplik, sitemap gönderimi ve URL inspection kayıtları; bu belge hesap işlemi veya indekslenme kanıtı değildir. Haftalık aynı soru seti için motor/dil/tarih, kaynak URL/alıntı, referral ve marka sorgusu kaydı; başlangıç ölçümü yoksa görünürlük artışı iddiası yok.

## Gelecekte dokunulacak yerler

074'ün dosyaları; mevcut gerçek ürün detay/vitrin ve ortak SSS bileşeni; gerekirse tek kaynaklı soru-cevap veri modülü; mevcut SEO unit testi ve ürün/SSS e2e; `docs/kabul/087-aeo-geo.md`. Uygulama başlangıcında gerçek yollar doğrulanarak dar dosya listesi yazılır. Bu task DB migration, ürün güncelleme, ödeme/kargo servisi, yeni admin yetkisi veya route kararı vermez.

## Kabul kriterleri

- [ ] 24 aday kayıtlı; gerçek araştırma kaydı ile editoryal adaylar ayrılmış. Teyitsiz 12 soruya UI/schema/llms cevabı yazılmamış; sonradan teyit edilenlerde kaynak/sürüm mevcut.
- [ ] Resmi SEO başlığı/açıklaması ve seçilmiş B04 cevapları kaynakla birebir; gerçek ürün/satıcı bilgileri eşleşir. Yasak iddia, uydurma iletişim/fiyat/istatistik/review yok.
- [ ] Organization legalName/taxID/adres yukarıdaki kamu alanlarından; VKN string; ZEYTİN/topluluk yılları ve hukuki kimlikleri karıştırılmıyor.
- [ ] Product/Offer, tek Organization, görünür FAQPage ve gerçek BreadcrumbList doğrulanıyor; Schema.org validator + üretilmiş HTML eşitlik/negatif testleri. Rich result testi yalnız desteklenen Product türü için yardımcıdır; FAQ görünürlüğü başarı kriteri değildir.
- [ ] `npm run test -- tests/unit/seo.test.ts`, ilgili SSS/ürün e2e, lint/typecheck/build; normal/JS kapalı/reduced-motion ve mobil/klavye kabulü; bozuk link/çift @id/fixture schema yok.
- [ ] llms, robots, sitemap aynı kamu URL/katalog sınırını koruyor; özel bot grupları özel yol sınırlarını açmıyor. Preview noindex ile production ayrı raporlu.
- [ ] `docs/kabul/087-aeo-geo.md` kaynak eşlemesi ve eksik kullanıcı kararlarını içeriyor; GSC/Bing/gerçek AI kaynak görünürlüğü ölçülmediyse açık kabul maddesi. 076 bu çıktıya bağımlı.

## Güncel teknik kaynaklar — 2026-10-20

Google FAQ zengin sonuçları 7 Mayıs 2026'dan beri kaldırılmıştır; kitteki “sınırlı görünürlük” bilgisi yerine bu durum esas alınır. [Google güncellemeleri](https://developers.google.com/search/updates#may-2026). Google AI özellikleri için özel AI dosyası şart değildir: [Google rehberi](https://developers.google.com/search/docs/appearance/ai-features); [llms.txt yardımcı önerisi](https://llmstxt.org/).

Şema türleri: [Organization](https://schema.org/Organization), [Product](https://schema.org/Product), [Offer](https://schema.org/Offer), [FAQPage](https://schema.org/FAQPage), [BreadcrumbList](https://schema.org/BreadcrumbList). Arama/eğitim botları: [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). Uygulama gününde politikaları yeniden doğrula.

## Durum: BEKLİYOR
