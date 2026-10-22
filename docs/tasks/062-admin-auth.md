> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 062: Admin yetki kapısı

## Tür
backend

## Amaç
Admin rolünü sunucuda doğrula.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 040 (auth-core). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Admin görsel sözleşmesi

Görsel referans: docs/referans/admin-stil.md ([stil belgesi](../referans/admin-stil.md)).

shadcn bileşenleri (ortak liste): **Sidebar, Card, Table + sıralama, Chart, Command/search, Badge**. Her biri yalnız ilgili yüzey gerektiğinde kullanılır; shadcn için MCP yok, resmi CLI ile incele/ekle ve ZEYTİN tokenları + Figtree’ye uyarla. Ayrıntılı yerleşim ve erişilebilirlik kabulü stil belgesindedir.

Bu backend yetki görevi ortak stil referansını taşır; Sidebar/Card/Chart gibi UI uygulaması 063 ve ilgili frontend task’larına aittir. Yetki kapsamı genişletilmez. **ONAY GEREKLİ** kapısı ve mevcut bağımlılıklar değişmez.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `lib/auth/admin.ts` (oluştur / düzenle)
- `app/admin/layout.tsx` (oluştur / düzenle)
- `tests/unit/admin-auth.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Üyelik admin yapmaz, kullanıcı kendine rol veremez. UI/API/actions her mutasyonda kontrol; anon ve üye 401/403. Kullanıcı onayı olmadan admin hesabı oluşturma.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/admin-auth.test.ts` başarılı; görev davranışının olumlu/olumsuz sınır durumları doğrulanır.
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

