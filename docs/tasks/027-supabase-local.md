> ONAY GEREKLİ (DB/ödeme/auth)

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

## Durum: BEKLİYOR
