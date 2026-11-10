# Task 194: Hakkımızda ve Toptan Satış sayfaları

## Tür
frontend

## Amaç
Müşteri revizesi (BRIEF.md): "Hikayemizi Keşfet butonu … Hakkımızda sayfasına gidecek. Hakkımızda sayfasında Fabrika görseli ile klasik bir açıklama olacak." ve "Toptan Satış ve Bayilik Başvurusu … ikiside yeni bir sayfada açılsın. Mevcut yapıdaki Bayilik ve Toptan Satış sayfaları uygundur."

## Bağlam
- 192 ve 193'ten sonra. Bayilik sayfası `/bayilik` mevcut (açık temaya 192 ile uyumlu olmalı; gerekirse yalnız renk/üst bant uyumu).
- Toptan teklif formu bugün ana sayfada (`components/landing/RenewalLanding` → `QuoteSection`, `#toptan`/`#teklif`), ürün seçimi `QuoteJourneyProvider`, `?teklif=<id>` okuma `QuoteQuerySelection`.
- Ana sayfadan kalkan "Modern Üretim Tesisimiz", "Ellek'ten sofranıza", SSS ve iletişim bölümleri buraya taşınır.
- Fabrika görseli: `AFINA-KAYNAK/musteri-2026-11-10/fabrika.jpg` (192'de web türevi üretildi).

## Kullanılacak araçlar
- Fiilen yükle: `ui-ux-pro-max`, `frontend-design`, `better-layout`, `better-accessibility`, `responsiveness-check`, `copywriting` (yalnız doğru bilgiyle).
- ECC: `frontend-patterns`, `tdd-workflow`, `e2e-testing`, `seo`.

## Adımlar
1. **`/hakkimizda`:** üst bant (açık ton) içerik yolu + H1 "Hakkımızda"; fabrika görseli (büyük, sağ ya da üstte) + klasik açıklama (yalnız mevcut sitede/marka belgelerinde geçen doğru bilgiler: AFİNA Şirketler Topluluğu markası, Osmaniye Düziçi Ellek, kendi tesisinde ayıklama/salamura/paketleme/depolama, Ellek zeytini ve geleneksel doğal kırma; uydurma yıl/kapasite/ödül/sertifika YOK). Ardından ana sayfadan taşınan "Modern Üretim Tesisimiz" bilgisi, değerler (192'deki 3 ikon), SSS (mevcut `Faq` + FAQPage şeması korunur) ve iletişim bilgileri (mevcut). Metadata + BreadcrumbList; sitemap'e eklenir (fiyat içermez, indekslenebilir). `llms.txt`'e satır.
2. **`/toptan-satis`:** üst bant + H1 "Toptan Satış", kısa açıklama (otel, restoran, market, toplu tüketim; koli bazında teklif — mevcut metinler), mevcut teklif formu buraya taşınır (aynı doğrulama, e-posta taslağı akışı). `?teklif=<id>` ile ürün seçili gelir (mevcut `QuoteQuerySelection` davranışı bu sayfaya taşınır). Metadata + BreadcrumbList; sitemap + llms.txt.
3. **Bağlantılar:** tüm "Teklife ekle" / "Toptan teklif al" bağlantıları `/toptan-satis?teklif=<id>` olur. Ana sayfada form kalmaz. Eski `/?teklif=<id>` ve `/#toptan`, `/#teklif` → `/toptan-satis` (sunucu yönlendirmesi sorgu için; hash için istemci yönlendirmesi). `/#hakkimizda`, `/#tesisimiz` → `/hakkimizda`; `/#iletisim` → `/hakkimizda#iletisim`. Menü ve alt bilgi bağlantıları güncellenir.
4. Bayilik sayfası açık temayla tutarlı (192 sonrası kontrol; gerekiyorsa yalnız renk/üst bant).

## Kabul kriterleri
- [x] Unit: `/hakkimizda` H1, fabrika görseli, SSS + FAQPage, iletişim; uydurma rakam/ödül/sertifika yok. `/toptan-satis` formu, `?teklif=` seçimi, hatalar.
- [x] Ana sayfada teklif formu yok; tüm teklif bağlantıları `/toptan-satis?teklif=`; eski adres yönlendirmeleri çalışır (308 / istemci).
- [x] e2e: iki sayfa 390/768/1440 taşma yok, renk karşıtlığı 0 ihlal, CLS < 0.05; teklif akışı ürün sayfasından forma.
- [x] sitemap ve llms.txt iki sayfayı içerir; ürün/kategori sayfaları hâlâ yok.
- [x] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Uydurma kurumsal bilgi; form gönderim yöntemi değişikliği (e-posta taslağı kalır).
- Push/yayın yok; `node_modules`/`.next` silme; AFINA-KAYNAK git'e eklenmez.

## Coder Notu

- Task193 `e5326c2` tek kaydından sonra sırayla başlandı. BRIEF, aktif PLAN ve görev kapsamı okundu. Alt ajanlar Hakkımızda, Toptan Satış/ana sayfa taşıması ve test/bağımsız inceleme rollerinde çalıştı. `ui-ux-pro-max`, `frontend-design`, `better-layout`, `better-accessibility`, `responsiveness-check`, `copywriting`, `frontend-patterns`, `tdd-workflow`, `e2e-testing`, `seo` uygulandı; kurulu Next.js kuralları okundu. 21st MCP 29919 iletişim örneği hareketli küre nedeniyle uygun bulunmadı; mevcut onaylı bileşenler uyarlandı, ücretli kaynak/yeni bağımlılık yok.
- RED: yeni sayfa eski derlemede 404; kaynak keşif ve eski bağlantı testleri yeni hedefleri bulamadı. GREEN: Hakkımızda müşteri fabrika türevi, mevcut Ellek/AFİNA/tesis bilgileri, dört üretim adımı, üç değer, aynı beş SSS ve iletişimle hazır. Yeni kuruluş yılı, kapasite, ödül veya sertifika uydurulmadı. FAQPage yeni gerçek sayfa adresini gösterir; diğer kullanımlarda eski varsayılan korunur.
- Toptan Satış ayrı H1/breadcrumb/metadata ile mevcut QuoteSection/QuoteComposer'ı kullanır. Ürün seçimi, hatalar, KVKK, ülke/il/ilçe, odak ve manuel mailto taslağı aynı kaldı. Ana sayfadan form/SSS/iletişim kaldırıldı. Tüm teklif bağlantıları yeni hedefe gider. E-posta taslağı hazırlanması gerçek gönderim olarak sunulmaz.
- Küçük uygulama kararı: eski `kurumsal`, `uretim-yolculugu`, `toptan-iletisim` ve `sik-sorulanlar` adresleri de korunur. Sorgu taşıması 308 ile, sunucuya ulaşmayan hash'ler yalnız ana sayfada çalışan küçük istemci bileşeniyle yapılır; kaynak sorgusu korunur, geçerli ürün/başlangıç hash'leri yerinde kalır. Hem ilk giriş hem sonraki hash değişimi testlidir. Kurumsal iletişim bilgileri doluysa gösterilir; boş kişisel destek kanalı uydurulmaz.
- İki sayfa index/follow, canonical ve BreadcrumbList taşır; sitemap/llms.txt/llms-full.txt güncellendi. Ürün ve kategori fiyat sayfaları noindex ve sitemap dışında kalır. Üst menü/alt bilgi İletişim hedefi Hakkımızda içindeki gerçek bölümdür. Bayilik açık teması korundu.
- Son yerel kabul: 158 dosyada 1.450 unit PASS; mevcut 26 yerel DB testi yapılandırılmadığı için atlandı. `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` PASS. 194/189/190/191/192 ortak tarayıcı çalışması 77/77 PASS. 390/768/1440 iki sayfa görüntüleri ve raporlar `output/task194/`; CLS 0, taşma 0, renk karşıtlığı ihlali ve pageerror 0. Ürün → seçili 5 L teklif → hata → geçerli özet/mailto akışında GET/HEAD dışında istek 0; gönderim bağlantısına basılmadı. Eski testler silinmeden yeni sayfalara uyarlandı.
- Fiziksel cihaz ve Claude'un ayrı görsel kabulü bu yerel kabul değildir. Canlı DB, ödeme, ortam değişikliği, push veya yayın yok. AFINA-KAYNAK Git dışında; `node_modules` ve `.next` korundu. Açılan paketli headless Chromium ve yerel sunucu düzgün kapatıldı.

## Durum: TAMAMLANDI
