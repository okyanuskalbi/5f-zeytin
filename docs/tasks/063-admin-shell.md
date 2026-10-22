> ONAY VERİLDİ (kullanıcı, 22 Eki 2026) (DB/ödeme/auth)

# Task 063: Admin kabuk bileşeni

## Tür
frontend

## Amaç
Admin navigasyon ve operasyon özetini kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 062 (admin-auth); 002 (tokens). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Admin görsel sözleşmesi

Görsel referans: docs/referans/admin-stil.md ([stil belgesi](../referans/admin-stil.md)).

shadcn bileşenleri (ortak liste): **Sidebar, Card, Table + sıralama, Chart, Command/search, Badge**. Her biri yalnız ilgili yüzey gerektiğinde kullanılır; shadcn için MCP yok, resmi CLI ile incele/ekle ve ZEYTİN tokenları + Figtree’ye uyarla. Ayrıntılı yerleşim ve erişilebilirlik kabulü stil belgesindedir.

Kabukta Sidebar, üst arama ve üç özet Card; içgörü/Chart yalnız yetkili mevcut veriyle. Mobil menü ve tablo erişimi referanstaki kabulden geçer. **ONAY GEREKLİ** kapısı ve mevcut bağımlılıklar değişmez.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — yalnız kabuk yerleşimi ilhamı; shadcn Sidebar/Table resmi CLI’den
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/admin/AdminShell.tsx` (oluştur / düzenle)
- `app/admin/page.tsx` (oluştur / düzenle)
- `tests/e2e/admin-shell.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ürün, sipariş, kupon/kampanya, terk edilen sepet, müşteri, kargo alanları; gerçek API yoksa etiketli test fixture. shadcn CLI ve proje tokenları; ek AI editör/stüdyo yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/admin-shell.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
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

