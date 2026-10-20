> ONAY GEREKLİ (DB/ödeme/auth)

# Task 064: Admin ürün yönetimi

## Tür
fullstack

## Amaç
En fazla 6 ürünü admin’den yönet.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 063 (admin-shell); 029 (catalog-api). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Admin görsel sözleşmesi

Görsel referans: docs/referans/admin-stil.md ([stil belgesi](../referans/admin-stil.md)).

shadcn bileşenleri (ortak liste): **Sidebar, Card, Table + sıralama, Chart, Command/search, Badge**. Her biri yalnız ilgili yüzey gerektiğinde kullanılır; shadcn için MCP yok, resmi CLI ile incele/ekle ve ZEYTİN tokenları + Figtree’ye uyarla. Ayrıntılı yerleşim ve erişilebilirlik kabulü stil belgesindedir.

Ürün Table sıralaması ve durum Badge’leri; en fazla 6 gerçek ürün ve mevcut form/yetki sınırı korunur. **ONAY GEREKLİ** kapısı ve mevcut bağımlılıklar değişmez.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, api-design, security-review
- 21st MCP: evet — ürün tablosu/formu
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/admin/urunler/page.tsx` (oluştur / düzenle)
- `app/api/admin/products/route.ts` (oluştur / düzenle)
- `components/admin/ProductForm.tsx` (oluştur / düzenle)
- `tests/e2e/admin-products.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ekle/düzenle/yayından kaldır, stok/fiyat ve upsell ilişkisi; sunucu limit/yetki/doğrulama; gerçek ürünler kullanıcıdan, onaysız görsel yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/admin-products.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
