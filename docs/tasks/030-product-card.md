# Task 030: Ürün kartı bileşeni

## Tür
frontend

## Amaç
Her ürünün satın alma kartını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 002 (tokens). **Geçici veri kararı (Claude, 19 Eki):** 029 (Supabase katalog) kullanıcı kararı beklediği için kart `lib/catalog/static-products.ts` içindeki temsili ≤6 ürün sabit verisini, 029'un döneceği tipte (`types/catalog.ts`) okur; veri kaynağı tek bir `getProducts()` fonksiyonunun arkasında, 029 geldiğinde yalnız o fonksiyon değişir. Fiyatlar temsili ve UI'da "temsili" notu yok ama `static-products.ts` başında yorum + PLAN'da açık karar olarak kalır. Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — product card
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/catalog/ProductCard.tsx` (oluştur / düzenle)
- `tests/e2e/product-card.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Sofralık zeytin, salamura zeytin, zeytinyağı kapsamındaki gerçek ≤6 ürün: ağırlık, fiyat, stok, adet, sepete ekle; yükleniyor/boş/tükendi durumları. Ürün/fiyat kullanıcıdan, görseller yalnız onaylı manifest; testte temsili fixture. Resmi bölüm 04 kapsamı aşılmaz; “%100 organik / %100 doğal” iddiaları ve banner rozeti kullanılmaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/product-card.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
