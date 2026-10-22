> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) — auth güvenlik düzeltmesi, 1. aşama onayının parçası

# Task 135: Güvenlik — yönetici devralma riski, sabit site origin'i, katalogda anon okuma

## Tür
backend

## Amaç
Claude'un bağımsız güvenlik incelemesi (027–064, `b0f80a5^..914e544`) canlı kurulum (077) öncesi şunları buldu:
- **CRITICAL (ayara bağlı):** Yönetici kararı `lib/auth/admin.ts:37-42`'de yalnız `email_confirmed_at` + e-posta eşitliğine (`admin@afina.com.tr`) dayanıyor. Supabase projesinde "Confirm email" kapalıysa herkes bu adresle kayıt olup anında yönetici olur. `supabase/config.toml`'da `enable_confirmations` yok (yerel varsayılan kapalı, testler yakalamıyor).
- **HIGH:** Ön-kayıt (pre-hijack). Saldırgan, gerçek sahipten önce `admin@afina.com.tr` ile kendi şifresiyle kayıt olur. Sahip sonra magic link ile girip e-postayı onaylar, saldırganın şifresi hesapta kalır ve saldırgan şifreyle yönetici olur.
- **HIGH (canlıda kırılma):** Origin/CSRF kontrolü `new URL(request.url).origin` ile yapılıyor (`lib/auth/server.ts:109`, `lib/auth/admin.ts:71`). `register/route.ts:68` `emailRedirectTo`'yu da `request.url`'den üretiyor.
- **MEDIUM:** Herkese açık katalog okuması service role kullanıyor (`lib/catalog/read.ts:10`). RLS devre dışı kalıyor, en az yetki ilkesine aykırı.
- **MEDIUM:** Bootstrap e-postası tablo kontrolünden önce döndüğü için `admin_users` satırı silinerek yetki iptal edilemiyor.

## Kullanılacak araçlar
- `security-review`, `tdd-workflow`, `backend-patterns`.

