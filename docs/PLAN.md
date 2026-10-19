# Proje Planı

## Hedef
AFİNA ZEYTİN için afinazeytin.com üzerinde tek landing vitrin + satın alma akışı. En fazla 5–6 aktif ürün admin’den girilir; scroll ile sahneye giren ürünler, üyelik, sepet, ödeme, kampanya ve sipariş/kargo takibi tek müşteri yolunda birleşir. Örnek ürünler gerçek katalog değildir.

Kısaltmalar: ZEYTİN = `~/PROJELER/5F-ZEYTIN` / afinazeytin.com; KURUMSAL = `~/PROJELER/AFINA-KURUMSAL` / afina.com.tr. Kaynak görev: ZEYTİN `docs/tasks/000-kurulum.md`; workflow bölüm 6 iskeleti kullanıldı.

## Teknoloji
- Frontend: Next.js App Router, TypeScript, Tailwind CSS 4, shadcn/ui (resmi CLI), Framer Motion (`motion`), 21st MCP ile üretilip marka tokenlarına uyarlanmış UI.
- Backend: Next.js Route Handlers / sunucu servisleri; Supabase erişimi, ödeme callback’leri ve e-posta adapterı server-only.
- Veritabanı: yeni Supabase PostgreSQL projesi; ad/org ve oluşturma kullanıcı onayına bağlı. Supabase Auth üyelik; admin yetkisi sunucuda ayrı kontrol.
- Test: Vitest + Playwright; 001 görevi komutları/fixture/webServer’ı kurar. Yapılandırma task’ında o günkü resmi sürümler doğrulanıp lockfile ile sabitlenir; Task 000 uygulama bağımlılığı kurmaz.
- Yayın: Vercel, Cloudflare DNS; ekip/proje/alan adı bağlama zamanı kullanıcı kararıdır.

## Frontend / Backend sınırı
- API sözleşmesi: özellik task’ında `lib/contracts/` tipleri + şema doğrulama; katalog, cart quote, checkout, üyelik, admin ve tracking uçları testle sabitlenir.
- Frontend bağlantısı: Server Components katalog okur; client bileşenler typed Route Handler/servis çağırır. `lib/` sunucu ve istemci sınırları `server-only` ile ayrılır.
- Ödeme/kupon/fiyat/stok otoritesi sunucudur; tarayıcıdaki ücret veya sonuç URL parametresi güvenilir değildir. Supabase service_role ve sağlayıcı/e-posta sırları istemci bundle’ına girmez.

## Klasör yapısı
Planlanan uygulama dizinleri henüz oluşturulmaz; 001 ve ilgili görevlerde açılır.

```text
app/                     # landing, sepet, odeme, hesabim, siparis-takip, hukuk, admin
app/api/                 # products, cart/quote, checkout, payments callback, admin, cron
components/              # ui, site, landing, catalog, cart, checkout, account, admin
lib/                     # contracts, catalog, cart, auth, orders, pricing, payments, mail, shipping, seo
supabase/migrations/     # yalnız onaylı DB task’larında oluşturulur
public/images/generated/ # aday görseller ve manifest; kullanıcı onayı olmadan runtime’da kullanılmaz
_legacy/                 # korunmuş AI Studio React/Vite kodu ve varlıklar, salt referans
tests/unit/              # Vitest davranış ve sözleşme testleri
tests/e2e/               # Playwright, yerel webServer, Chromium/Firefox/WebKit
docs/PLAN.md             # mimari + açık kararlar + task dizini
docs/tasks/              # sırayla uygulanacak bağımsız task’lar
.claude/commands/build.md
.claude/rules/ecc/        # common, typescript, react, web
.claude/skills/           # proje skill kopyaları
.agents/skills/           # Codex skill kopyaları
```

