> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 042: Giriş akışı

## Tür
fullstack

## Amaç
Giriş ve oturum kapatmayı kullanıcıya sun.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 040 (auth-core); 002 (tokens). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, api-design, security-review
- 21st MCP: evet — giriş formu
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/giris/page.tsx` (oluştur / düzenle)
- `app/api/auth/login/route.ts` (oluştur / düzenle)
- `tests/e2e/login.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Geçersiz kimlik, rate limit, güvenli dönüş URL’i ve logout; parola loglama. Ayrı üye verilerine erişim yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/login.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
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

- 22 Ekim 2026 kullanıcı onayı ile tamamlanmış 040 ve 002 bağımlılıkları esas alındı. ECC `frontend-patterns`, `api-design`, `security-review`, `tdd-workflow` ve kurulu Next.js 16.4.2 Route Handler, page/searchParams, cookies ve authentication belgeleri okundu. Canlı Supabase bağlantısı, migration, gerçek kullanıcı veya e-posta işlemi yapılmadı; `.env*` dosyaları okunmadı/yazılmadı. Yeni bağımlılık veya ek skill kurulmadı.
- `/giris` production'da gerçek giriş formunu sunar; `POST /api/auth/login` e-posta/şifre ve magic link yöntemlerini destekler. Zorunlu destek dosyaları `components/account/SignIn.tsx`, `lib/contracts/login.ts`, iki unit test dosyası ve logout kabulü için yalnız testte kullanılan iki fixture'dır. Mevcut 040 logout/callback servisleri kullanıldı. `/giris`, SSR yenileme cookie'lerinin Server Component okumadan önce saklanması için mevcut proxy matcher'ına eklendi; matcher testi güncellendi. Hesabım/profil/sipariş uygulaması 043 kapsamında kalır; giriş ekranı doğrulanmış oturuma devam etme ve çıkış yapma imkânı sunar, üye verisi döndürmez.
- 21st MCP aramalarından sonuç alınamadı; mevcut referansın kimliğiyle `get_component(39096)` başarılı oldu: [diarmuradi/sign-in-3](https://21st.dev/@diarmuradi/sign-in-3). Bölünmüş kompozisyon, şifre görünürlüğü, onaylı zeytinlik ve mevcut marka tokenlarına uyarlanmış Button/Input/FormControls korundu. Yeni shadcn bileşeni veya animasyon eklenmedi. Google OAuth onay kaydına göre kapalı; üyelik `/kayit` bağlantısıyla mevcut 041 formuna gider. Klavye erişimi, hata/alan ilişkileri, ilk hatalı alana veya durum mesajına odak, canlı bildirim, çift gönderim kilidi ve reduced-motion stilleri korunur.
- Sunucu JSON'u bağımsız doğrular; e-posta normalize edilir, şifre aynen korunur ve mevcut üyeye kayıt şifre karmaşıklığı uygulanmaz. Bilinmeyen alanlar/türler reddedilir. POST + tam Origin eşleşmesi ve varsa `Sec-Fetch-Site: same-origin` zorunludur. JSON akış halinde 8192 baytla sınırlıdır: bozuk JSON/alanlar 400, yanlış media type 415, büyük gövde 413. Sağlayıcının ortak limitleri 429 + `Retry-After: 60`; hizmet/ağ/yapılandırma hataları temiz 503 + `Retry-After: 5` döner. Process-local sayaç veya yeni servis kararı eklenmedi. Şifre/ham sağlayıcı hatası loglanmaz; tüm auth yanıtları `private, no-store` ve `no-referrer` kullanır.
- Şifreli girişte geçersiz/olmayan/teyitsiz/engellenmiş hesap aynı 401 mesajını alır. Yalnız başarılı, geçerli sağlayıcı yanıtından sonra SDK session cookie'leri yayınlanır; token, e-posta, kimlik ve metadata JSON'a konmaz. Eski session giriş isteği sırasında okunmaz/yenilenmez; hatalı giriş mevcut session'ı değiştirmez. Dönüş URL'i hem sunucuda hem istemcide yalnız `/hesabim`, `/sepet`, `/odeme`; diğer girdiler `/hesabim` olur. Forwarded host kullanılmaz.
- [Supabase şifreli giriş](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) ve [magic link/PKCE](https://supabase.com/docs/reference/javascript/auth-signinwithotp) resmi belgeleri ile kurulu SDK kaynakları incelendi. Magic link `shouldCreateUser: false` kullanır; yeni hesap oluşturmaz. Kabul/hesaba özgü retler aynı 202 `link_requested` mesajını ve aynı PKCE verifier cookie biçimini döndürür. Var olan session'a dokunmaz; tarayıcıya bağlı verifier mevcut callback'te kullanılır. SDK'nin eski akışları tahliye etmesi korunur; 12 ardışık nötr istekte en fazla 5 indeksli akış + indeks/legacy verifier cookie'leri kaldığı testlendi. Gerçek e-posta şablonunun bağlantı içermesi, callback allowlist'i, sağlayıcı kotası ve e-posta teslimi 077'de ayrıca doğrulanacak.
- Çıkış yalnız POST ile mevcut `/auth/logout` üzerinden `scope: local` kullanır. Başarıdan sonra giriş ekranı açılır ve Router yenilenir; hata durumunda açık oturum kapatılmış gibi gösterilmez. Misafir sepeti temizlenmez. Sunucu doğrulaması olmadan logout paneli veya üye verisi sunulmaz. Aynı rotanın yenilenmesinde değişen doğrulanmış oturum durumu da ekrana yansır. Önceki `membership.spec.ts` demo giriş beklentileri yeni gerçek girişle uyumlu güncellendi; kalan hesap demo testleri Google mock giriş ekranına bağımlı olmadan kendi açıkça işaretli demo oturumlarını kurar. Demo auth runtime'ı ve 043 kapsamı değiştirilmedi.

### Komutla doğrulama — 22 Ekim 2026

- Bütün npm/Vite doğrulamalarında mevcut git dışı `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` preload'u otomatik dotenv okumasını engelledi. Testler gerçek Supabase SDK'sını sahte fetch/cookie yüzeyiyle çalıştırdı; canlı Auth isteği yapılmadı. Production build yalnız loopback `http://127.0.0.1:9`, `sb_publishable_task042_build_fixture`, `task042-service-must-never-be-used` sahte değerleri ve kapalı demo/ödeme önizleme bayraklarıyla alındı.
- RED: `npm test -- tests/unit/login.test.ts tests/unit/login-ui.test.tsx --maxWorkers=2` → **exit 1**, henüz bulunmayan giriş API/contract importları. İçe aktarmadan bağımsız `npm test -- tests/unit/login-ui.test.tsx --maxWorkers=2` → **exit 1; 12 başarısız, 2 başarılı**; production'da gerçek formun olmaması, API çağrılmaması, eksik magic link/logout davranışları gösterildi. Yerel RED checkpoint: `4971e79`.
- İlk GREEN: aynı iki dosya → **exit 0, 69 test başarılı**; yerel checkpoint `e3c0c5f`. Ek oturum yenileme testi önce **1 başarısız / 17 başarılı** ile sorunu gösterdi (`3ecb034`), düzeltme ve auth-core ile `npm test -- tests/unit/login.test.ts tests/unit/login-ui.test.tsx tests/unit/auth-core.test.ts --maxWorkers=2` → **exit 0, 157 test başarılı** (`5df84d2`). Checkpoint kanıtları bu notta korunarak yalnız mevcut görevin yerel commit'leri tek nihai task commit'inde birleştirildi; RED/ara commit'ler push edilmedi.
- `npm test -- tests/unit/login.test.ts tests/unit/login-ui.test.tsx --maxWorkers=2 --coverage --coverage.include=app/giris/page.tsx --coverage.include=app/api/auth/login/route.ts --coverage.include=components/account/SignIn.tsx --coverage.include=lib/contracts/login.ts` → **exit 0, 73 test başarılı**. V8'in raporladığı API/form/contract kapsamı: statements **159/161 (%98,75)**, branches **165/168 (%98,21)**, functions **23/24 (%95,83)**, lines **124/124 (%100)**. Sayfanın doğrulanmış/anonim/hizmet hatası davranışları UI testinde çalıştırıldı; bu sayılar global coverage veya tarayıcı kabulü değildir.
- `npm test -- --maxWorkers=2` → **exit 0, 51 dosyada 764 test başarılı**. `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti; `/giris`, `/api/auth/login` ve proxy derlendi. Public build'deki **31 JavaScript dosyasında 0 servis anahtarı/değişken referansı**; `git diff --check` başarılı. Logout fixture'ı Vite `build({write:false, envDir:false})` ile bellekte **3 dosya** olarak derlendi; tarayıcı veya sunucu açılmadı.

| Garanti | Kanıt | Sonuç |
|---|---|---|
| Şifreli giriş, nötr kimlik hatası, bozuk yanıt reddi, güvenli dönüş ve mevcut session izolasyonu | `tests/unit/login.test.ts` | PASS |
| Magic link yeni hesap açmaz; browser-bound PKCE mevcut callback ile tamamlanır; ret/başarı cookie biçimi nötrdür ve cookie sayısı sınırlıdır | `tests/unit/login.test.ts` | PASS |
| CSRF, alan/gövde sınırları, 429/503, ağ/yapılandırma hataları ve log temizliği; local/tekrarlı logout | `tests/unit/login.test.ts` | PASS |
| Production formu, erişilebilir doğrulama/odak, çift gönderim, güvenli hata/tekrar deneme, şifre temizleme, magic link ve doğrulanmış oturum/çıkış UI'ı | `tests/unit/login-ui.test.tsx` | PASS |
| Normal/reduced-motion klavye akışları, taşma, nötr magic link bildirimi, kimlik/rate/hizmet hatası, güvenli dönüş ve sepeti koruyan logout | `tests/e2e/login.spec.ts` | **Claude doğrulayacak** |

- `npm run test:e2e -- tests/e2e/login.spec.ts` **çalıştırılmadı** (AGENTS.md: Tarayıcı testleri Claude'da). **11 senaryo** yazıldı: gerçek yerel giriş sayfası ve gerçek SignIn bileşeninin bellekte derlenmiş logout fixture'ı; giriş/çıkış POST'ları taklit edilir, uzak hedef reddedilir. Fixture sunucu kimlik doğrulaması kanıtı değildir; o sınır SDK/unit testleriyle doğrulandı. Playwright, Lighthouse, inspect, ekran görüntüsü veya tarayıcı/server süreci çalıştırılmadı. Kalan komutla doğrulanabilir görev engeli yok; tarayıcı kabulünü **Claude doğrulayacak**. Push, canlı Supabase/e-posta veya yayın kabulü sayılmaz.

## Durum: TAMAMLANDI
