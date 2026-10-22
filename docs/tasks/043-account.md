> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 043: Hesabım sayfası

## Tür
fullstack

## Amaç
Doğrulanmış üyeye hesap özetini göster.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 042 (login). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, security-review
- 21st MCP: evet — account shell
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/hesabim/page.tsx` (oluştur / düzenle)
- `components/account/AccountSummary.tsx` (oluştur / düzenle)
- `tests/e2e/account.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Anonim yönlendirme; yalnız kendi profili, çıkış ve sipariş geçmişi bağlantısı; admin bilgisi yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/account.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
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

- 22 Ekim 2026 kullanıcı onayı ve tamamlanmış 042/040 bağımlılıkları esas alındı. ECC `frontend-patterns`, `security-review`, `tdd-workflow` ve kurulu Next.js 16.4.2 authentication/redirect belgeleri okundu. Canlı Supabase'e bağlanılmadı; migration, gerçek kullanıcı veya e-posta işlemi yapılmadı. `.env*` okunmadı/yazılmadı; ek skill veya bağımlılık kurulmadı.
- `/hesabim` her ortamda sunucuda doğrulama yapar; demo bayrağı, sessionStorage ve URL'deki başka kullanıcı/rol bilgileri yetki vermez. Auth cookie'si yoksa ya da oturum geçersizse `/giris?next=/hesabim` yönlendirmesi yapılır. Dinamik sayfa ve mevcut proxy'nin `private, no-store` başlıkları korunur. Yönlendirme, Next.js'in fırlattığı hatanın yakalanmaması için hizmet hatası bloğunun dışındadır.
- Zorunlu destek dosyaları: `lib/account/read.ts`, `lib/contracts/account.ts`, `AccountSummary.module.css`, iki unit test dosyası ve test fixture/helper dosyaları. İstek başına public-key/read-only Supabase istemcisi yalnız Auth `/user` yanıtını kullanır; hedef kullanıcı kimliği parametresi veya service-role sorgusu yoktur. Cookie içindeki profil güvenilir sayılmaz. İstemciye yalnız ad/e-posta/telefon DTO'su aktarılır; admin metadata, kimlik, token ve izinler aktarılmaz. 041'in Auth metadata'sındaki ad ve varsa telefon yalnız sınırlı uzunlukta düz metin olarak gösterilir; eksik değerler `Belirtilmedi` olur. Profil düzenleme veya yeni tablo eklenmedi.
- Hesap özeti, çıkış ve `/hesabim/siparisler` bağlantısı eklendi. Sipariş listesinin kendisi plana göre 072 görevidir; bu görev yalnız bağlantısını hazırlar. Çıkış mevcut POST `/auth/logout` ve onun Origin/CSRF kontrolünü kullanır. Çift gönderim kilidi, 429/503/ağ hatasında tekrar deneme ve erişilebilir bildirim/odak vardır. Başarıdan sonra kişisel alanlar kaldırılır, `/giris` açılır ve Router yenilenir; misafir sepetine dokunulmaz. Hizmet hatasında profil gösterilmez, yeniden deneme sunulur.
- 21st MCP katalog aramalarından sonuç alınamadı; mevcut referans `get_component(7710)` ile alındı: [kavikatiyar/order-history](https://21st.dev/@kavikatiyar/order-history). Başlık ve sıralı içerik kabuğu mevcut AFİNA hesap stilleri, düz profil satırları ve marka tokenlarına uyarlandı. Mevcut özelleştirilmiş Button kullanıldı; yeni shadcn bileşeni veya animasyon eklenmedi. Mevcut reduced-motion/Button stilleri korunur.
- Eski `yakında`/demo hesap beklentileri yeni sunucu kapısına göre güncellendi. Demo profil/adres/sipariş testleri aynı gerçek demo bileşenini yalnız bellekte derlenen fixture'da çalıştıracak şekilde taşındı; production hesabım sayfasında demo geçişi yoktur. `login`, `membership`, `tracking`, `interior-pages` testlerindeki hesabım bağlantıları buna uyarlandı. Demo adapterlarının ve takip runtime'ının davranışı değiştirilmedi.

### Komutla doğrulama — 22 Ekim 2026

- Tüm npm/Vite doğrulamalarında mevcut git dışı `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` preload'u otomatik dotenv okumasını engelledi. SDK testleri gerçek Supabase SDK'sını sahte fetch/cookie yüzeyiyle çalıştırdı. Production build yalnız loopback `http://127.0.0.1:9`, `sb_publishable_task043_build_fixture`, `task043-service-must-never-be-used` sahte değerleri ve kapalı demo/ödeme önizleme bayraklarıyla alındı.
- RED: `npm test -- tests/unit/account.test.ts tests/unit/account-ui.test.tsx --maxWorkers=2` → **exit 1**, eksik hesap servisi ve AccountSummary importları; yerel checkpoint **8d3720a**. Aynı komut GREEN → **exit 0, 33 test başarılı**; yerel checkpoint **8da40eb**. Bu kanıtlar burada korunarak yalnız 043'ün yerel checkpoint'leri tek nihai task commit'inde birleştirildi; RED/ara commit'ler push edilmedi.
- `npm test -- tests/unit/account.test.ts tests/unit/account-ui.test.tsx --maxWorkers=2 --coverage --coverage.include=app/hesabim/page.tsx --coverage.include=components/account/AccountSummary.tsx --coverage.include=lib/account/read.ts` → **exit 0, 33 test başarılı**. Görev kapsamındaki V8 coverage: statements **47/47 (%100)**, branches **55/55 (%100)**, functions **10/10 (%100)**, lines **38/38 (%100)**. Bu global coverage veya tarayıcı kabulü değildir.
- `npm test -- --maxWorkers=2` → **exit 0, 53 dosyada 796 test başarılı**. `npm run lint`, `npm run typecheck`, `npm run build` → **exit 0**. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti; `/hesabim` dinamik route olarak derlendi. Public build'deki **32 JavaScript dosyasında 0 servis anahtarı/değişken veya özel fixture-veri referansı** bulundu. Fixture Vite `build({write:false, envDir:false})` ile bellekte derlendi; HTML giriş noktası doğrulandı. `git diff --check` başarılı.

| Garanti | Kanıt | Sonuç |
|---|---|---|
| Gerçek SDK ile Auth doğrulaması, cookie profilinin reddi, üyeler arası izolasyon, güvenli DTO, bozuk/eksik metadata ve 401/403/422/429/503/ağ hataları | `tests/unit/account.test.ts` | PASS |
| Her ortamda anonim yönlendirme, demo ile yetki atlanamaması, profil/hata/yeniden deneme, XSS'e karşı düz metin, admin verisi olmaması, POST çıkış/çift gönderim/odak/sepet koruma | `tests/unit/account-ui.test.tsx` | PASS |
| Normal/reduced-motion görünüm, anonim yönlendirme, mobil/dokunma ve masaüstü/klavye erişimi, çıkış ve hata sonrası tekrar deneme | `tests/e2e/account.spec.ts` (10 senaryo) | **Claude doğrulayacak** |

- `npm run test:e2e -- tests/e2e/account.spec.ts` **çalıştırılmadı** (AGENTS.md: Tarayıcı testleri Claude'da). Authenticated UI senaryoları gerçek AccountSummary bileşenini bellekte derler; sunucu kimlik doğrulaması kanıtı SDK/unit testleridir. Playwright, Lighthouse, inspect, ekran görüntüsü, tarayıcı veya uygulama sunucusu çalıştırılmadı. Kalan komutla doğrulanabilir görev engeli yoktur. Push, canlı Supabase/üyelik veya yayın kabulü anlamına gelmez; uzak hedef kurulumu 077'de ayrıca yapılacaktır.

## Durum: TAMAMLANDI