## Mimari kararlar
| # | Karar | Gerekçe | Tarih |
|---|-------|---------|-------|
| 1 | App Router + TS + Tailwind 4; kökte app/ ve components/ | İstenen Next.js yapısı; src/frontend ve src/backend açılmaz | 2026-10-19 |
| 2 | motion + native scroll ve reduced-motion | Mobil/klavye erişimini koruyan sahne deneyimi | 2026-10-19 |
| 3 | 21st UI yönü; tokenlara özel uygulama | Varsayılan component görünümünü bırakmamak | 2026-10-19 |
| 4 | Claude plan/denetim, Codex ayrı üretim/uygulama görevleri | Her bileşen, animasyon ve entegrasyonu ayrı doğrulamak | 2026-10-19 |
| 5 | Task 000 yalnız doküman/iskelet/git; runtime ve servis kurulmaz | Kod/hesap/deploy yetkisini bu görevden ayırmak | 2026-10-19 |
| 6 | Fiyat/stok/kupon/ödeme sunucuda; callback idempotent | İstemci manipülasyonu ve çift işleme riskini engellemek | 2026-10-19 |
| 7 | Her yeni public tablo migration’ında açık GRANT/REVOKE; istemci grant’inde RLS | Kullanıcı erişimi ile service_role sınırını açık kılmak | 2026-10-19 |
| 8 | Özgün kod yalnız _legacy/; görseller aday/onay manifestiyle ayrılır | Referans kaybı ve onaysız yayın olmaması | 2026-10-19 |


## ZEYTİN kapsamı

- Marka AFİNA ZEYTİN, “Köklerinden aldığı güçle büyüyor”; #243A29 zeytin yeşili, #F5F1E7 fildişi, #D4B483 şampanya altını, altın dal + el logosu. Tek landing, scroll-linked/whileInView ürün sahneleri; en fazla 5–6 aktif ürün.
- Üyelik: kayıt/giriş, hesabım, yalnız kendine ait sipariş geçmişi. Sepet: drawer + sayfa, upsell/çapraz satış (ör. zeytin yanında zeytinyağı), onaylı eşiklerde kademeli adet indirimi.
- Ödeme: iyzico ve/veya PayTR seçimi açık; başlatma ve callback ayrı task, sunucuda tutar/para birimi/sipariş doğrulaması ve idempotency. Sandbox kanıtı, canlı tahsilat kanıtı değildir.
- Kupon/reklam kodu: yüzde/tutar, süre, kullanım limiti, UTM; terk edilen sepet tespiti, onaylı bekleme süresi, izinli e-posta ve yüzde kuponu ayrı entegrasyonlar.
- Admin: ürün (≤6), sipariş, kupon/kampanya, terk edilen sepet, müşteri, kargo bilgisi; shadcn CLI + tokenlara uyarlanmış UI. Admin firma/takip no girer, müşteri e-postası ve siparis-takip sayfası birbirinden ayrı görevler.
- SEO/AEO: Product + Organization, canonical, sitemap, robots, llms.txt. KVKK, mesafeli satış ve iade sayfaları kullanıcı metin/onayını bekler.

## Görsel üretim ve onay

`docs/visual-prompts.md` P01–P12 aynen korunur. Her prompt, her ürün slotu (≤6) ve tesisin iki oranı ayrı Codex görevidir; aynı ortak aday/onay sürecini paylaşırlar. Ürün listesinde bulunmayan slot için ürün uydurulmaz. Yeşil-beyaz “AFİNA Doğal Kırma Yeşil Zeytin 10 KG” teneke yalnız referanstır.

İstenen model: GPT Image 2.5, Atlas MCP `openai/gpt-image-2.5-flare`. Bu planda model erişimi doğrulanmış sayılmaz; ilgili üretim görevinde resmi araç/katalog ile kontrol edilir. Çıktılar `public/images/generated/`, kaynak/model/prompt/oran/hash/temsili durum ve kullanıcı kararı `docs/gorsel-onay.md` ile manifestte tutulur. Kullanıcı onayı olmadan uygulamaya alınmaz, videoya geçilmez. P08–P12 tasarım referansıdır; AI stüdyo/scroll editörü/3D uygulaması bu kapsamdan çıkartılamaz.

