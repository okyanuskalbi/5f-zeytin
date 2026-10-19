> ONAY GEREKLİ (DB/ödeme/auth)

# Task 056: Terk edilen sepet ve izin şeması

## Tür
backend

## Amaç
Sepet snapshot, izin ve gönderim kayıtları şemasını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 040 (auth-core); 053 (coupons-db). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: database-migrations, postgres-patterns, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `supabase/migrations/` (oluştur / düzenle)
- `tests/db/abandoned-carts.sql` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Pazarlama izni, opt-out, saklama süresi açık; süre/oran kullanıcı onayından gelir. Sunucu-only hassas veriler; açık GRANT/REVOKE/RLS ve kullanıcılar arası izolasyon.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] Yalnız onaylı YEREL test hedefinde `supabase db reset --local && supabase test db tests/db/abandoned-carts.sql` başarılı; üretim projesine uygulanmaz.
- [ ] SQL testleri anon/authenticated/service_role GRANT/REVOKE ve RLS erişimini, başka kullanıcı izolasyonunu ve şema kısıtlarını doğrular.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
