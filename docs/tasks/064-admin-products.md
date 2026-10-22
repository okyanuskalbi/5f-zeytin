> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 064: Admin ürün yönetimi

## Tür
fullstack

## Amaç
En fazla 6 ürünü admin’den yönet.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 063 (admin-shell); 029 (catalog-api). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Admin görsel sözleşmesi

Görsel referans: docs/referans/admin-stil.md ([stil belgesi](../referans/admin-stil.md)).

shadcn bileşenleri (ortak liste): **Sidebar, Card, Table + sıralama, Chart, Command/search, Badge**. Her biri yalnız ilgili yüzey gerektiğinde kullanılır; shadcn için MCP yok, resmi CLI ile incele/ekle ve ZEYTİN tokenları + Figtree’ye uyarla. Ayrıntılı yerleşim ve erişilebilirlik kabulü stil belgesindedir.

Ürün Table sıralaması ve durum Badge’leri; en fazla 6 gerçek ürün ve mevcut form/yetki sınırı korunur. **ONAY GEREKLİ** kapısı ve mevcut bağımlılıklar değişmez.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, api-design, security-review
- 21st MCP: evet — ürün tablosu/formu
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/admin/urunler/page.tsx` (oluştur / düzenle)
- `app/api/admin/products/route.ts` (oluştur / düzenle)
- `components/admin/ProductForm.tsx` (oluştur / düzenle)
- `tests/e2e/admin-products.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ekle/düzenle/yayından kaldır, stok/fiyat ve upsell ilişkisi; sunucu limit/yetki/doğrulama; gerçek ürünler kullanıcıdan, onaysız görsel yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/admin-products.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Kullanıcı onayı (22 Eki 2026) — ONAY GEREKLİ kapısı karşılandı
- Kullanıcı 1. aşamayı onayladı: 027, 028, 029, 040–043, 062–064 (sırayla). 077 (canlıya kurulum) Claude + kullanıcı tarafından ayrıca yapılacak; bu zincirde **canlı Supabase'e bağlanma, migration uygulama yok**.
- Supabase projesi: `fzwtfkvffyajppavrbbb` (`https://fzwtfkvffyajppavrbbb.supabase.co`). Vercel'de `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable), `SUPABASE_SERVICE_ROLE_KEY` (secret) production+development'ta tanımlı. Yerelde `.env*` okuma/yazma yok; kod bu adları kullanır.
- **Yönetici:** `admin@afina.com.tr` (062 yetki kapısı bu e-postayı ilk yönetici olarak tanır; ek yöneticiler tablodan).
- **Giriş yöntemi:** e-posta + şifre ve e-posta bağlantısı (magic link). Google ile giriş **sonra** (Google OAuth istemcisi henüz yok); kodda kapalı bayrakla hazır olabilir.
- **Docker ve Supabase CLI yok.** Yerel doğrulama Docker gerektiren `supabase start` yerine **PGlite** ile: migration'lar bellekte çalışan PostgreSQL'de uygulanır, RLS/GRANT davranışı (`anon`, `authenticated`, `service_role` rolleri ve `auth.uid()` taklidi) testlenir. `@electric-sql/pglite` devDependency olarak eklenebilir. Migration dosyaları `supabase/migrations/` altında, Supabase CLI formatında.
- Global kural: public şemada yeni tablo oluşturan her migration'a açık GRANT (sunucu-only: anon/authenticated revoke + service_role s/i/u/d; istemci: anon select, authenticated+service_role s/i/u/d). anon/authenticated grant alan tabloda RLS zorunlu.
- Mevcut v4 arayüzü (118–133) bozulmaz; ürünler DB'den okununca görünüm aynı kalır, DB yoksa/erişilemezse mevcut statik katalog yedek olarak çalışır.


## Coder Notu