Tesis kimliği: iki katlı modern yapı, parlak zeytin-yeşili + mat siyah bloklar; siyah tabelada yeşil el yazısı “Afina” ve beyaz “ZEYTİN”; cam vitrinler; gri beton platform/basamak; saksı zeytinleri ve AFİNA bayrakları; kilitli parke avlu; Osmaniye/Çukurova ve parçalı bulutlu mavi gök. Kullanıcının temsili fotoğrafı korunarak premium altın saat/tone mapping, temiz avlu, kişi/plaka yok, doğru okunur tabela; hero/tesis ve KURUMSAL Zeytin sahnesi için 16:9 + 9:16 adaylar. Fotoğraf gelmeden üretim başlamaz.

## Salt okunur MLNEW referansı

`~/PROJELER/MLNEW` değiştirilmez; gerçek sırlar/katalog/iş kuralları kopyalanmaz. İncelenen örnek yollar: `lib/payments/provider.ts`, `lib/payments/iyzico.ts`, `lib/payments/paytr.ts`, `app/api/payments/iyzico/callback/route.ts`, `app/api/payments/paytr/callback/route.ts`, `app/api/checkout/route.ts`, `app/siparis-takip/`, `app/admin/`, `lib/mail/transport.ts`. Callback’te sunucu doğrulaması, koşullu/idempotent sipariş güncellemesi ve e-posta adapter sınırı yalnız mimari referanstır.

## Çalışma ve kabul düzeni

Her task tek sorumluluk taşır; bağımlılıkları `addBlockedBy` olarak task dosyasında da yazılıdır. UI bileşeni, hareketi, görsel üretimi ve servis entegrasyonu ayrı oturumlarda uygulanır. Tüm taslaklar BEKLİYOR; Task 000 bunları çalıştırmaz. DB/ödeme/auth görevleri başındaki onay kapısı kullanıcı kararını bekler.

001 sonrasında komut sözleşmesi: `npm run lint`, `npm run typecheck`, `npm run test -- tests/unit/<görev>.test.ts`, `npm run test:e2e -- tests/e2e/<görev>.spec.ts`, `npm run build`. Varlık kayıt görevinden sonra `npm run check:assets`; ZEYTİN DB görevlerinde yalnız onaylı yerel hedefte `supabase db reset --local` ve `supabase test db <dosya>`. Bunlar Task 000’da çalışır uygulama varmış gibi raporlanmaz.

Ara kontrol: temel/token/varlık görevlerinden sonra build + responsive doğrulama; her sahne/özellik grubundan sonra kendi testleri; servisli akışlardan sonra sandbox E2E; yayın öncesi erişilebilirlik/performans ve kullanıcı görsel/metin onayları. Yerel test/build, push, Vercel preview, gerçek alan adı, gerçek ödeme/e-posta ayrı kabul kapılarıdır.

## Açık kararlar

Bu maddeler kullanıcı kararıdır; aşağıdaki seçeneklerden hiçbiri otomatik seçilmedi.

1. ZEYTİN: yeni Supabase projesinin adı ve organizasyonu — kullanıcı onayı gerekli.
2. Ödeme: iyzico / PayTR / ikisi ve mağaza hesapları — açık.
3. E-posta: Resend / SMTP (nodemailer), gönderen alan adı ve doğrulaması — açık.
4. Kargo firması/firmaları ve otomatik takip API’si ihtiyacı — açık.
5. Terk edilen sepet indirim yüzdesi ve bekleme süreleri — açık; kademeli indirim eşikleri de kullanıcı tarafından verilecek.
6. Orijinal logolar, gerçek ürün listesi (en fazla 6) ve fiyatlar — açık; örnek ürünler gerçek katalog değildir.
7. Vercel ekip/proje ve alan adı bağlama zamanı — açık.

