> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 041: Kayıt akışı

## Tür
fullstack

## Amaç
E-posta/şifre kayıt akışını uygula.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 040 (auth-core); 002 (tokens). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, api-design, security-review
- 21st MCP: evet — kayıt formu
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/kayit/page.tsx` (oluştur / düzenle)
- `app/api/auth/register/route.ts` (oluştur / düzenle)
- `tests/e2e/register.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Doğrulama, hata ve e-posta teyidi; pazarlama izni ayrı ve opsiyonel. Kullanıcı varlığı sızdırma; gerçek kullanıcıya test e-postası gönderme.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/register.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
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

- 22 Ekim 2026 kullanıcı onayı ile tamamlanmış 040 ve 002 bağımlılıkları esas alındı. ECC `frontend-patterns`, `api-design`, `security-review`, `tdd-workflow` ve kurulu Next.js 16.4.2 Route Handler, page ve authentication belgeleri okundu. Canlı Supabase'e bağlanılmadı, migration uygulanmadı, gerçek kullanıcı veya e-posta oluşturulmadı; `.env*` okunmadı/yazılmadı.
- `/kayit` ve `POST /api/auth/register` eklendi. Formdaki ad/e-posta/şifre doğrulaması sunucuda tekrar yapılır; bilinmeyen alanlar, geçersiz türler, zayıf şifre, eksik zorunlu onaylar reddedilir. Ad/e-posta normalize edilir; şifre değiştirilmez. Pazarlama ayrı, varsayılan kapalı ve isteğe bağlıdır. Ad, onaylar, pazarlama tercihi ve sunucu zamanı yalnız kullanıcı metadata'sına yazılır; bu alanlar admin yetkisi veya değiştirilemez ticari ileti izin kaydı sayılmaz. Kalıcı izin/geri çekme akışı 056/061 kapsamındadır.
- Görev için zorunlu destek dosyaları `components/account/Register.tsx`, `lib/contracts/register.ts`, `tests/unit/register.test.ts`, `tests/unit/register-ui.test.tsx` olarak eklendi. 040'ın `lib/auth/server.ts` temizleyicisi yalnız `user_already_exists`, `email_exists`, `weak_password` güvenli kodlarını koruyacak şekilde genişletildi; ham sağlayıcı mesajı, ayrıntısı ve diğer kodlar aktarılmaz. [Supabase signUp](https://supabase.com/docs/reference/javascript/auth-signup) ve [hata kodları](https://supabase.com/docs/guides/auth/debugging/error-codes) resmi kaynaklarından PKCE, teyit ve yinelenen kayıt davranışı doğrulandı. Yeni bağımlılık veya ek skill kurulmadı.
- 21st MCP aramalarından kullanılabilir kaynak alınamadı. Mevcut `SignIn` bileşenindeki 21st `sign-in-3`/`sign-up-2` uyarlamasının bölünmüş kompozisyonu, onaylı zeytinlik görseli ve marka tokenlarına uyarlanmış mevcut Button/Input/FormControls kullanıldı; yeni shadcn bileşeni eklemek gerekmedi. Yeni animasyon yok; içerik/CTA görünür, mevcut düğmeler reduced-motion stillerini korur. Erişilebilir label, hata ilişkisi, ilk hatalı alana odak, canlı durum/hata bildirimi, şifre görünürlüğü ve çift gönderim kilidi var.
- API yalnız aynı Origin ve varsa `Sec-Fetch-Site: same-origin` kabul eder. JSON gövdesi akış halinde en fazla 8192 bayttır; yanlış media type 415, büyük gövde 413, bozuk JSON/doğrulama 400 döner. Kayıt yalnız public Supabase anahtarıyla PKCE başlatır; callback istek origin'inden sabit `/auth/callback?next=/hesabim` olarak üretilir, istemci dönüş URL'si/forwarded host kabul edilmez. Yanıtlar `private, no-store`/`no-referrer` kullanır. Sağlayıcı rate limit'i 429 + `Retry-After: 60`, diğer hizmet/yapılandırma hataları temiz 503 + `Retry-After: 5` olur; şifre ve sağlayıcı ayrıntıları loglanmaz.
- Yeni, obfuscated ve `user_already_exists`/`email_exists` kayıtları aynı **202 + confirmation_required** mesajını ve aynı yapıda PKCE cookie'lerini döndürür; kullanıcı kimliği/e-posta/token veya kullanıcı varlığı açığa çıkarılmaz. Başarılı istekte şifre temizlenir; oturum açılmış gibi yönlendirme yapılmaz. Yalnız verifier cookie'leri yazılır; mevcut üye oturumu okunmaz/değiştirilmez. Hedefte **Confirm email açık olmalı**; sağlayıcı doğrudan session döndürürse oturum cookie'si yayınlanmadan 503 olur. Bu ayarın, callback allowlist'inin ve gerçek e-posta tesliminin uzak kabulü 077'de Claude + kullanıcı tarafından yapılacak.
- SDK'nin çoklu PKCE akış yönetimi korunur: yinelenen kayıt hata temizliği ortak yanıt şeklini bozamaz; eski akışların normal cookie silmeleri uygulanır. Art arda 12 yinelenen istekte en fazla 5 indeksli akış + indeks/legacy cookie'si kaldığı doğrulandı. Eşzamanlı sekmelerin indeks yarışları SDK'nin kendi sınırıdır; bu görev dağıtık kilit veya yeni depolama servisi eklemez.