- 22 Ekim 2026 kullanıcı onayı ve `063-admin-shell` / `029-catalog-api` görevlerinin TAMAMLANDI kayıtları doğrulandı. ECC `frontend-patterns`, `api-design`, `security-review`; eklenen yerel migration için `database-migrations` ve `postgres-patterns` okundu. Kurulu Next.js 16.4.2'nin Route Handlers ve Server/Client Components belgeleri esas alındı. Ek skill veya bağımlılık kurulmadı.
- 21st MCP'den kullanılabilir ürün tablosu/formu referansı alınamadı (üç sorgu). Resmi shadcn CLI ile `docs table badge input textarea`, `view @shadcn/table`, `add table --yes` çalıştırıldı; [resmi Data Table](https://ui.shadcn.com/docs/components/radix/data-table) ve [Supabase RPC](https://supabase.com/docs/reference/javascript/rpc) belgeleri incelendi. Yeni Table ve mevcut Badge/Input/Button, kabuğun yerel açık gri/beyaz/zeytin yeşili tokenları, Figtree, 8px köşe, görünür odak ve 44px etkileşim alanlarına uyarlandı. Vitrin tasarımı değiştirilmedi.
- `/admin/urunler` render öncesinde yeniden `requireAdmin()` çağırır. AdminShell ürün sayfasını taşımak için çocuk içerik/aktif alan desteği aldı; ürün bağlantısı mevcut sayfaya, diğer alanlar mevcut genel bakış bölümlerine gider. Ürün sayfasında örnek operasyon özeti gösterilmez; gerçek DB sonucu boşsa boş durum, erişilemiyorsa hata gösterilir. Statik katalog admin'e gerçek kayıt olarak alınmaz.
- `GET /api/admin/products`: her okumada admin kontrolü, açık sütun projeksiyonu, 20 kayıtlık sunucu sayfalaması, tüm sonuçta allowlist ile ad/fiyat/stok/yayın sıralaması ve deterministik ID ikinci sırası; aktif ürün sayısı ve yalnız yayındaki upsell seçenekleri. Oluşturulan kaydın Location bağlantısı için tam ID filtresi vardır. Yanıtlar private/no-store; DB hatasında ham sağlayıcı bilgisi veya örnek katalog döndürülmez. Sorgular 5 saniye ile sınırlı, otomatik tekrar kapalıdır.
- POST/PATCH/DELETE mevcut `requireAdminMutation()` yetki/Origin/CSRF kapısından geçer. Akış 16 KiB JSON sınırı, katı alan allowlist'i, kategori/metin/ID doğrulaması, PostgreSQL integer sınırında negatif olmayan kuruş/stok ve tekrarsız/kendisi olmayan upsell doğrulaması içerir. İstemcinin görsel, para birimi, aktif slot veya başka alan ataması reddedilir. POST yeni kayıt, PATCH düzenleme, DELETE yalnız yayından kaldırma yapar; fiziksel ürün silinmez. Kullanıcı ürünü/fiyatı/görseli uydurulmadı veya seed edilmedi.
- `20261022000003_admin_products.sql` yalnız yerel migration dosyasıdır: FK/kendine referans kısıtlı `product_upsells`, açık anon/authenticated REVOKE ve service_role SELECT/INSERT/UPDATE/DELETE, RLS/FORCE RLS; yalnız service_role EXECUTE alan SECURITY INVOKER kaydet/yayından kaldır fonksiyonları. Ürün + upsell değişimi tek RPC transaction'ındadır; yönetim mutasyonları transaction advisory lock ile sıralanır, 028'in altı benzersiz aktif slot kısıtı korunur. Yayından kalkan hedefin gelen upsell ilişkileri temizlenir. Migration'a yerel reset / yayından sonra yeni forward migration geri alma notu eklendi. Canlı PostgreSQL eşzamanlılık veya uzak migration kabulü iddia edilmez.
- Form boş başlar ve kategoriyi kullanıcı seçer. TL fiyat ondalık basamaklarından doğrudan kuruşa çevrilir; stok sıfır olabilir, yeni ürün varsayılan olarak yayında değildir. Altı aktif ürün doluyken yeni yayına alma seçimi kapanır; son otorite DB kısıtıdır. Upsell yalnız aktif hedeflerden seçilir. Kaydetme sırasında tekrar tıklama engellenir; hata halinde alanlar korunur, ağ belirsizliğinde önce listeyi yenileme mesajı vardır. Yayından kaldırma açık onay ister. Form açılışı/iptal ve işlem sonucu odağı, klavye sıralaması/aria-sort, odaklanabilir yatay tablo kaydırması ve reduced-motion CSS eklendi.
- Görevdeki dosya listesine eklenen destek dosyaları yalnız bu yüzeyin sözleşmesi, ProductManager/CSS, resmi Table primitive'i, migration, davranış unit testleri ve E2E fixture/helper'ıdır. Mevcut kabuk testleri ürün sayfası bağlantısına uyarlandı. Test fixture'ları üretim kodunca import edilmez; auth bypass veya demo yönetici oturumu yoktur.
- `.env*` dosyaları okunmadı/yazılmadı. Komutlar mevcut git dışı `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` ile dotenv yüklemesini engelledi; build yalnız loopback URL ve sahte anahtarlarla çalıştı. Canlı Supabase bağlantısı, uzak migration, gerçek ürün işlemi veya e-posta/ödeme işlemi yapılmadı. Uzak DB kurulumu 077'de Claude + kullanıcıya aittir.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm test -- tests/unit/admin-products-api.test.ts tests/unit/admin-products-db.test.ts --maxWorkers=2` → **exit 1**, eksik route / SQL fonksiyonları. UI RED: `npm test -- tests/unit/admin-products-ui.test.tsx --maxWorkers=2` → **exit 1**, eksik ProductManager. Sonraki kategori-dizi regresyon testi de önce başarısız koşuldu, doğrulama düzeltildikten sonra geçti. RED/ara commit oluşturulmadı veya push edilmedi.
- GREEN: görevin üç yeni unit dosyasında **48 test**; mevcut kabuk dahil ilgili dört dosyada **65 test**. Yetkisiz 401/403/503, gerçek same-origin CSRF reddi, alan/JSON/boyut sınırları, sıralama/sayfalama/ID filtresi, boş ve bozuk DB verisi, tek RPC, çatışma/404/503, PGlite altı aktif ürün sınırı, düzenleme, yetkisiz SQL erişimi, geçersiz upsell ve kaydın korunması doğrulandı. UI testleri yükleme/boş/hata/yeniden deneme, boş form, kuruş dönüşümü, upsell, hata halinde alanların korunması ve yayından kaldırma onayını kapsar. API testlerinde yetki sonuçları ve ağ yanıtları kontrollü taklit edildi; CSRF senaryosu gerçek mevcut guard'ı, sorgular gerçek SDK'yi kullandı. DB testleri bellekte gerçek PostgreSQL yürüttü.
- Son tam koşu: `npm test -- --maxWorkers=2` → **exit 0, 58 dosyada 915 test başarılı**.
- Göreve özel coverage: `npm test -- tests/unit/admin-products-api.test.ts tests/unit/admin-products-db.test.ts tests/unit/admin-products-ui.test.tsx --maxWorkers=2 --coverage --coverage.include=app/api/admin/products/route.ts --coverage.include=app/admin/urunler/page.tsx --coverage.include=lib/contracts/admin-products.ts --coverage.include=components/admin/ProductForm.tsx --coverage.include=components/admin/ProductManager.tsx` → **exit 0**; ölçülen dosyalarda statements **211/238 (%88,65)**, branches **229/267 (%85,76)**, functions **45/54 (%83,33)**, lines **160/168 (%95,23)**. Global coverage iddiası değildir.
- `npm run lint && npm run typecheck && npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti; `/admin/urunler` ve `/api/admin/products` dinamik route olarak derlendi. 34 public build dosyası Node assertion ile tarandı: servis anahtarı işareti veya `SUPABASE_SERVICE_ROLE_KEY` referansı yok. `git diff --check` başarılı.
- `compileAdminProductsFixture()` Node + Vite ile yalnız **bellekte derlendi**; HTML/JS/CSS çıktıları assertion ile doğrulandı, tarayıcı başlatılmadı. E2E dosyası üretim yetki reddi; 320/390/768/1024/1440px × normal/reduced-motion; klavye/sıralama, ekle/düzenle/yayından kaldır, upsell, hata/boş/iyileşme, 6 aktif sınırı, yatay kaydırma ve mobil menü/ESC/odak senaryolarını içerir.
- **Claude doğrulayacak:** `npm run test:e2e -- tests/e2e/admin-products.spec.ts` ve güncellenen `admin-shell.spec.ts`; gerçek tarayıcıda responsive görünüm, klavye/odak, yatay tablo erişimi, kontrast/dokunma ve reduced-motion kabulü. Kullanıcı/AGENTS.md kuralıyla Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı. Bu tarayıcı kapısı dışında görev kapsamında kalan uygulama engeli yoktur; TAMAMLANDI yerel kod/komut kabulünü belirtir, canlı DB veya yayın kabulü değildir.

## Durum: TAMAMLANDI