## Task listesi
| No | İsim | Tür | Bağımlı | Durum |
|----|------|-----|---------|-------|
| 001 | [Next.js App Router ve test temeli](tasks/001-bootstrap.md) | fullstack | — | BEKLİYOR |
| 002 | [Marka token ve UI temeli](tasks/002-tokens.md) | frontend | 001 | BEKLİYOR |
| 003 | [Görsel aday ve onay kaydı](tasks/003-asset-registry.md) | frontend | 001 | BEKLİYOR |
| 004 | [Tesis görseli — 16:9](tasks/004-factory-wide.md) | frontend | 003 | BEKLİYOR |
| 005 | [Tesis görseli — 9:16](tasks/005-factory-tall.md) | frontend | 003 | BEKLİYOR |
| 006 | [P01 — Ağaç / hero görsel adayı](tasks/006-p01.md) | frontend | 003 | BEKLİYOR |
| 007 | [P02 — Yeşil zeytin makro görsel adayı](tasks/007-p02.md) | frontend | 003 | BEKLİYOR |
| 008 | [P03 — Siyah zeytin makro görsel adayı](tasks/008-p03.md) | frontend | 003 | BEKLİYOR |
| 009 | [P04 — Hasat görsel adayı](tasks/009-p04.md) | frontend | 003 | BEKLİYOR |
| 010 | [P05 — Yağ damlası görsel adayı](tasks/010-p05.md) | frontend | 003 | BEKLİYOR |
| 011 | [P06 — Ürün packshot görsel adayı](tasks/011-p06.md) | frontend | 003 | BEKLİYOR |
| 012 | [P07 — Koleksiyon sofra görsel adayı](tasks/012-p07.md) | frontend | 003 | BEKLİYOR |
| 013 | [P08 — Masaüstü vitrin konsepti görsel adayı](tasks/013-p08.md) | frontend | 003 | BEKLİYOR |
| 014 | [P09 — Mobil vitrin konsepti görsel adayı](tasks/014-p09.md) | frontend | 003 | BEKLİYOR |
| 015 | [P10 — Admin genel bakış konsepti görsel adayı](tasks/015-p10.md) | frontend | 003 | BEKLİYOR |
| 016 | [P11 — Scroll editörü konsepti görsel adayı](tasks/016-p11.md) | frontend | 003 | BEKLİYOR |
| 017 | [P12 — Görsel stüdyosu konsepti görsel adayı](tasks/017-p12.md) | frontend | 003 | BEKLİYOR |
| 018 | [Ürün 1 — temsili teneke/şişe görseli](tasks/018-product-image-1.md) | frontend | 003 | BEKLİYOR |
| 019 | [Ürün 2 — temsili teneke/şişe görseli](tasks/019-product-image-2.md) | frontend | 003 | BEKLİYOR |
| 020 | [Ürün 3 — temsili teneke/şişe görseli](tasks/020-product-image-3.md) | frontend | 003 | BEKLİYOR |
| 021 | [Ürün 4 — temsili teneke/şişe görseli](tasks/021-product-image-4.md) | frontend | 003 | BEKLİYOR |
| 022 | [Ürün 5 — temsili teneke/şişe görseli](tasks/022-product-image-5.md) | frontend | 003 | BEKLİYOR |
| 023 | [Ürün 6 — temsili teneke/şişe görseli](tasks/023-product-image-6.md) | frontend | 003 | BEKLİYOR |
| 024 | [Landing navigasyon ve footer](tasks/024-shell.md) | frontend | 002 | BEKLİYOR |
| 025 | [Hero bileşeni](tasks/025-hero.md) | frontend | 024 | BEKLİYOR |
| 026 | [Hero hareketi](tasks/026-hero-motion.md) | frontend | 025 | BEKLİYOR |
| 027 | [ONAY GEREKLİ — Yerel Supabase doğrulama ortamı](tasks/027-supabase-local.md) | backend | 001 | BEKLİYOR |
| 028 | [ONAY GEREKLİ — Ürün şeması ve RLS](tasks/028-catalog-db.md) | backend | 001, 027 | BEKLİYOR |
| 029 | [ONAY GEREKLİ — Katalog okuma entegrasyonu](tasks/029-catalog-api.md) | backend | 028 | BEKLİYOR |
| 030 | [Ürün kartı bileşeni](tasks/030-product-card.md) | frontend | 002, 029 | BEKLİYOR |
| 031 | [Ürün kartı scroll hareketi](tasks/031-card-motion.md) | frontend | 030 | BEKLİYOR |
| 032 | [Landing sahne orkestrasyonu](tasks/032-scenes.md) | frontend | 026, 031 | BEKLİYOR |
| 033 | [Hikâye ve tesis bölümü](tasks/033-facility.md) | frontend | 032 | BEKLİYOR |
| 034 | [Onaylı ZEYTİN görsellerini yerleştirme](tasks/034-asset-handoff.md) | frontend | 003, 033, 030 | BEKLİYOR |
| 035 | [Yerel sepet durumu](tasks/035-cart-state.md) | frontend | 030 | BEKLİYOR |
| 036 | [Sepet drawer](tasks/036-cart-drawer.md) | frontend | 035, 024 | BEKLİYOR |
| 037 | [Sepet sayfası](tasks/037-cart-page.md) | frontend | 035 | BEKLİYOR |
| 038 | [Ürün ve navigasyonu sepet akışına bağlama](tasks/038-cart-wire.md) | frontend | 035, 030, 036, 037, 024 | BEKLİYOR |
| 039 | [Sepette çapraz satış ve indirim sunumu](tasks/039-upsell.md) | frontend | 036, 037, 038 | BEKLİYOR |
| 040 | [ONAY GEREKLİ — Supabase üyelik altyapısı](tasks/040-auth-core.md) | backend | 028 | BEKLİYOR |
| 041 | [ONAY GEREKLİ — Kayıt akışı](tasks/041-register.md) | fullstack | 040, 002 | BEKLİYOR |
| 042 | [ONAY GEREKLİ — Giriş akışı](tasks/042-login.md) | fullstack | 040, 002 | BEKLİYOR |
| 043 | [ONAY GEREKLİ — Hesabım sayfası](tasks/043-account.md) | fullstack | 042 | BEKLİYOR |
| 044 | [ONAY GEREKLİ — Sipariş şeması](tasks/044-orders-db.md) | backend | 040, 028 | BEKLİYOR |
| 045 | [ONAY GEREKLİ — Sipariş oluşturma API](tasks/045-checkout-api.md) | backend | 044, 035 | BEKLİYOR |
| 046 | [ONAY GEREKLİ — Ödeme bilgi formu](tasks/046-checkout-ui.md) | frontend | 045, 037 | BEKLİYOR |
| 047 | [ONAY GEREKLİ — Onaylanan ödeme sağlayıcısı başlatma](tasks/047-payment-adapter.md) | backend | 045 | BEKLİYOR |
| 048 | [ONAY GEREKLİ — Checkout ödeme sağlayıcısı bağlantısı](tasks/048-payment-embed.md) | frontend | 047, 046 | BEKLİYOR |
| 049 | [ONAY GEREKLİ — Ödeme callback doğrulaması](tasks/049-payment-callback.md) | backend | 047 | BEKLİYOR |
| 050 | [ONAY GEREKLİ — Ödeme sonucunu sunucudan gösterme](tasks/050-payment-result.md) | frontend | 049, 046, 048 | BEKLİYOR |
| 051 | [Onaylı e-posta servisi adapterı](tasks/051-mail.md) | backend | 001 | BEKLİYOR |
| 052 | [ONAY GEREKLİ — Sipariş bildirimi entegrasyonu](tasks/052-order-email.md) | backend | 051, 049 | BEKLİYOR |
| 053 | [ONAY GEREKLİ — Kupon ve kampanya şeması](tasks/053-coupons-db.md) | backend | 044 | BEKLİYOR |
| 054 | [ONAY GEREKLİ — Kupon ve kademeli fiyat hesaplama](tasks/054-pricing.md) | backend | 053, 045 | BEKLİYOR |
| 055 | [ONAY GEREKLİ — Sunucu fiyatını sepet ve checkout gösterimine bağlama](tasks/055-quote-ui.md) | frontend | 054, 037, 046, 039 | BEKLİYOR |
| 056 | [ONAY GEREKLİ — Terk edilen sepet ve izin şeması](tasks/056-cart-db.md) | backend | 040, 053 | BEKLİYOR |
| 057 | [ONAY GEREKLİ — Terk edilen sepet tespiti](tasks/057-cart-capture.md) | backend | 056, 035 | BEKLİYOR |
| 058 | [ONAY GEREKLİ — İzinli sepet olaylarını snapshot API bağlantısı](tasks/058-cart-sync.md) | frontend | 057, 035, 046 | BEKLİYOR |
| 059 | [ONAY GEREKLİ — Terk edilen sepet zamanlayıcısı](tasks/059-cart-scheduler.md) | backend | 057, 058 | BEKLİYOR |
| 060 | [ONAY GEREKLİ — Sepet geri kazanım kuponlu e-posta](tasks/060-recovery.md) | backend | 059, 054, 051 | BEKLİYOR |
| 061 | [ONAY GEREKLİ — Pazarlama iznini geri çekme bağlantısı](tasks/061-unsubscribe.md) | backend | 060 | BEKLİYOR |
| 062 | [ONAY GEREKLİ — Admin yetki kapısı](tasks/062-admin-auth.md) | backend | 040 | BEKLİYOR |
| 063 | [ONAY GEREKLİ — Admin kabuk bileşeni](tasks/063-admin-shell.md) | frontend | 062, 002 | BEKLİYOR |
| 064 | [ONAY GEREKLİ — Admin ürün yönetimi](tasks/064-admin-products.md) | fullstack | 063, 029 | BEKLİYOR |
| 065 | [ONAY GEREKLİ — Admin sipariş yönetimi](tasks/065-admin-orders.md) | fullstack | 063, 044 | BEKLİYOR |
| 066 | [ONAY GEREKLİ — Admin kupon ve kampanya yönetimi](tasks/066-admin-coupons.md) | fullstack | 063, 054 | BEKLİYOR |
| 067 | [ONAY GEREKLİ — Admin terk edilen sepet görünümü](tasks/067-admin-carts.md) | fullstack | 063, 060 | BEKLİYOR |
| 068 | [ONAY GEREKLİ — Admin müşteri görünümü](tasks/068-admin-customers.md) | fullstack | 063, 043, 044 | BEKLİYOR |
| 069 | [ONAY GEREKLİ — Admin kargo bilgisi girişi](tasks/069-shipping-admin.md) | fullstack | 065 | BEKLİYOR |
| 070 | [ONAY GEREKLİ — Kargo bildirimi e-postası](tasks/070-shipping-email.md) | backend | 069, 051 | BEKLİYOR |
| 071 | [ONAY GEREKLİ — Sipariş takip sayfası](tasks/071-tracking.md) | fullstack | 069 | BEKLİYOR |
| 072 | [ONAY GEREKLİ — Hesabım sipariş geçmişi](tasks/072-history.md) | fullstack | 043, 071 | BEKLİYOR |
| 073 | [KVKK ve satış/iade sayfaları](tasks/073-legal.md) | frontend | 024 | BEKLİYOR |
| 074 | [Ürün SEO ve AEO](tasks/074-seo.md) | frontend | 033, 029, 073 | BEKLİYOR |
| 075 | [ONAY GEREKLİ — Satın alma akışı bütünleşik kabul](tasks/075-commerce-e2e.md) | fullstack | 054, 050, 052, 039, 072, 070, 064, 066, 067, 068, 048, 055, 058, 061, 041, 038 | BEKLİYOR |
| 076 | [Mobil erişilebilirlik ve hareket/performance kabulü](tasks/076-quality.md) | frontend | 074, 032, 037, 075, 034 | BEKLİYOR |
| 077 | [ONAY GEREKLİ — Onaylı uzak Supabase hedefini hazırlama](tasks/077-supabase-target.md) | backend | 076, 027, 028, 044, 053, 056 | BEKLİYOR |
| 078 | [Vercel önizleme dağıtımı](tasks/078-preview.md) | fullstack | 076, 077 | BEKLİYOR |
| 079 | [Domain ve canlı yayın kabulü](tasks/079-launch.md) | fullstack | 078 | BEKLİYOR |
