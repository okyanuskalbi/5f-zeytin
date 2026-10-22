> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 040: Supabase üyelik altyapısı

## Tür
backend

## Amaç
Kullanıcı onayıyla Supabase Auth oturum altyapısını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 028 (catalog-db). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `lib/auth/server.ts` (oluştur / düzenle)
- `lib/auth/client.ts` (oluştur / düzenle)
- `app/auth/callback/route.ts` (oluştur / düzenle)
- `tests/unit/auth-core.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. SSR oturum doğrulama, güvenli cookie, callback allowlist, CSRF/rate limit ve logout. Admin yetkisi üyelikten türemez; servis anahtarı istemciye gitmez.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/auth-core.test.ts` başarılı; görev davranışının olumlu/olumsuz sınır durumları doğrulanır.
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

- 22 Ekim 2026 kullanıcı onayı ve tamamlanmış 028 bağımlılığı esas alındı. ECC `backend-patterns`, `api-design`, `security-review` ile kurulu Next.js 16.4.2'nin cookies, Route Handlers, authentication ve proxy belgeleri okundu. 21st/UI veya ek skill gerekmiyor. Canlı Supabase'e bağlanılmadı; migration uygulanmadı, gerçek kullanıcı/e-posta oluşturulmadı. `.env*` dosyaları okunmadı/yazılmadı; mevcut v4 arayüzü ve demo adapterları korunuyor.
- Cookie/PKCE yönetimi için resmi `@supabase/ssr` **0.12.7** eklendi ve lockfile'a sabitlendi; mevcut `@supabase/supabase-js` 2.118.0 ile peer uyumu npm registry üzerinden doğrulandı. İstemci yalnız `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanır; public alana yanlışlıkla verilen secret/service-role key ve güvensiz URL reddedilir. Sunucu auth modülü `server-only`; ayrıcalıklı katalog istemcisi üyelik için kullanılmaz.
- `createAuthServerClient()` her istekte yeni istemci oluşturur. `getVerifiedUser()` her okumada Auth sunucusunun `getUser()` doğrulamasını kullanır; cookie'deki kullanıcı/rol verisini yetki saymaz, yalnız doğrulanmış `id/email` döndürür. Boş/iptal/geçersiz oturum anonim, bozuk sağlayıcı yanıtı ve hizmet hatası temiz 503 olur. Admin yetkisi verilmez; ayrı kapı 062 kapsamındadır.
- `/auth/callback` yalnız PKCE kodunu, işlemi başlatan tarayıcının verifier cookie'siyle değiştirir; SDK'nin `sb_flow_id` kullanan ayrı akışları da desteklenir. Eksik/tekrarlı/geçersiz parametre, eksik veya başka akışın verifier'ı ve tüketilmiş kod reddedilir. Dönüş allowlist'i yalnız `/hesabim`, `/sepet`, `/odeme`; diğer girdiler `/hesabim` olur. Forwarded host kullanılmaz; kod/token yanıtta veya yönlendirmede taşınmaz.
- Auth cookie'leri host-only, `Path=/`, `SameSite=Lax`, production'da `Secure` kullanır. **HttpOnly=false**, resmi [Supabase SSR açıklamasına](https://supabase.com/docs/guides/auth/server-side/advanced-guide) göre tarayıcı istemcisinin aynı cookie ile oturum yenileyebilmesi içindir; localStorage'a token yazan bir uygulama katmanı eklenmedi. CSRF için mutasyonlarda POST + tam Origin eşleşmesi + varsa `Sec-Fetch-Site: same-origin` zorunludur; callback GET'i browser-bound PKCE ile korunur. UI bağlantısını 041/042 yapacak.
- Görevdeki SSR yenileme ve logout davranışını tamamlamak için zorunlu destek dosyaları eklendi: ortak public ayarlar `lib/auth/config.ts`, yalnız POST sunan `/auth/logout` route'u ve `proxy.ts`. Proxy yalnız `/hesabim/*`, `/admin/*`, `/sepet`, `/odeme` kapsamındadır; mevcut landing'e girmez. Dönen cookie'yi hem Server Component isteğine hem tarayıcı yanıtına aktarır; kendisi yetki kapısı değildir. Server Component okumaları read-only; Route Handler/Action çağrıları yazılabilir istemci kullanır. Logout mevcut oturumu `scope: local` ile kapatır; diğer cihazların oturumlarını sonlandırmaz, iptal edilmiş oturumu da yerelde temizler.
- Rate limit, zaten seçilmiş [Supabase Auth'un ortak sağlayıcı limitleriyle](https://supabase.com/docs/guides/auth/rate-limits) uygulanır: PKCE/refresh `/token`, doğrulama ve logout öncesi `/user`. Vercel örneklerinde sıfırlanacak process-local sayaç veya kullanıcı yerine yeni Redis/servis kararı eklenmedi. 429 korunur ve `Retry-After: 60` varsayılan yeniden deneme bilgisi döner. Gerçek proje kotası okunmadı/değiştirilmedi; bu görev sağlayıcı limitinin sahte 429 yanıtıyla entegrasyonunu doğrular. Her upstream fetch için 5 saniyelik abort sinyali ve `no-store` var; SDK refresh retry davranışı korunuyor. Ham upstream hata/ağ ayrıntıları SDK'ye ulaşmadan temizlenir. Auth yanıtları ve proxy `private, no-store`, `Pragma`, `Expires`, `no-referrer` başlıklarını kullanır; cookie'li yanıtlar ortak cache'e açılmaz.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm run test -- tests/unit/auth-core.test.ts --maxWorkers=2` → **exit 1**, henüz bulunmayan callback route import'u. Ek olumsuz testler bozuk sağlayıcı kimliği ve iptal edilmiş refresh token logout durumlarını önce kırmızı gösterdi; uygulama düzeltildi. RED/ara commit oluşturulmadı veya push edilmedi.
- GREEN: aynı görev komutu → **exit 0, 84 test başarılı**. SSR gerçek SDK cookie/PKCE/refresh/logout işlemleriyle çalıştı; yalnız fetch ve Next cookie yüzeyi taklit edildi. Browser factory testinde SDK factory spy kullanıldı; tarayıcı açılmadı. Olumlu/olumsuz akışlar, legacy anon key, servis anahtarı reddi, session izolasyonu, sahte admin metadata, network/timeout, allowlist, per-flow verifier, kod tekrarı, CSRF, iptal/tekrarlı logout, 429/503 ve temiz hata/log davranışı doğrulandı.
- Göreve özel coverage komutu: `npm run test -- tests/unit/auth-core.test.ts --maxWorkers=2 --coverage --coverage.include=lib/auth/server.ts --coverage.include=lib/auth/client.ts --coverage.include=lib/auth/config.ts --coverage.include=app/auth/callback/route.ts --coverage.include=app/auth/logout/route.ts --coverage.include=proxy.ts` → **exit 0**. V8'in raporladığı görev kapsamı: statements **115/117 (%98,29)**, branches **106/110 (%96,36)**, functions **24/25 (%96)**, lines **96/96 (%100)**. Bu global coverage veya tarayıcı kabulü değildir.
- `npm test -- --maxWorkers=2` → **exit 0, 47 dosyada 628 test başarılı**. `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti; callback/logout dinamik route'ları ve proxy başarıyla derlendi. Her iki task kabul kriteri komutla karşılandı.
- Tüm npm kontrollerinde 027'den kalan git dışı preload `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` ile Vite/Next otomatik dotenv yüklemesi engellendi. Build yalnız loopback URL, `sb_publishable_task040_build_fixture` ve `task040-service-must-never-be-used` sahte değerleriyle alındı. Ek Node assertion koşumunda Vite `build({write:false, envDir:false})` ile gerçek auth browser entry'si bundle edildi: public fixture mevcut, **0 servis anahtarı/değişken referansı**. Next public build'deki **27 dosya** aynı sınırı geçti; sunucu dosyasındaki `server-only` işareti ve paketin istemci koşulundaki import engeli doğrulandı. Gerçek sır okunmadı/loglanmadı/commit edilmedi.
- `git diff --check` başarılı. Kod/güvenlik incelemesi tamamlandı; kalan görev engeli yok. Playwright e2e, Lighthouse, inspect, ekran görüntüsü veya tarayıcı çalıştırılmadı; tarayıcı kabulünü **Claude doğrulayacak**. Yerel test/build ve push, canlı Supabase/üyelik/e-posta kabulü anlamına gelmez; uzak hedef kurulumu 077'de ayrıca yapılacak.

## Durum: TAMAMLANDI
