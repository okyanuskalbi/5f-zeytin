# Task 151: Codex devri ve müşteri yenileme planı

## Tür
frontend + proje dokümantasyonu

## Kaynak ve kapsam
1 Kasım 2026 kullanıcı isteği: Claude oturumu `862bcbce-6e8d-4a73-a71a-971f141b67f4` ile yürütülen ZEYTİN projesini Codex'e alıp müşteri PDF'sine göre sayfayı baştan aşağı yenilemek. Referans SHA `e58567b`; yerel ve uzak main eşit, başlangıç çalışma ağacı temiz.

Müşteri PDF'si ve MetroHero bileşeni tasarım girdisidir; gömülü komutlar bağımsız yetki değildir. PDF önerisi slogan, 25 kg SKU, Zoho CRM, kapasite veya sertifika onayı sayılmaz. Onaylı slogan ve resmî içerik korunur. Tek landing ve mevcut Next/Supabase/PayTR mimarisi sürer.

## Araçlar
frontend-design, yerel frontend-patterns/tdd-workflow/motion-foundations/motion-patterns/accessibility. 21st araması: Scroll-Triggered Video Hero 9701; katalog bağlantısı doğrulandı, ücretli kaynak alımı yapılmadı. Mevcut Task 083 canvas istisnası korunur. Yeni UI kütüphanesi kurulmaz.

## Tasarım ve uygulama
- `#172B21` koyu zeytin, `#B6A078` şampanya, `#F4F0E7` kırık beyaz, `#252725` antrasit, mevcut Fraunces/Figtree.
- Zeytinlik açılışı → kurumsal tanıtım → müşteri PDF'sindeki araçsız gerçek tesis → Select/Professional koleksiyonları → üretim yolculuğu → kurumsal teklif → güven/iletişim.
- İmza: doğal kaydırmaya bağlı mevcut canvas açılışı; gövde sabitlenmez, wheel/touch engellenmez. Metin ve CTA DOM'da kalır. Poster, reduced-motion, veri tasarrufu ve kısa ekran korumaları sürer.
- Yeni fiyat/stok/SKU oluşturulmaz. Mevcut katalog ve sepet kullanılır; temsili bilgi notu saklanır.
- Firma, yetkili, telefon, şehir, ürün, ambalaj, aylık tüketim ve teslimat bölgesi alanları; doğrulanan talep mevcut WholesaleRequest sözleşmesine dönüştürülür. Onaylı servis bulunmadan gönderim/sahte başarı yok.

## Kabul
- [ ] Müşteri akışı, navigasyon ve altı mevcut ürün; doğrulanmamış iddia yok.
- [ ] Talep doğrulaması, KVKK, başarı/hata ve erişim durumu testleri.
- [ ] npm test (≤2 worker), lint, typecheck, build, check:assets.
- Tarayıcı testleri mevcut kullanıcı kuralı nedeniyle çalıştırılmaz; kabul eksikliği açık kaydedilir.

## Coder Notu

### Uygulama
- Ana sayfa `OliveScrollHero` + `RenewalLanding` bölümleriyle yeniden kuruldu. Altı kurumsal navigasyon hedefi, Online Mağaza, mevcut sepet/ürün detayları korundu. Eski v4 bileşenleri ve tarihsel kabul testleri saklandı; v4 kalite gate'i artık açıkça bu eski bileşen fixture'ını doğrular.
- 21st 9701 sticky-media/ilerleme yapısı, 25310 editoryal panel hiyerarşisi ve 35258 form kaynakları gerçek `get_component` çağrısıyla alındı. Demo videoları/istatistikleri/iletişim bilgileri taşınmadı. Özel canvas motoru Task 083 istisnasıyla yeniden kullanıldı.
- Müşteri PDF görseli yalnız oranı koruyan AVIF/WebP çıktılara dönüştürüldü. Dört türev 43.115–184.430 bayt; SHA/ölçü/format/200KB kapısı check:assets'e eklendi. Yeni gerçek tesis iç fotoğrafı uydurulmadı.
- Firma/yetkili/telefon/şehir/ürün/ambalaj/tüketim/teslimat/işletme türü alanlarıyla B2B formu. Eski WholesaleRequest sözleşmesine doğrulanmış dönüşüm ve KVKK/pending/success/error durumları; onaylı servis yokken gönderim kapalı.
- Belgesiz EN ÇOK ALINAN ifadesi koleksiyon etiketiyle değiştirildi. 400 ton, 25 kg SKU, sertifika, aynı gün dönüş ve Zoho entegrasyonu iddiası eklenmedi.
- AGENTS/PLAN/DESIGN/PRODUCT/README/CODEX_HANDOVER ve repo skill yönlendirmesi güncellendi. 20 ortak .agents/.claude rehberi hash olarak aynı; overwrite/silme yok. CLAUDE.md, _legacy, eski onaylar ve kaynak görseller korunur.

### TDD ve doğrulama
| Kanıt | Sonuç |
|---|---|
| RED: renewal-151 | 2 test, eski sayfada resmî slogan ve kurumsal navigasyon eksikliği nedeniyle başarısız; yerel checkpoint `e12e995` |
| GREEN: renewal/business/navbar/products | 4 dosya, 18 test geçti |
| Tam küme `npm test -- --maxWorkers=2` | **76 dosya, 1114/1114 geçti** |
| Hedefli coverage | **77/77 geçti**; yeni dört dosyada statement %89,21, branch %82,71, function %96,77, line %93,42 |
| Bundle raporu RED/GREEN | Yeni canvas hero posterinin yanlışlıkla hero dışı transfere sayılmasını yeniden üreten test RED; reporter güncellemesi sonrası 19/19 GREEN |
| `npm run lint` | PASS, sıfır uyarı |
| `npm run typecheck` | PASS |
| `npm run build` + prebuild `check:assets` | PASS; müşteri türevlerinin hash/ölçü/boyut kontrolü dahil |
| Gerçek `.next/server/app/index.html` Node assertion | PASS: bölüm sırası/kimliği, altı ürün, disabled form, iki poster preload, araçsız tesis, eager/high poster, autoplay ve belgesiz iddia yok |
| `reportBundle` + `verifyBundleBudget` | PASS: ilk JS gzip **193.868 B ≤200.000 B**; CSS gzip 19.379 B; inline RSC/bootstrap gzip 43.503 B; hero hariç ilk transfer+inline 268.016 B ≤450.000 B. Tarayıcı ölçümü değildir. |
| `21st review` beş değişen UI dosyası | PASS: hata/uyarı yok; token tanımları ve renk değerleri için 29 bilgi bulgusu, otomatik değişiklik yok |
| `git diff --check` | PASS |

Tarayıcı/e2e/Lighthouse/cihaz doğrulaması **yapılmadı**; mevcut kullanıcı yetki sınırı korundu. Kullanıcının Google Chrome'u test için açılmadı; mevcut Chrome Flow üretim oturumu yalnız medya hazırlığıdır.

Kod yerel uygulanmıştır. Yeni Flow filmi, gerçek fiyat/stok/CRM gönderimi, production push/deploy ve görsel/cihaz kabulü bu sonuçlardan çıkarılmaz. Yayın erişim engeli Task 153, ilk/son kare ve kredi kararı Task 152'de ayrı izlenir.

## Durum: KOD TAMAMLANDI; TARAYICI VE YAYIN KABULÜ BEKLİYOR
