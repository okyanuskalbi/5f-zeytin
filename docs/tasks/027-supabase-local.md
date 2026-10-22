> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 027: Yerel Supabase doğrulama ortamı

## Tür
backend

## Amaç
Onaylanan yerel DB test ortamı ve sunucu istemcisi sınırını hazırla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 001 (bootstrap). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: database-migrations, postgres-patterns, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `supabase/config.toml` (oluştur / düzenle)
- `lib/supabase/server.ts` (oluştur / düzenle)
- `tests/unit/supabase-local.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Kullanıcı DB hedefi/onayı olmadan başlama; Docker ve resmi Supabase CLI kullanılabilirliğini doğrula, supabase init ve yalnız yerel supabase start ile test ortamını kur. Kimlik bilgilerini dosya/log/commit içine yazma. Sunucu istemcisini server-only ve env doğrulamalı kur; uzak Supabase projesi oluşturma/bağlama bu yerel görevde yapılmaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `supabase start >/dev/null && supabase db reset --local` yerel hedefte başarılı; supabase/config.toml mevcut.
- [ ] `npm run test -- tests/unit/supabase-local.test.ts && npm run typecheck` başarılı; servis anahtarı client bundle veya kayıtlarda yok.

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

- 22 Ekim 2026 kullanıcı onayı uygulandı. `command -v docker` / `command -v supabase` ile iki CLI'nin de bulunmadığı doğrulandı. Yukarıdaki açık onay uyarınca `supabase init/start/db reset` yerine bellek içi **PGlite** ile yerel migration uygulama ve sıfırlama doğrulandı; bu onaylı değişiklik engel değildir. Docker ortamı veya uzak Supabase bağlantısı kurulmadı; canlı migration uygulanmadı.
- `supabase/config.toml` yalnız yerel proje ve 3004 uygulama adresini tanımlar; seed kapalıdır. Gerçek uzak PostgreSQL major sürümü Task 077'de doğrulanacaktır. PGlite bu koşumda **PostgreSQL 18.6** kullanır; Supabase Auth/PostgREST servislerini çalıştırmaz. Yerel TOML sözdizimi `python3` / `tomllib` ile doğrulandı.
- `tests/helpers/supabase-local.ts`: her çağrıda yeni `memory://` PostgreSQL, `anon` / `authenticated` / `service_role` rolleri, `auth.uid()` taklidi ve `supabase/migrations/` altındaki `YYYYMMDDHHMMSS_name.sql` dosyalarını sıralı ve transaction içinde uygulayan yardımcı eklendi. `supabase/migrations/.gitkeep` hazırdır; gerçek ürün tablosu/migration'ı bu görevde oluşturulmadı (028 kapsamı). Test tabloları yalnız geçici fixture dosyalarında oluşturulur ve koşum sonunda temizlenir.
- `lib/supabase/server.ts`: yalnız ayrıcalıklı sunucu işlemleri için `createSupabaseServiceClient()` eklendi. `server-only` sınırı, çağrı anında URL/servis anahtarı doğrulaması, HTTPS (loopback'te HTTP), ham değer içermeyen hata mesajları ve kapalı session persistence/refresh/URL detection kullanır. Üyelik oturumu istemcisi değildir; publishable env adı üyelik görevlerine bırakıldı. Mevcut frontend/statik katalog bağlantıları değiştirilmedi.
- Zorunlu destek bağımlılıkları resmi npm kayıtlarından sürüm/Node uyumu doğrulanarak sabitlendi: `@supabase/supabase-js@2.118.0`, devDependency `@electric-sql/pglite@0.5.11`; package/lockfile güncellendi. Ek skill kurulmadı; 21st/UI veya tarayıcı aracı kullanılmadı. Sunucu ayarları [resmi Supabase belgesine](https://supabase.com/kb/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa), bellek DB yaşam döngüsü [PGlite API'sine](https://pglite.dev/docs/api) göre uygulandı.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm run test -- tests/unit/supabase-local.test.ts` → **exit 1**, henüz bulunmayan `tests/helpers/supabase-local` import'u. RED/ara commit oluşturulmadı veya push edilmedi.
- İlk unit koşumlarında Vite'ın otomatik dotenv yükleme davranışını kullandığı saptandı; içerik elle incelenmedi veya çıktılanmadı. Son GREEN koşumlarında yerel env dosyalarını yüklememek için git dışı `.cache/task-027/no-dotenv.cjs` preload'u `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` ile kullanıldı: Next env yüklemesi kapatıldı, Vite'ın dotenv okumaları dosyayı açmadan boş içerik aldı. Env dosyaları düzenlenmedi. Build'de yalnız sahte yerel URL ve test anahtarı işaretleri kullanıldı.
- `npm run test -- tests/unit/supabase-local.test.ts && npm run typecheck` → **exit 0, 24 test başarılı**. Migration sırası/sıfırlama, gerçek PostgreSQL üzerinde GRANT/REVOKE, anonim ve kimliksiz erişim, iki kullanıcı izolasyonu, kendi satırında CRUD, sahiplik değişikliğinin reddi ve service_role RLS bypass doğrulandı. Gerçek ağ çağrısı olmadan env hataları, sunucu isteğinin anahtar başlıkları ve ayrı Node sürecinde gerçek `server-only` import engeli doğrulandı.
- `npm test -- --maxWorkers=2` → son koşum **exit 0, 44 dosyada 490 test başarılı**. İlk tam koşumda mevcut bootstrap testinin Playwright yapılandırmasını import etmesi 5 saniyelik zaman aşımına uğradı; kod/test eşiği değiştirilmeden tekrar koşum tamamen geçti. Tarayıcı başlatılmadı.
- `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi varlık kontrolleri de geçti: **18 kayıt + 112 v3 çıktı**.
- Build'de sahte servis anahtarı işareti kullanıldı; Node assertion'larıyla **220** `.next/static` ve statik HTML/RSC/payload dosyası tarandı: **0 servis anahtarı işareti, 0 `SUPABASE_SERVICE_ROLE_KEY` referansı**. Build gerçek kimlik bilgilerini yüklemedi; gerçek değerler log/commit'e yazılmadı. `npm audit --omit=dev --json` → **0 güvenlik açığı**. `git diff --check` başarılı.
- Onaylı PGlite karşılığıyla her iki kabul kriteri tamamlandı; kalan engel yok. Playwright e2e, Lighthouse ve inspect çalıştırılmadı; tarayıcı kabulü gerekirse **Claude doğrulayacak**. Bu sonuç canlı Supabase veya yayın kabulü değildir.

## Durum: TAMAMLANDI
