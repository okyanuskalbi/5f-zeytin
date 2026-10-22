> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 029: Katalog okuma entegrasyonu

## Tür
backend

## Amaç
Yayınlanmış en fazla 6 ürünü sunucudan getir.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 028 (catalog-db). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/api/products/route.ts` (oluştur / düzenle)
- `lib/catalog/read.ts` (oluştur / düzenle)
- `lib/contracts/catalog.ts` (oluştur / düzenle)
- `tests/unit/catalog-api.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Gizli alanları döndürme; servis anahtarı yalnız server-only; doğrulanmış API sözleşmesi, boş/hata durumları ve önbellek yenileme. Gerçek fiyatı istemci belirlemez.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/catalog-api.test.ts` başarılı; görev davranışının olumlu/olumsuz sınır durumları doğrulanır.
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

- 22 Ekim 2026 kullanıcı onayı ve tamamlanan 027/028 bağımlılıkları esas alındı. Görev yalnız belirtilen dört backend/test dosyasında uygulandı; mevcut v4 arayüzü ve statik katalog değiştirilmedi. Canlı Supabase'e bağlanılmadı, migration uygulanmadı; yerel `.env*` dosyaları okunmadı/yazılmadı. Yeni bağımlılık veya ek skill kurulmadı; UI/21st gerekmedi.
- `lib/catalog/read.ts` sunucuya özel okuyucudur. 027'nin doğrulanan service client'ını kullanır; service_role RLS'yi atladığı için sorguda açık `is_active=true`, `active_slot ASC` ve `LIMIT 6` vardır. Açık sütun listesi, yalnız TRY kontrolü ve çalışma anı sözleşme doğrulaması kullanılır; dahili sütunlar/servis anahtarı yanıta aktarılmaz. İstek 5 saniyeyle sınırlandırılır; SDK'nin varsayılan tekrarları kapalıdır. [Supabase SELECT](https://supabase.com/docs/reference/javascript/select) ve [AbortSignal](https://supabase.com/docs/reference/javascript/using-modifiers-abortsignal) belgeleriyle kurulu SDK kaynakları kontrol edildi.
- `lib/contracts/catalog.ts`: mevcut `Product` tipini koruyan `{ data, source: "database" | "static" }` sözleşmesi ve allowlist ayrıştırıcısı eklendi. Kategori, boş metin, yinelenen ID, altı ürün sınırı ve PostgreSQL integer aralığında negatif olmayan kuruş/stok doğrulanır. Yanıttaki fiyat vitrin bilgisidir; ödeme fiyatı/teklifi değildir ve istemciden alınmaz.
- `GET /api/products` yalnız okuma yapar. Başarılı boş DB sonucu `[]` kalır. Yapılandırma, bağlantı, zaman aşımı veya geçersiz veri durumunda mevcut altı statik ürünün yalnız public alanları yedek olur; `source` bunu açıkça belirtir. Yedek de başarısız/geçersizse ham hata içermeyen `503 catalog_unavailable` ve `Retry-After: 5` döner. Route `force-dynamic`, bütün yanıtlar `Cache-Control: no-store`; fiyat/stok/yayın değişiklikleri ve bağlantı iyileşmesi sonraki istekte yeniden okunur. Backend görevi kapsamında mevcut frontend tüketicileri değiştirilmedi.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm run test -- tests/unit/catalog-api.test.ts --maxWorkers=2` → **exit 1**, henüz bulunmayan `app/api/products/route` import'u. Ardından uygulama yazıldı; SDK'nin otomatik yeniden deneme davranışı belirlenip tek okuma/zaman aşımı sınırı için `.retry(false)` kullanıldı. RED/ara commit oluşturulmadı veya push edilmedi.
- GREEN: aynı komut → **exit 0, 52 test başarılı**. Yayın filtresi, sorgu sütunları/sırası/limiti, servis anahtarının yalnız sunucu isteğinde bulunması, public projeksiyon, boş ve altı ürün, sıfır fiyat/stok, sözleşme sınırları, hatalı yanıt/JSON, bağlantı ve zaman aşımı, statik yedek, temiz 503 ve sonraki okumada güncel veriye dönüş doğrulandı. SDK'nin gerçek sorgu üretimi kullanıldı; yalnız `fetch` taklit edildi, ağ bağlantısı yapılmadı.
- `npm run test -- tests/unit/catalog-api.test.ts --maxWorkers=2 --coverage --coverage.include=app/api/products/route.ts --coverage.include=lib/catalog/read.ts --coverage.include=lib/contracts/catalog.ts` → **exit 0**; üç uygulama dosyasında statements **40/40**, branches **37/37**, functions **7/7**, lines **34/34**, hepsi **%100**. Bu görev kapsamının ölçümüdür; global coverage iddiası değildir.
- `npm test -- --maxWorkers=2` → **exit 0, 46 dosyada 544 test başarılı**. `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti; `/api/products` dinamik route olarak derlendi.
- Tüm npm kontrollerinde 027'den kalan git dışı preload `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` kullanılarak Vite/Next otomatik dotenv yüklemesi engellendi. Build yalnız loopback URL ve `task-029-test-only-*` sahte anahtarlarıyla çalıştı. Public build dosyaları Node assertion'larıyla tarandı: **0 servis anahtarı işareti, 0 `SUPABASE_SERVICE_ROLE_KEY` referansı**. Gerçek sır okunmadı/loglanmadı/commit edilmedi.
- `git diff --check` başarılı; salt okunur kod/güvenlik incelemesinde somut kusur bulunmadı. Her iki kabul kriteri komutla karşılandı; kalan görev engeli yok. Playwright e2e, Lighthouse, inspect veya tarayıcı çalıştırılmadı; tarayıcı kabulünü gerekirse **Claude doğrulayacak**. Bu doğrulamalar canlı DB veya canlı arayüz kabulü değildir.

## Durum: TAMAMLANDI
