> ONAY GEREKLİ (DB/ödeme/auth)

# Task 049: PayTR callback doğrulaması

## Tür
backend

## Amaç
Yalnız PayTR sunucu-sunucu bildirimini doğrula ve siparişi idempotent güncelle; yanıt düz `OK` olsun.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 047 (payment-adapter). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review, tdd-workflow
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/api/payments/paytr/callback/route.ts` (oluştur / düzenle)
- `lib/payments/confirm.ts` (oluştur / düzenle)
- `lib/payments/paytr.ts` (ortak hash doğrulama helper’ı)
- `tests/unit/payment-callback.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. MLNEW `app/api/payments/paytr/callback/route.ts` salt okunur referans. [PayTR 2. Adım](https://dev.paytr.com/iframe-api/iframe-api-2-adim): form POST için beklenen hash `base64(HMAC-SHA256(merchant_key, merchant_oid + merchant_salt + status + total_amount))`; uzunluk kontrolü ve sabit zamanlı karşılaştırma. Eksik alan, geçersiz status/hash veya bilinmeyen siparişte durum değişmez, başarılı alındı yanıtı verilmez.
3. Callback tarayıcı oturumu/CSRF token’ına dayanmaz; hash ve sunucudaki PayTR sipariş kaydı esastır. Kayıtlı sipariş/para birimi/test modu ve tutarlar doğrulanır; `total_amount` vade farkıyla artabilir, siparişin `payment_amount` alanı ve taksit kurallarıyla kontrol edilir. Anahtarlar ve test bayrağı sunucu env’den okunur.
4. Transaction/koşullu durum geçişi ve benzersiz ödeme olayıyla tekrar/eşzamanlı bildirim aynı siparişi yalnız bir kez işler; stok/e-posta gibi yan etkiler tekrar tetiklenmez. İşlenmiş geçerli bildirime de HTTP 200, `text/plain`, yalnız `OK` gövdesi döner. Yazma başarısızsa `OK` verilmez; yeniden bildirime izin verilir.
5. Sipariş durumu yalnız bu doğrulanmış callback ile değişir; `merchant_ok_url` / `merchant_fail_url` ve istemci query parametreleri sipariş onaylayamaz. Anahtar/hash/kişisel veri loglanmaz; test/canlı siparişleri karıştırılmaz.
6. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
7. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/payment-callback.test.ts` başarılı; sabit HMAC fixture’ı, bozuk hash/alan, yanlış sipariş/tutar/para birimi/test modu, vade farkı, success/failed, tekrar ve eşzamanlı bildirim, DB hatası ve yalnız `OK` yanıtı doğrulanır; sonuç URL’si sipariş değiştiremez.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