## İstenen
1. **Yönetici = yalnız `admin_users` satırı.** `lib/auth/admin.ts`'deki sabit e-posta kısayolu (`bootstrapEmail`) **kaldırılır**. Bir kullanıcı ancak `admin_users` tablosunda `user_id = auth.uid()` olan etkin bir satırı varsa **ve** `email_confirmed_at` doluysa yöneticidir. Kontrol sunucuda, `getUser()` ile. Satır silinince yetki anında gider.
2. **İlk yöneticiyi atama (bootstrap):** kod içinde değil, işletim adımıyla. `docs/yayin/admin-bootstrap.md` yaz:
   - Sahip `admin@afina.com.tr` ile kayıt olur ve e-postasını onaylar.
   - Supabase SQL ile (Claude 077'de çalıştırır) `insert into public.admin_users(user_id, …) select id, … from auth.users where email = 'admin@afina.com.tr' and email_confirmed_at is not null;`. Kullanıcı yoksa ya da onaysızsa hiçbir şey eklenmez.
   - Kullanıcı zaten varsa (ön-kayıt şüphesi) önce şifre sıfırlama ve tüm oturumların kapatılması adımı.
   - Bu SQL'i `supabase/snippets/admin-bootstrap.sql` olarak ekle (migration değil).
3. **`supabase/config.toml`:** `[auth.email] enable_confirmations = true`, `double_confirm_changes = true`, `secure_password_change = true`. `[auth] site_url = "https://afinazeytin.com"`, `additional_redirect_urls = ["https://afinazeytin.com/**", "http://localhost:3004/**"]`. Bunlar yerel ortam içindir; canlı projede aynısı Claude tarafından ayarlanır. `docs/yayin/supabase-auth-ayarlari.md`'ye kontrol listesi yaz: Confirm email açık, Site URL, Redirect URL allowlist, Auth rate limit, (isteğe bağlı) CAPTCHA, minimum şifre uzunluğu ≥ 10.
4. **Sabit origin:** yeni env `SITE_ORIGIN` (canlıda `https://afinazeytin.com`; Claude Vercel'e ekler). Origin/Sec-Fetch-Site kontrolü ve `emailRedirectTo` bu değerden üretilir. `SITE_ORIGIN` yoksa production'da istek **reddedilir** (fail closed), development'ta `request.url` origin'ine düşer. `getAuthConfig` bunu doğrular.
5. **Katalog okuma anon istemciyle:** `lib/catalog/read.ts` publishable/anon anahtarlı sunucu istemcisi kullanır. `products_published_read` politikası yeterli olmalı (PGlite testinde anon rolüyle doğrula). Service role yalnız admin işlemlerinde kalır.
6. Yeni PGlite testleri: (a) onaysız kullanıcı `admin_users`'ta olsa bile yönetici değil; (b) onaylı ama tabloda olmayan `admin@afina.com.tr` yönetici değil; (c) satır silinince yetki gider; (d) anon katalog okuması yalnız yayınlanmış ürünleri döndürür.

## Kabul kriterleri
- [ ] `rg "admin@afina.com.tr" lib app` kodda eşleşme vermez (yalnız docs/snippets).
- [ ] Unit/PGlite: yukarıdaki 4 senaryo + origin: `SITE_ORIGIN` ile eşleşmeyen Origin 403, production'da `SITE_ORIGIN` yoksa 503.
- [ ] `lib/catalog/read.ts` service role import etmez.
- [ ] `npm test`, lint, typecheck, build yeşil.
- [ ] Canlı migration/Supabase ayarı yapılmaz (077'de Claude yapar).

## Yapılmaması gerekenler
- `.env*` okuma/yazma; gizli anahtarı koda gömme.
- Canlı Supabase'e bağlanma.
- `docs/` dışında belge; `docs/tasks` içinde yalnız Coder Notu/Durum (docs/yayin ve snippets bu görevin çıktısıdır, yazılabilir).

## Coder Notu

- `security-review`, `tdd-workflow`, `backend-patterns` kullanıldı; ek skill kurulmadı. ECC kuralları gereği bağımsız, salt okunur güvenlik/kod incelemesi de yapıldı; somut bulgu yok.
- Yönetici e-posta kısayolu kaldırıldı. Her korumalı çağrı `getUser()` sonucunu, e-posta onayını ve güncel `admin_users` satırını kontrol eder. Mevcut şemada etkinlik kolonu yoktur; satırın varlığı etkin atamadır, silinmesi sonraki çağrıda yetkiyi kaldırır. Yeni migration gerekmedi.
- `getAuthConfig` sunucuda `SITE_ORIGIN` doğrular; production'da eksik/geçersiz değer 503, uyuşmayan Origin veya uygun olmayan Sec-Fetch-Site 403 döner. Auth/admin ortak kontrol kullanır. Kayıt ve magic-link `emailRedirectTo` ile PKCE sonrası yönlendirme sabit origin'den üretilir. Tarayıcı auth ve anonim katalog istemcisi public yapılandırma kullanır, sunucu env'ine bağımlı değildir.
- Katalog stateless publishable/anon istemciye geçirildi; no-store, süre sınırı, altı ürün limiti ve mevcut fallback korundu. PGlite'da `anon` rolüyle WHERE filtresi olmadan yalnız yayınlanmış ürünlerin okunabildiği doğrulandı.
- `docs/yayin/admin-bootstrap.md`, `docs/yayin/supabase-auth-ayarlari.md` ve migration olmayan `supabase/snippets/admin-bootstrap.sql` eklendi. SQL yalnız onaylı mevcut hesabı atar, tekrar çalıştırmada çoğaltmaz. Ön-kayıt prosedürü şifre sıfırlama, global çıkış ve eski access-token sürelerinin dolmasını kapsar. Yerel Auth TOML ayarları güncellendi.

### TDD ve kabul kanıtı

| Kabul / davranış | Gerçekten çalıştırılan komut / sonuç |
| --- | --- |
| RED — admin bypass, origin ve anon okuma | `npm test -- tests/unit/admin-auth.test.ts tests/unit/auth-core.test.ts tests/unit/register.test.ts tests/unit/catalog-api.test.ts tests/unit/security-admin-origin.test.ts --maxWorkers=2`: düzeltme öncesi **37 FAIL / 245 PASS**. İlk atama snippet'i de henüz yoktu. |
| RED — magic-link ve callback proxy yönlendirmesi | `npm test -- tests/unit/auth-core.test.ts tests/unit/login.test.ts --maxWorkers=2`: düzeltme öncesi **2 FAIL / 150 PASS**; internal host'a yönlendirme yakalandı. |
| GREEN — ilgili testler ve kapsam | `npm test -- tests/unit/admin-auth.test.ts tests/unit/auth-core.test.ts tests/unit/register.test.ts tests/unit/catalog-api.test.ts tests/unit/security-admin-origin.test.ts tests/unit/login.test.ts --maxWorkers=2 --coverage --coverage.include=lib/auth/admin.ts --coverage.include=lib/auth/server.ts --coverage.include=lib/auth/config.ts --coverage.include=lib/auth/client.ts --coverage.include=lib/catalog/read.ts --coverage.include=lib/supabase/public.ts --coverage.include=app/api/auth/login/route.ts --coverage.include=app/api/auth/register/route.ts --coverage.include=app/auth/callback/route.ts`: **339 PASS**; statements **%98,43**, branches **%96,97**, functions **%98,07**, lines **%100**. |
| Tüm unit/PGlite testleri | `npm test -- --maxWorkers=2`: **59 dosya / 956 test PASS**. İlk genel koşuda mevcut admin ürün CSRF testinin yeni public config fixture'ı eksikti; fixture güncellendikten sonra tamamı geçti. |
| Lint | `npm run lint`: **PASS**, uyarı yok. |
| Typecheck | `npm run typecheck`: **PASS**. |
| Build | `npm run build`: **PASS**; prebuild varlık kontrolleri de PASS (18 görsel / 112 v3 çıktı). |
| Sabit yönetici e-postası yok | `rg 'admin@afina.com.tr' lib app`: eşleşme yok, exit **1** (beklenen). |
| Katalogda service role yok | `rg -e createSupabaseServiceClient -e SUPABASE_SERVICE_ROLE_KEY -e supabase/server lib/catalog/read.ts`: eşleşme yok, exit **1** (beklenen); public istemci kullanılıyor. |
| Yerel Auth ayarları | Python `tomllib` ile config parse ve assert: site URL, iki redirect allowlist girdisi, minimum şifre ≥10 ve üç email güvenlik bayrağı **PASS**. |
| Migration sınırı ve diff | `git diff --exit-code -- supabase/migrations`, `git diff --check`: **PASS**. |

- İlk kapsam koşusundaki geniş `lib/auth/**` seçimi bu task'ta değişmeyen demo/adapter dosyalarını da içerdi ve functions eşiğini geçemedi. Yukarıdaki kapsam komutu yalnız değişen dosyaları ölçer; global coverage kabulü iddia edilmez.
- `.env*` dosyaları doğrudan okunmadı/yazılmadı. Canlı Supabase bağlantısı, migration, bootstrap SQL veya uzak Auth ayarı uygulanmadı; bu işletim adımları 077'de Claude'a aittir. Vercel'e `SITE_ORIGIN` ekleme de Claude'un 077 adımıdır.
- Playwright/e2e, Lighthouse, inspect, ekran görüntüsü ve tarayıcı çalıştırılmadı. Tarayıcı ve canlı kabulü **Claude doğrulayacak**.
- RED/ara commit uzak dala gönderilmedi; TDD kanıtı bu notta korundu. Görev sonunda yalnız yeşil sonuçla son commit push edilir.

## Durum: TAMAMLANDI
