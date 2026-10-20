> ONAY GEREKLİ (DB/ödeme/auth)

# Task 068: Admin müşteri görünümü

## Tür
fullstack

## Amaç
Müşteri ve sipariş özetini yetkili admin’e göster.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 063 (admin-shell); 043 (account); 044 (orders-db). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Admin görsel sözleşmesi

Görsel referans: docs/referans/admin-stil.md ([stil belgesi](../referans/admin-stil.md)).

shadcn bileşenleri (ortak liste): **Sidebar, Card, Table + sıralama, Chart, Command/search, Badge**. Her biri yalnız ilgili yüzey gerektiğinde kullanılır; shadcn için MCP yok, resmi CLI ile incele/ekle ve ZEYTİN tokenları + Figtree’ye uyarla. Ayrıntılı yerleşim ve erişilebilirlik kabulü stil belgesindedir.

Müşteri Table, mevcut arama/pagination ve sipariş özeti; minimum kişisel veri, yetkisiz arama indeksi yok. **ONAY GEREKLİ** kapısı ve mevcut bağımlılıklar değişmez.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, security-review
- 21st MCP: evet — müşteri tablosu/detayı
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/admin/musteriler/page.tsx` (oluştur / düzenle)
- `lib/admin/customer-read.ts` (oluştur / düzenle)
- `tests/e2e/admin-customers.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Pagination ve arama; minimum kişisel veri, parola/token yok; üye/anon erişimi reddedilir.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/admin-customers.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
