> ONAY GEREKLİ (DB/ödeme/auth)

# Task 055: Sunucu fiyatını sepet ve checkout gösterimine bağlama

## Tür
frontend

## Amaç
Kupon ve miktar değişince sunucu quote sonucunu sepet/checkout içinde göster.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 054 (pricing); 037 (cart-page); 046 (checkout-ui); 039 (upsell). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility
- 21st MCP: evet — fiyat/kupon özeti
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/cart/CartSummary.tsx` (oluştur / düzenle)
- `components/cart/Upsell.tsx` (oluştur / düzenle)
- `components/checkout/CheckoutForm.tsx` (oluştur / düzenle)
- `lib/cart/quote-client.ts` (oluştur / düzenle)
- `tests/e2e/quote-ui.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Yüzde/tutar kupon, kademe ve UTM sözleşmesini tüket; istemci nihai fiyat hesaplamaz. Stale quote, stok değişikliği, süresi bitmiş kupon ve request yarışı; onaysız eşik/oran yok.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/quote-ui.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
