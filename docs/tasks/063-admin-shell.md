> ONAY GEREKLİ (DB/ödeme/auth)

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


## Durum: BEKLİYOR
