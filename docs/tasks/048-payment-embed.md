> ONAY GEREKLİ (DB/ödeme/auth)

# Task 048: Tek ödeme ekranında PayTR iFrame

## Tür
frontend

## Amaç
Checkout siparişini aynı `/odeme` ekranında gömülü PayTR iFrame API akışına bağla.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 047 (payment-adapter); 046 (checkout-ui). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review
- 21st MCP: evet — ödeme çevresi: özet/güven/kupon/kargo kartları; kart alanları PayTR’ye ait
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/checkout/PaytrPayment.tsx` (oluştur / düzenle)
- `components/checkout/CheckoutForm.tsx` (oluştur / düzenle)
- `app/odeme/page.tsx` (aynı ekranı birleştir)
- `tests/e2e/payment-embed.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. MLNEW `components/cart/CartView.tsx` yalnız okunur düzen referansı: masaüstünde solda temsili kart görseli, sipariş özeti ve güven bilgisi, sağda PayTR iframe; mobilde aynı akış tek kolona iner. Özet/upsell/kupon/kargo çevresini ZEYTİN tokenlarına uyarla; sunucu quote’u tutar otoritesidir. 046 formu ve 047 start aynı ödeme ekranında kalır.
3. `https://www.paytr.com/odeme/guvenli/<token>` allowlist’i; `iframeResizer` ile yükseklik ve lifecycle temizliği, erişilebilir iframe başlığı, yüklenme/hata/yeniden deneme ve çift başlatma koruması. Kart alanlarını kendimiz çizme; kart numarası/CVV DOM/state/log’a alınmaz, 3D Secure PayTR iframe akışındadır. Sonuç kendi `merchant_ok_url` / `merchant_fail_url` sayfalarımızda gösterilir.
4. Mock start sonucu ve iframe sınırını E2E’de test et; harici iframe’in kart alanlarını uygulama testiyle taklit edip gerçek PayTR kabulü sayma. Test/canlı modu yalnız sunucu env’den gelir.
5. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
6. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/payment-embed.spec.ts` başarılı; aynı ödeme ekranında sol özet/güven + sağ iframe, mobil tek kolon, doğru iframe URL’si, resize, yüklenme/hata/yeniden deneme, reduced-motion/klavye ve uygulamada kart alanı bulunmaması doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
