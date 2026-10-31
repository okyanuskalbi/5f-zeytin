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

## Durum: UYGULANIYOR
