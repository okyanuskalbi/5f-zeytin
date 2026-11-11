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
- [ ] lint, typecheck, test, build, `git diff --check` PASS.
- [ ] Schema doğrulama scripti (JSON-LD parse + zorunlu alan) birim testi PASS.
- [ ] Noindex kuralları korunmuş (ürün/kategori/fiyatlı sayfalar), sitemap'te yoklar.
- [ ] impeccable/slop denetiminde açık bulgu yok; axe 0.

## Yapılmaması gerekenler
MASTER-PROMPT §15. Search Console/harici servislere kayıt yok (kullanıcı işi).

## Durum: BEKLİYOR (199 + 200 sonrası)