### Komutla doğrulama — 22 Ekim 2026

- Tüm npm komutlarında mevcut, git dışı `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` preload'u ile otomatik dotenv okuması engellendi. API testleri gerçek Supabase SDK'sını sahte `fetch` ve cookie yüzeyiyle çalıştırdı; hiçbir gerçek Auth isteği gönderilmedi. Build yalnız loopback `http://127.0.0.1:9`, `sb_publishable_task041_build_fixture`, `task041-service-must-never-be-used` sahte değerleri ve kapalı demo/ödeme önizleme bayraklarıyla alındı.
- RED: `npm test -- tests/unit/register.test.ts tests/unit/register-ui.test.tsx --maxWorkers=2` → **exit 1**, henüz bulunmayan kayıt sayfası/API importları. Yerel RED checkpoint: `4c71361`. Sonraki olumsuz test cookie birikmesini **14 > 7** olarak yakaladı; cookie snapshot/eviction düzeltmesiyle yeşile döndü. İlk GREEN denemesinde yinelenen hata kodu ve alan sırasına göre odak sorunları da giderildi.
- GREEN: `npm test -- tests/unit/register.test.ts tests/unit/register-ui.test.tsx tests/unit/auth-core.test.ts --maxWorkers=2` → **exit 0, 147 test başarılı** (63 kayıt + 84 auth-core). Yerel GREEN checkpoint: `28dac9d`. Bu checkpoint'ler nihai task commit'inde birleştirildi; RED/ara commit'ler push edilmedi. TDD kanıtı bu notta korunuyor.
- `npm test -- tests/unit/register.test.ts tests/unit/register-ui.test.tsx --maxWorkers=2 --coverage --coverage.include=app/kayit/page.tsx --coverage.include=app/api/auth/register/route.ts --coverage.include=components/account/Register.tsx --coverage.include=lib/contracts/register.ts` → **exit 0, 63 test başarılı**. V8'in raporladığı route/Register kapsamı: statements **119/121 (%98,34)**, branches **120/122 (%98,36)**, functions **22/23 (%95,65)**, lines **95/95 (%100)**. Bu global coverage veya tarayıcı kabulü değildir.
- `npm test -- --maxWorkers=2` → **exit 0, 49 dosyada 691 test başarılı**. `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** doğrulaması geçti; `/kayit` ve dinamik kayıt API'si derlendi. Public build'deki **28 dosyada 0 ayrıcalıklı anahtar/değişken referansı**; `git diff --check` başarılı.

| Garanti | Kanıt | Sonuç |
|---|---|---|
| Alan/tür/sınır doğrulaması, ayrı zorunlu onaylar, opsiyonel pazarlama, role enjeksiyonu reddi | `tests/unit/register.test.ts` | PASS |
| Yeni/yinelenen kayıt için ortak yanıt; PKCE başlatma ve mevcut callback ile taklit teyit; mevcut session izolasyonu | `tests/unit/register.test.ts` | PASS |
| CSRF, gövde limiti, sağlayıcı şifre kuralları, 429/503, ağ/yapılandırma hatası ve teyitsiz session reddi | `tests/unit/register.test.ts` | PASS |
| Yerel doğrulama/odak/hata ilişkisi, çift submit kilidi, güvenli hata/tekrar deneme, şifre temizleme ve pazarlama tercihleri | `tests/unit/register-ui.test.tsx` | PASS |
| Normal/reduced-motion klavye akışı, taşma, e-posta teyidi mesajı, zorunlu/opsiyonel onaylar ve hata/tekrar deneme | `tests/e2e/register.spec.ts` | **Claude doğrulayacak** |

- `npm run test:e2e -- tests/e2e/register.spec.ts` **çalıştırılmadı** (AGENTS.md: Tarayıcı testleri Claude'da). Beş senaryo yazıldı; tüm kayıt POST'ları route interception ile taklit edilir, yerel hedef zorunludur ve doğrudan Supabase tarayıcı istekleri engellenir. Playwright, Lighthouse, inspect, ekran görüntüsü veya tarayıcı/server süreci açılmadı. Yalnız tarayıcı kabulünün devri TAMAMLANDI'yı engellemez; komutla doğrulanabilir kabulde kalan engel yok. Yerel test/build ve push, canlı Supabase kurulumu veya e-posta teslim kanıtı değildir.

## Durum: TAMAMLANDI
