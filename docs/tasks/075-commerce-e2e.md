> ONAY GEREKLİ (DB/ödeme/auth)

# Task 075: Satın alma akışı bütünleşik kabul

## Tür
fullstack

## Amaç
Vitrinden takip sayfasına test ortamında tek satın alma yolunu doğrula.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 054 (pricing); 050 (payment-result); 052 (order-email); 039 (upsell); 072 (history); 070 (shipping-email); 064 (admin-products); 066 (admin-coupons); 067 (admin-carts); 068 (admin-customers); 048 (payment-embed); 055 (quote-ui); 058 (cart-sync); 061 (unsubscribe); 041 (register); 038 (cart-wire). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: e2e-testing, verification-loop, security-review
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `tests/e2e/commerce.spec.ts` (oluştur / düzenle)
- `tests/fixtures/commerce.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Üye kayıt/giriş, ürün, drawer/sayfa, upsell/kupon, sandbox ödeme callback, sipariş/geçmiş/kargo; yetkisiz erişim, başarısız/tekrar ödeme ve izin/opt-out senaryoları. Gerçek tahsilat/e-posta yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/commerce.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
