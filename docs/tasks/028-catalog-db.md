> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 028: Ürün şeması ve RLS

## Tür
backend

## Amaç
Onaylı Supabase hedefi için katalog şeması oluştur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 001 (bootstrap); 027 (supabase-local). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: database-migrations, postgres-patterns, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `supabase/migrations/` (oluştur / düzenle)
- `tests/db/catalog.sql` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Kullanıcının proje/org onayını bekle. En fazla 6 aktif ürün kuralı yarış koşulunda da korunur. Fiyat kuruş/TRY, stok ve görünürlük; açık GRANT, REVOKE, RLS. anon yalnız yayınlanmış ürünleri görür, authenticated doğrudan yönetemez. Diğer tablolara genişleme.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] Yalnız onaylı YEREL test hedefinde `supabase db reset --local && supabase test db tests/db/catalog.sql` başarılı; üretim projesine uygulanmaz.
- [ ] SQL testleri anon/authenticated/service_role GRANT/REVOKE ve RLS erişimini, başka kullanıcı izolasyonunu ve şema kısıtlarını doğrular.

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

- 22 Ekim 2026 kullanıcı onayı ve tamamlanmış 001/027 bağımlılıkları esas alındı. Docker/Supabase CLI komutları yerine görevde açıkça onaylanan **PGlite** karşılığı kullanıldı: `createLocalSupabase()` migration'ları yeni `memory://` PostgreSQL'e uygular. Uzak Supabase'e bağlanılmadı; üretime migration uygulanmadı; gerçek katalog verisi ve seed eklenmedi. Mevcut arayüz/statik katalog değiştirilmedi.
- `supabase/migrations/20261022000001_catalog.sql` yalnız `public.products` tablosunu ve ona ait slot trigger/policy/kısıtlarını oluşturur. Mevcut ürün/sepet sözleşmesine uygun metin ID, ad, kategori, ambalaj, **integer kuruş/TRY**, integer stok, varsayılan gizli görünürlük ve oluşturulma zamanı bulunur. Boş kimlik/ad/ambalaj, bilinmeyen kategori, negatif fiyat/stok ve TRY dışı para birimi reddedilir.
- Her aktif ürün için zorunlu **1–6 aralığında benzersiz `active_slot`** vardır; trigger boş yuvayı otomatik atar, yayından kaldırma/silme yuvayı serbest bırakır. Altı ürün sınırını `COUNT(*)` kontrolü değil, NOT NULL eşdeğerliği + CHECK + ertelenmeyen UNIQUE kısıtı korur. İki işlem aynı boş yuvayı seçerse biri `23505` alır; dolu katalog `23514` verir. PostgreSQL'in [benzersizlik denetimi](https://www.postgresql.org/docs/current/index-unique-checks.html) commit edilmemiş çakışmaları da uzlaştırdığı için sınır snapshot/yarış koşuluyla aşılamaz. Sunucu entegrasyonu gerektiğinde çakışan işlemi yeniden deneyebilir.
- PUBLIC ve roller için açık REVOKE/GRANT eklendi; anon yalnız SELECT, authenticated/service_role açık CRUD grant alır. RLS ENABLE + FORCE ve yalnız yayınlanmış ürünlere SELECT policy vardır; authenticated INSERT policy'si olmadığı için reddedilir, UPDATE/DELETE sıfır satır etkiler. Service role gizli/açık ürünlerde CRUD yapar. Trigger security invoker, sabit boş search_path ve kapalı istemci EXECUTE erişimi kullanır.
- `tests/db/catalog.sql` pgTAP bağımlılığı olmadan TAP çıktısı veren **63 SQL kontrolü** içerir; bütün fixture/yardımcılar transaction sonunda rollback edilir. İki farklı kullanıcı ve JWT'siz authenticated erişimi yalnız ortak yayınlanmış katalogla sınırlıdır; katalogda sahiplik sütunu/özel kullanıcı verisi yoktur. Gizli ürünün bilinen ID ile okunamaması, INSERT/UPDATE/DELETE/TRUNCATE/upsert engelleri, service CRUD, veri kısıtları, stok sıfırken görünürlük, altıncı/yedinci ürün, toplu INSERT/aktivasyon atomikliği ve yuva yeniden kullanımı testlendi.
- Testi mevcut `npm test` ve CI akışına bağlamak için zorunlu destek dosyası `tests/unit/catalog-db.test.ts` eklendi: SQL TAP çıktısını/sayısını ve ayrı bellek DB'sine sıfırdan migration uygulanmasını doğrular. Ek skill/bağımlılık kurulmadı; diğer tablolara genişlenmedi.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm test -- tests/unit/catalog-db.test.ts --maxWorkers=2` → **exit 1, 2 test başarısız**. SQL testi `Catalog assertion failed: catalog table exists`, sıfırlama testi `relation public.products does not exist` ile migration eksikliğini gösterdi. RED/ara commit push edilmedi.
- GREEN: aynı komut → **exit 0, 2 test başarılı**. Ek doğrudan Node koşumunda `createLocalSupabase()` ardından `db.exec(await readFile('tests/db/catalog.sql', 'utf8'))` → **PostgreSQL 18.6, 63 adet `ok`, TAP planı `1..63`**; public şemada yalnız `products` tablosu. Yeni bellek DB'sine yeniden migration uygulama da başarılı.
- Son tam koşum: `npm test -- --maxWorkers=2` → **exit 0, 45 dosya / 492 test başarılı**. `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**; build öncesi **18 görsel + 112 v3 çıktı** doğrulaması da geçti. İlk typecheck'te PGlite `exec()` çağrısındaki desteklenmeyen generic kaldırıldı; son typecheck ve build başarılıdır.
- Yerel `.env*` dosyalarını okumamak için 027'den kalan git dışı preload tüm npm kontrollerinde kullanıldı: `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"`. Build'de ayrıca yalnız `http://127.0.0.1:54321` ve `task-028-test-only-*` sahte anahtarları verildi. Env dosyası okunmadı/değiştirilmedi; sır eklenmedi.
- Kabul 1, kullanıcı tarafından onaylanan PGlite karşılığıyla; kabul 2 gerçek PostgreSQL RLS/GRANT ve kısıt davranışıyla **başarılı**. PGlite tek oturumlu olduğundan iki gerçek eşzamanlı PostgreSQL bağlantısı çalıştırılmadı; bunun yerine trigger devre dışıyken bile slot aralığı/zorunluluğu/çakışması ve immediate UNIQUE kısıtı doğrulandı. Bu, onaylı yerel hedefin sınırıdır; canlı DB kabulü değildir. Playwright, Lighthouse ve inspect çalıştırılmadı; tarayıcı doğrulaması gerekirse **Claude doğrulayacak**. Kalan görev engeli yok.

## Durum: TAMAMLANDI
