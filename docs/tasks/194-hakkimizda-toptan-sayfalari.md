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
- [ ] Unit: `/hakkimizda` H1, fabrika görseli, SSS + FAQPage, iletişim; uydurma rakam/ödül/sertifika yok. `/toptan-satis` formu, `?teklif=` seçimi, hatalar.
- [ ] Ana sayfada teklif formu yok; tüm teklif bağlantıları `/toptan-satis?teklif=`; eski adres yönlendirmeleri çalışır (308 / istemci).
- [ ] e2e: iki sayfa 390/768/1440 taşma yok, renk karşıtlığı 0 ihlal, CLS < 0.05; teklif akışı ürün sayfasından forma.
- [ ] sitemap ve llms.txt iki sayfayı içerir; ürün/kategori sayfaları hâlâ yok.
- [ ] `npm run lint`, `typecheck`, `test`, `build`, `git diff --check` yeşil.

## Yapılmaması gerekenler
- Uydurma kurumsal bilgi; form gönderim yöntemi değişikliği (e-posta taslağı kalır).
- Push/yayın yok; `node_modules`/`.next` silme; AFINA-KAYNAK git'e eklenmez.

## Durum: BEKLİYOR
