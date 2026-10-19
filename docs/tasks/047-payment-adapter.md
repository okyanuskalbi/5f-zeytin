> ONAY GEREKLİ (ödeme)

# Task 047: PayTR iFrame oturumu başlatma

## Tür
backend

## Amaç
Yalnız PayTR iFrame API ile sunucuda test ödeme oturumu oluştur; `createPaytrSession(order) → {iframeUrl, token}` sözleşmesini uygula.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 045 (checkout-api). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review, tdd-workflow
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `lib/payments/paytr.ts` (oluştur/düzenle; varsa 001b helper’ını yeniden kullan; server-only)
- `.env.example` (yalnız boş anahtar adları)
- `app/api/payments/start/route.ts` (oluştur / düzenle)
- `tests/unit/payment-adapter.test.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Sağlayıcı kararı 000c ile kapalı: yalnız PayTR. MLNEW `app/api/checkout/route.ts` ve `lib/payments/paytr.ts` salt okunur referans; hesap/anahtar teslimi ve ödeme uygulama onayı ayrı kapıdır. 001b uygulanmışsa helper’ı yeniden kullan; 001b tamamlanmadıysa helper burada oluşturulur; bu görevin bağımlılığı 045 olarak kalır. Sağlayıcı registry/adapter soyutlaması veya seçici oluşturma; gelecekte sağlayıcı ekleme ayrı karardır.
3. `createPaytrSession(order) → {iframeUrl, token}` yalnız sunucuda çalışır; yetkili sipariş, integer kuruş, para birimi ve sepet sunucudan gelir. [PayTR 1. Adım](https://dev.paytr.com/iframe-api/iframe-api-1-adim) uyarınca `get-token` isteği ve `paytr_token` HMAC-SHA256/base64 üretimi; dönen token yalnız `https://www.paytr.com/odeme/guvenli/<token>` adresine gömülür.
4. `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` yalnız `.env.local`/sunucu env; `PAYTR_TEST_MODE` sunucuda doğrulanan 0/1 bayrağıdır, tarayıcıdan seçilemez. Testte 1; canlıya geçiş ayrı onaydır. `merchant_ok_url` / `merchant_fail_url` güvenilir uygulama origin’inden kendi `/odeme/sonuc` sayfamıza kurulur. Oturum açma siparişi ödenmiş yapmaz.
5. Start route’u sipariş sahipliği, CSRF/rate limit, çift başlatma/idempotency, zaman aşımı ve PayTR hata yanıtını işler; key/salt/paytr_token loglanmaz ve istemciye gönderilmez. Kart verisi alınmaz.
6. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
7. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/payment-adapter.test.ts` başarılı; mock `get-token` isteğinin alanları ve HMAC fixture’ı, `{iframeUrl, token}`, eksik anahtar, timeout, hatalı token yanıtı, yetkisiz sipariş ve yinelenen başlatma doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Durum: BEKLİYOR
