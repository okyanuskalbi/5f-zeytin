> ONAY GEREKLİ (DB/ödeme/auth)

# Task 050: PayTR sonucunu sunucudan gösterme

## Tür
frontend

## Amaç
PayTR dönüşünde başarılı/başarısız/bekleyen ödeme sonucunu yalnız sunucuda doğrulanmış siparişten göster.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 049 (payment-callback); 046 (checkout-ui); 048 (payment-embed). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, security-review
- 21st MCP: evet — payment status
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/odeme/sonuc/page.tsx` (oluştur / düzenle)
- `components/checkout/PaymentStatus.tsx` (oluştur / düzenle)
- `tests/e2e/payment-result.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. `merchant_ok_url` / `merchant_fail_url` aynı `/odeme/sonuc` ekranına döner. URL’deki sonuç ve sipariş parametrelerine güvenme; siparişe erişim kontrolü ve sunucu ödeme durumu kullanılır. Doğrulanmış PayTR callback’i gelene kadar “Ödeme teyidi bekleniyor” göster; sınırlı polling/yenileme, zaman aşımı ve güvenli yeniden deneme. Dönüş sayfası sipariş durumuna yazmaz; tekrar ödeme güvenliği ve kişisel veri sızdırmayan hata. 001b’nin DB’siz önizleme yönlendirmesi gerçek ödeme teyidi olarak kullanılamaz.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/payment-result.spec.ts` başarılı; ok/fail URL manipülasyonu sipariş durumunu değiştirmez; callback gecikmesi/bekleyen, onaylı/başarısız sonuç, yetkisiz erişim, polling sınırı ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