- 22 Ekim 2026 tarihli kullanıcı onayı ve `040-auth-core` dosyasındaki TAMAMLANDI kaydı doğrulandı. ECC `backend-patterns`, `api-design`, `security-review`; gerekli yönetici tablosu için ayrıca `database-migrations`, `postgres-patterns` okundu. Kurulu Next.js 16.4.2'nin authentication/layout/cookies/unauthorized/forbidden belgeleri ve resmi [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [kullanıcı](https://supabase.com/docs/guides/auth/users) belgeleri esas alındı. Backend görevi olduğundan UI/21st veya ek skill kurulumu gerekmiyor.
- `lib/auth/admin.ts` yalnız sunucuda çalışır. Her `requireAdmin()` çağrısı Auth sunucusunda `getUser()` ile kimliği yeniden doğrular; cookie, JWT role, `user_metadata` ve `app_metadata` yönetici yetkisi vermez. Anonim/geçersiz oturum 401, doğrulanmış fakat yetkisiz üye 403 alır. Onaylı ilk yönetici e-postası yalnız Auth yanıtında doğrulanmış güncel e-posta eşleşmesiyle tanınır; hesap veya yetki kaydı oluşturulmaz. Diğer yöneticiler doğrulanmış kullanıcı ID'siyle tablodan okunur; role/kimlik cache'i yoktur.
- `requireAdminMutation(request)` POST/PUT/PATCH/DELETE için tam Origin ve varsa `Sec-Fetch-Site: same-origin` kontrolünden sonra güncel yetkiyi doğrular. Route Handler'lar yazmadan önce bu kapıyı, Server Action'lar her çağrıda `requireAdmin({ readOnly: false })` kullanmalıdır; layout tek başına API/action/veri okuma güvenliği sağlamaz. Bu görevde mevcut admin API/action bulunmuyor; ürün mutasyonları 064 kapsamındadır. Ortak `authErrorResponse` ile 401/403, sağlayıcı 429 ve temiz 503 JSON davranışı testlendi.
- `app/admin/layout.tsx` dinamik/noindex sunucu kapısıdır; yetkisiz çocuk içeriğini render etmez. Next'in belgelenmiş 401/403 kesmeleri için gerekli `next.config.ts` değişikliği yalnız `experimental.authInterrupts: true` ekler. Admin sayfası/kabuk/görsel tasarım 063'te oluşturulacak; bu görev tek başına `/admin` sayfası eklemez.
- Görevdeki “ek yöneticiler tablodan” şartı için zorunlu destek migration'ı `20261022000002_admin_users.sql` eklendi: `auth.users` FK + silmede cascade, tekil kullanıcı ID'si, RLS + FORCE RLS, PUBLIC/anon/authenticated/service_role için açık REVOKE ve yalnız service_role SELECT/INSERT/UPDATE/DELETE GRANT. İstemci politikası, seed veya rol atama ucu yoktur. FK testi için PGlite helper'ına yalnız test amaçlı `auth.users(id)` taklidi eklendi. Bellek içindeki migration/GRANT/CRUD/kendine rol verme/FK/cascade testleri geçti; mevcut katalog testleri de geçti.
- Yetki sorgusu yalnız gerekli alanı/tek kullanıcıyı okur; `lib/supabase/server.ts` fabrikasına seçime bağlı `noStore` desteği eklendi. Bu sorgu `cache: no-store`, 5 saniyelik abort ve `retry(false)` kullanır; eksik yapılandırma/tablo, bozuk yanıt ve ağ hatası ayrıntısız 503 ile erişimi kapatır. Mevcut katalog istemcisinin varsayılan davranışı korunur.
- `.env*` dosyaları okunmadı/yazılmadı. Kontrollerde mevcut git dışı `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` preload'u Vite/Next otomatik dotenv yüklemesini engelledi. Build yalnız loopback Supabase URL ve sahte public/service değerleriyle alındı. Canlı Supabase bağlantısı, uzak migration, gerçek yönetici hesabı/e-posta veya rol ataması yapılmadı; uzak kurulum 077 kapsamındadır.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm run test -- tests/unit/admin-auth.test.ts --maxWorkers=2` → exit 1, henüz bulunmayan admin layout import'u. İlk uygulamada ağ hatası testi SDK retry süresi nedeniyle kırmızıydı; yetki okumasında retry kapatılınca geçti. RED/ara commit veya push yapılmadı.
- GREEN: aynı görev komutu → **exit 0, 54 test başarılı**. Gerçek Supabase SSR/PostgREST SDK'leri çalıştı; yalnız fetch, Next cookie ve render kesme yüzeyleri taklit edildi. Olumlu/olumsuz bootstrap, onaysız e-posta, metadata/cookie sahteciliği, ayrı kullanıcı, yetki iptali/çıkış, API/action yazma engeli, CSRF, 429/503 ve bellek içi PostgreSQL sınırları doğrulandı.
- Göreve özel coverage: `npm run test -- tests/unit/admin-auth.test.ts --maxWorkers=2 --coverage --coverage.include=lib/auth/admin.ts --coverage.include=app/admin/layout.tsx` → **exit 0**; statements **49/50 (%98)**, branches **52/53 (%98,11)**, functions **7/7 (%100)**, lines **43/43 (%100)**. Global coverage iddiası değildir.
- `npm test -- --maxWorkers=2` → **exit 0, 54 dosyada 850 test başarılı**. İlk tam koşuda mevcut `account-ui.test.tsx` çıkış hatası testinin odak beklentisi zamanlamadan dolayı bir kez başarısızdı; ilgili kod/test değiştirilmeden tam tekrar yeşil geçti. İlk typecheck'te yeni testin HeadersInit tip hatası düzeltildi.
- `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti. Her iki task kabul kriteri komutla karşılandı. Public JS chunk'larında sahte service anahtarı ve `SUPABASE_SERVICE_ROLE_KEY` referansı bulunmadığı, admin modülünün `server-only` olduğu Node assertion ile doğrulandı. `git diff --check` başarılı.
- Playwright e2e, Lighthouse, inspect, ekran görüntüsü veya tarayıcı çalıştırılmadı; tarayıcı kabulünü **Claude doğrulayacak**. Task kapsamında kalan uygulama engeli yok. Yerel test/build ve Git push, canlı DB kurulumu veya canlı admin kabulü anlamına gelmez.

## Durum: TAMAMLANDI