- 22 Ekim 2026 kullanıcı onayı, `062-admin-auth` ve `002-tokens` görevlerinin TAMAMLANDI kayıtları doğrulandı. ECC `frontend-patterns` ve `accessibility`, kurulu Next.js 16.4.2'nin layout/page ve server/client bileşen belgeleri okundu. Ek skill kurulmadı.
- Bu oturumda 21st MCP erişimi yoktu; araç listesinde kabuk arama/üretim aracı bulunmadı. Resmi shadcn CLI ile `docs sidebar card command table badge`, `view @shadcn/sidebar @shadcn/card @shadcn/table @shadcn/badge` ve `add sidebar card badge --yes` çalıştırıldı. [Resmi Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar), [Card](https://ui.shadcn.com/docs/components/radix/card), [Command](https://ui.shadcn.com/docs/components/radix/command) kaynakları incelendi. Mevcut Button/Sheet/Input korunarak yeni Sidebar/Card/Badge, admin'in yerel açık gri/beyaz/yeşil tokenları, Figtree, 8px köşe, 44px etkileşim alanları ve görünür odağa uyarlandı. Kullanılmayan otomatik CLI bağımlılıkları çıkarıldı; global tema ve paket sürümleri değiştirilmedi.
- `/admin` sayfası mevcut layout kapısına ek olarak render öncesinde `requireAdmin()` çağırır; kimlik/e-posta istemciye aktarılmaz. Kabukta gruplu altı operasyon alanı ve Genel Bakış bulunur. Henüz ayrı operasyon sayfaları olmadığı için gezinme ve arama, mevcut yetkili sayfanın odaklanabilir bölüm başlıklarına gider; olmayan sayfalara bağlantı yoktur. Üst arama Türkçe büyük/küçük harfleri destekler, yalnız alan adlarını filtreler; kişisel veri indeksi veya API çağrısı oluşturmaz.
- Üç özet kartının her birinde **TEST VERİSİ** etiketi ve ortak açıklama bulunur (3/6 aktif ürün, 2 ödeme bekleyen, 1 kargoya hazır örnek). Gerçek API entegrasyonu yoktur. Altı operasyon alanı ve içgörü/grafik yüzeyi dürüst boş durum gösterir; grafik/tablo veya gerçek kayıt uydurulmadı. Veri tablosu/sıralama ilgili 064–069 görevlerinin kapsamındadır. Özetin yükleme/boş/hata durumları ve sunucu yenileme eylemi hazırdır; geçersiz sayılar ve 6'dan fazla aktif ürün değeri hata durumuna düşer.
- Masaüstü menü 256px; 1024px altında mevcut Radix Sheet kullanılır. Menü açılışı, kapatma/ESC, odak geri dönüşü, seçimde başlığa odak ve masaüstüne geçişte kapanış desteklenir. Admin CSS modülü yalnız render edilmiş yetkili kabuk varken çevredeki vitrin header/footer'ını gizler; vitrin dosyaları ve tasarımı değiştirilmedi. Reduced-motion kuralı, yerel açık tema ve portala taşınan Sheet üzerinde de geçerlidir.
- Görevin dosya listesine ek olarak yalnız zorunlu destek dosyaları eklendi: `AdminShell.module.css`, resmi CLI'den uyarlanmış üç UI primitive'i, davranış unit testi ve üretim auth kapısını değiştirmeden gerçek istemci bileşenini bellekte derleyen üç E2E fixture/helper dosyası.
- `.env*` dosyaları okunmadı/yazılmadı; mevcut git dışı `NODE_OPTIONS="--require=$PWD/.cache/task-027/no-dotenv.cjs"` preload'u otomatik dotenv yüklemesini engelledi. Build yalnız `https://127.0.0.1:9` ve sahte anahtar değerleriyle alındı. Canlı Supabase bağlantısı, uzak migration veya gerçek operasyon yapılmadı.

### Komutla doğrulama — 22 Ekim 2026

- RED: `npm run test -- tests/unit/admin-shell.test.tsx --maxWorkers=2` → **exit 1**, henüz bulunmayan `app/admin/page` import'u. Aynı test hedefi uygulamadan sonra **exit 0, 17 test başarılı**. RED/ara commit oluşturulmadı veya push edilmedi.
- Görev testleri: sayfada yeniden yetki kontrolü, 401/403/503'te kabuk render edilmemesi, altı mevcut bölüm/aktif gezinme, açık fixture etiketleri, Türkçe arama/sonuçsuz durum/ESC, yükleme/boş/hata/yeniden deneme, geçersiz sayılar/≤6 sınırı ve mobil menü odak geri dönüşü/seçim doğrulandı.
- `npm test -- --maxWorkers=2` → **exit 0, 55 dosyada 867 test başarılı**. Son kod üzerinde tam koşu tekrar yeşil geçti.
- Göreve özel coverage: `npm run test -- tests/unit/admin-shell.test.tsx --maxWorkers=2 --coverage --coverage.include=components/admin/AdminShell.tsx --coverage.include=app/admin/page.tsx` → **exit 0**; statements **62/65 (%95,38)**, branches **50/54 (%92,59)**, functions **26/28 (%92,85)**, lines **53/54 (%98,14)**. Global coverage iddiası değildir.
- `npm run lint && npm run typecheck && npm run build` → **exit 0**. İlk lint'teki iki vitrin bağlantısı Next Link'e çevrilerek düzeltildi. Build öncesi **18 görsel + 112 v3 çıktı** kontrolü geçti; `/admin` dinamik route olarak derlendi. `git diff --check` başarılı.
- Yerel palet Node assertion ile ölçüldü: ana metin/beyaz **15,28:1**, yardımcı metin/beyaz **6,63:1**, yardımcı metin/gri **6,05:1**, beyaz/yeşil **12,26:1**, uyarı metni/beyaz **8,67:1**, input sınırı/beyaz **3,70:1**. Bu hesap görsel tarayıcı kabulünün yerine geçmez.
- E2E fixture/helper Node + Vite ile **bellekte başarıyla derlendi**, HTML/JS çıktısı assertion ile doğrulandı. `tests/e2e/admin-shell.spec.ts` normal/reduced-motion; 320/390/768/1024/1440px; klavye, mobil Sheet/ESC/odak, arama, yükleme/boş/hata/iyileşme ve anonim/sahte oturum senaryolarını içerir.
- **Claude doğrulayacak:** `npm run test:e2e -- tests/e2e/admin-shell.spec.ts`, responsive görünüm, gerçek tarayıcıda odak/kontrast/dokunma hedefleri ve reduced-motion kabulü. AGENTS.md kuralıyla Playwright, Lighthouse, inspect veya tarayıcı çalıştırılmadı. Bunlar dışında görev kapsamında kalan uygulama engeli yok; TAMAMLANDI yerel kod/komut kabulünü belirtir, canlı admin veya uzak DB kabulü değildir.

## Durum: TAMAMLANDI
