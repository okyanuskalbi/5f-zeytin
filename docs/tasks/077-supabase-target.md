> ONAY GEREKLİ (DB/ödeme/auth)

# Task 077: Onaylı uzak Supabase hedefini hazırlama

## Tür
backend

## Amaç
Kullanıcı proje/org kararı ve açık onayı sonrası staging Supabase hedefini hazırla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 076 (quality); 027 (supabase-local); 028 (catalog-db); 044 (orders-db); 053 (coupons-db); 056 (cart-db). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: deployment-patterns, database-migrations, postgres-patterns, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `docs/yayin/supabase.md` (oluştur / düzenle)
- `scripts/check-backend.mjs` (oluştur / düzenle)
- `package.json` (oluştur / düzenle)
- `tests/unit/supabase-target.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Bu taslak kaynak oluşturma onayı değildir. Onaylanan org/proje/region kaydını doğrula; yeni proje oluşturma veya mevcut hedef seçimini kullanıcının kararına göre uygula. Env anahtarlarını yalnız güvenli ortamdan al. Onaylı ref ile link, migration dry-run, açık hedef onayı sonrası migration uygulama ve Auth callback URL yapılandırması. GRANT/RLS ve sahiplik smoke kontrolü; loglarda token/URL şifresi/PII yok. check:backend scripti hedefin staging olduğunu ve beklenen refi doğrulayarak API erişim politikasını salt okunur test etsin.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `supabase db push --linked --dry-run` doğru onaylı staging ref/migration listesini gösterir; açık uygulama onayı sonrası `supabase db push --linked` sonucu docs/yayin/supabase.md içinde sır içermeden kayıtlıdır.
- [ ] `npm run test -- tests/unit/supabase-target.test.ts && npm run check:backend -- --target staging` başarılı; anon/üye/servis erişim ayrımı ve Auth callback ayarı kanıtlanır.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
