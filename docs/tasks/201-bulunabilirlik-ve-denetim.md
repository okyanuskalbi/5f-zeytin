# Task 201: Bulunabilirlik (SEO/AEO/GEO) + kalite ve güvenlik denetimi

> `docs/MASTER-PROMPT.md` **A5 + A6** aşaması. Çelişkide MASTER-PROMPT geçerli.

## Tür
frontend + denetim

## Bağımlılık
199 (`607d5ec`) ve 200 (`6a30830`) TAMAMLANDI.

## Claude denetim notları (11 Kasım)
1. **Uzun tire kökten:** 199'da form/hesap/bayilik metinlerindeki `—`/`–` ekranda `.replace(/[—–]/g, "-")` ile gizlendi (`components/account/SignIn.tsx:96`, `Register.tsx:85`, `FormControls.tsx:41,46`, `components/dealership/DealershipFormClient.tsx:51,105,119`, `components/ui/customer-phone-field.tsx:39`). Bu geçici çözüm kaldırılsın; metinler kaynağında (lib/*, app/api/* hata mesajları dahil, ziyaretçiye dönen her metin) kısa çizgi/virgül olsun. Yalnız metin değişir, doğrulama mantığı değişmez. Kanıt: `rg -n "—|–" app components lib --glob '!**/*.test.*'` → yalnız kod yorumu/admin boş hücre gibi ziyaretçiye görünmeyenler; liste KANIT.md'de.
2. **Yönetim paneli özet kartları** yerelde "Veri yok" gösteriyor (`output/task200/panel-1440.png`); ürünler varken "Aktif ürün" kartı neden veri yok, kontrol et. Mantık değişikliği gerekiyorsa yapma, Coder Notu'na yaz.
3. Yerel test DB: `TEST_DATABASE_URL` (yerel Postgres `afina_kontrol189`).

## Amaç
Yeni ön yüzü arama motorları ve yapay zekâ cevap sistemleri için okunur hale getirmek; ardından tasarım, erişilebilirlik ve güvenlik denetimini yapıp bulguları kapatmak.

## Kullanılacak araçlar
`seo`, `ai-seo`, `aeo-geo-rehberi` (kaynak: `~/Desktop/WB AI PROJELER ICIN/AEO_GEO_Rehberi_Onur_Kocak.pdf` — §5 AEO sayfa iskeleti, §6 GEO teknik dosyalar, §7 schema tablosu, §10 kontrol listeleri), `impeccable` (critique → polish) ya da `audit-ai-design-slop` + `avoid-ai-ui-cliches`, `web-design-guidelines`, `better-accessibility`, `security-audit` (quick).

## Adımlar
1. Her sayfa: title, description, canonical, OpenGraph/Twitter; tek H1; başlık sırası.
2. JSON-LD: ana sayfa Organization + WebSite; iç sayfalar BreadcrumbList; blog BlogPosting (yazar, tarih); Product/Offer EKLEME (fiyat onayı bekliyor, sayfalar noindex kalır); SSS varsa FAQPage.
3. `robots.txt`, `sitemap.xml` (noindex sayfalar dışarıda), `llms.txt` yeni sayfa yapısına göre.
4. Blog 4 yazı AEO kontrol listesi (H1 soru, ilk 60 kelimede cevap, H2 soru, tablo/adım, ≥ 3 SSS, yazar + güncelleme tarihi, iç bağlantı).
5. Denetim: impeccable critique → bulguları düzelt → polish; axe 0 ihlal; ölü kod/ölü görsel 0; `security-audit` quick → confirmed bulgu 0 (needs_validation olanlar Coder Notu'na).
6. `output/task201/DENETIM.md` + `KANIT.md` (§14).

## Kabul kriterleri
- [x] lint, typecheck, test, build, `git diff --check` PASS.
- [x] Schema doğrulama scripti (JSON-LD parse + zorunlu alan) birim testi PASS.
- [x] Noindex kuralları korunmuş (ürün/kategori/fiyatlı sayfalar), sitemap'te yoklar.
- [x] impeccable/slop denetiminde açık bulgu yok; axe 0.

## Yapılmaması gerekenler
MASTER-PROMPT §15. Search Console/harici servislere kayıt yok (kullanıcı işi).

## Coder Notu (Codex)

11 Kasım 2026. Başlangıç `1c53b64`, temiz main. A5+A6 uygulandı; seçilen A
tasarımı, Fraunces/Figtree ve mevcut hareketler korundu. Sayfaya özel paylaşım
bilgileri, sabit BreadcrumbList, dört yazıda görünür SSS ile aynı FAQPage,
soru başlıkları/sıralı adımlar ve ayrı güncelleme tarihi tamamlandı. Yerel
JSON-LD doğrulayıcı parse/zorunlu alanları ve Product/Offer yasağını denetler.
Ürün/kategori/özel/hukuk noindex kuralları korunur; sitemap dışında kalırlar.
Keşif metnindeki eski bağlantı ve ticari durum açıklaması düzeltildi.

Claude notu 1: uzun çizgi taraması app/components/lib içinde 0eşleşme.
Arayüzdeki replace yamaları kaldırıldı; hata metinleri kaynağında düzeltildi.
Eski bayilik seçenek değeri `2\u20135` aynı kalır, görünür etiket `2-5` olur;
doğrulama mantığı ve kullanıcının girdiği noktalama değişmez. Auth/ödeme
dosyalarındaki değişiklikler yalnız ziyaretçiye dönen sabit mesajlardır.

Claude notu 2: yerel DB'de6aktif ürün var; panel sayfası AdminShell'e overview
vermediği için varsayılan empty durumunda "Veri yok" yazıyor. Ürün tablosunun
yükleyicisi ayrıdır. Özet yükleyicisini bağlamak iş/DB okuma mantığı değişikliği
gerektirir; talimata göre yapılmadı. **Ayrı iş olarak bekleniyor.**

Eleştiri/düzeltme/son incelemede CTA adı eşitlendi, bayilik gönderme açıklaması
sadeleştirildi ve tüketicisi olmayan product-image-focus sunum sabiti kaldırıldı.
757medya/font sınıflandırıldı; kanıtlanmış silinebilir medya adayı0. Test/demo ve
onaylı tarihsel provenans korunur; tüm dosyalar aktif kullanımda denmez.

Kabul:149dosya/1306test;lint,typecheck,Turbopack build,diff-check PASS.
Yeni şema15testi ve bulunabilirlik7testi PASS.38rota×4profil=152PASS;
son blog düzeltmesi5sayfa×5profil=25PASS.320/390WebKit/768/1440 ve son blogda
2560;axe0,taşma0,istenmeyen çakışma0,kırık görsel0,konsol/kaynak hatası0.
Ölçülebilen CLS en çok0.0136513; WebKit'in sunmadığı CLS0varsayılmaz.
29kaydedilmiş halka açık HTML şema komutundan geçti. No-JS/reduced blog PASS.
Bu A7tam cihaz/hız matrisi, fiziksel cihaz veya yayın kabulü değildir.

security-audit quick kaynak incelemesi: confirmed0,needs_validation0,rejected1.
Parola kurtarma oturum politikası adayı ihlal gösterilemediği için reddedildi;
auth mantığı değiştirilmedi. Quick tek dalga sınırında eski hash/sorgu
yönlendirme yolu1deferred; kapsam tam iddiası yok. Canlı servis/ayar ve saldırı
canlandırmaları yapılmadı. Ayrıntı output/task201/security/REPORT.md.

Kanıtlar output/task201/DENETIM.md ve KANIT.md (§14 ve12maddelik§14.1),
qa.json,polish/qa.json,source-quality.md ve son kontrol kayıtlarında.
Yalnız ortam TEST_DATABASE_URL ile localhost afina_kontrol189 kullanıldı;
geçici test hesabı/siparişi/adresi temizlendi, açılan tarayıcı/sunucular kapandı.
Node kontrollerinde .env* okumayı engelleyen koruma kullanıldı; ortam dosyası,
canlı DB, harici kayıt, push/yayın işlemi yok. node_modules ve .next korunur;
output ve AFINA-KAYNAK git'e eklenmez. Yeni paket/görsel/hareket yok.
21st5675arama erişimi ve UIPro yardım/stack doğrulandı; mevcut bileşenler
korundu. Kullanılan SEO/AEO, tasarım/erişilebilirlik ve quick güvenlik
skill'leri ile kaynak sınırları DENETIM.md içinde listelidir.

Tek yerel kayıt: `feat: 201 bulunabilirlik ve denetim`.

## Durum: TAMAMLANDI
