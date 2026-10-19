> ONAY GEREKLİ (ödeme)

# Task 001b: PayTR yerel ödeme önizlemesi (DB yok)

## Tür
fullstack

## Amaç
001’den hemen sonra localhost’ta sabit örnek siparişle PayTR iFrame ödeme ekranını test modunda göster; DB, üyelik ve gerçek sipariş akışına bağımlı olmasın.

## Bağlam
`docs/PLAN.md`: yalnız PayTR iFrame API kararı (000c). Bağımlı task’lar / addBlockedBy: 001 (bootstrap). Bu dosya bir uygulama taslağıdır; 000c kod/anahtar/hesap kurulumu yapmaz. PayTR test hesabı/anahtar erişimi ayrıca sağlanır; anahtarsız ekran ve mock testleri bunlara bağımlı değildir.

## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review, tdd-workflow
- 21st MCP: evet — ödeme ekranı çevresi, özet/güven kartı; ZEYTİN tokenlarına uyarla, kart alanı üretme.
- find-skills ile bulunup kurulacak ek skill: yok; yeni kurulum gerekirse Coder Notu’na yaz.

## Dokunulacak dosyalar
- `app/odeme-onizleme/page.tsx`
- `app/odeme-onizleme/sonuc/ok/page.tsx`
- `app/odeme-onizleme/sonuc/fail/page.tsx`
- `app/api/odeme-onizleme/paytr-token/route.ts`
- `components/checkout/PaymentPreview.tsx`
- `lib/payments/preview.ts` (server-only erişim kapısı ve bellek içi fixture)
- `lib/payments/paytr.ts` (server-only token/hash helper’ları; 047/049 yeniden kullanır)
- `.env.example` (yalnız boş adlar; `.env.local` git’e girmez)
- `README.md` (yerel önizleme, test ve tunnel notları)
- `tests/unit/payment-preview.test.ts`
- `tests/e2e/payment-preview.spec.ts`

## Adımlar
1. PLAN, AGENTS, 001 ve salt okunur MLNEW `components/cart/CartView.tsx`, `app/api/checkout/route.ts`, `app/api/payments/paytr/callback/route.ts` referanslarını oku. Kaynak sırlarını/ürünlerini kopyalama. Önce davranış testlerini başarısız çalıştır (RED).
2. `/odeme-onizleme`, token route’u ve ok/fail sonuç sayfalarında ortak sunucu erişim kapısı kullan. `NODE_ENV !== 'production'` yerel kullanımını destekle; `PAYMENT_PREVIEW=1` yerelde açık önizleme bayrağıdır. **Production build her durumda 404**: `NODE_ENV === 'production'` iken bu bayrak kapıyı açamaz. Sayfa/API/sonuç kapıları aynı kurala uyar; kapalı modda PayTR isteği atılmaz.
3. Sunucuda tek sabit örnek ürün, integer kuruş tutarı ve benzersiz `merchant_oid` ile kısa ömürlü bellek içi sahte sipariş oluştur. Tarayıcı tutar/sepet/test modu belirlemez. DB/auth/gerçek stok, e-posta veya gerçek sipariş yazımı yok.
4. POST `/api/odeme-onizleme/paytr-token`: [PayTR 1. Adım](https://dev.paytr.com/iframe-api/iframe-api-1-adim) sözleşmesine göre sunucuda `get-token` çağır; `paytr_token` HMAC-SHA256/base64 helper’ı kullan. Önizlemede `PAYTR_TEST_MODE` başka değer olsa da `test_mode=1` zorunlu; canlı çekim mümkün olmaz. Zaman aşımı, istek sınırı/aynı-origin kontrolü ve güvenli hata; log/bundle/yanıtta merchant key/salt veya imza yok. Yanıt `{iframeUrl, token}`.
5. `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`, `PAYTR_TEST_MODE`, `PAYMENT_PREVIEW` adlarını `.env.example` içine boş değerle ekle. Gerçek değerler yalnız git’ten dışlanan `.env.local` içindedir. Anahtar eksikse sayfa 200 açılır; ödeme alanında tam “Test anahtarı eksik — .env.local'e ekleyin” uyarısı, token isteğinde kontrollü hata; iframe/PayTR çağrısı yok.
6. Sol örnek sipariş/temsili kart görseli/güven bilgisi, sağ `https://www.paytr.com/odeme/guvenli/<token>` iframe; mobil tek kolon, `iframeResizer` yükseklik ve temizliği. Kart numarası/CVV alanı çizme veya state/log’da tutma; 3D Secure PayTR iframe akışında kalır. Yüklenme/hata/yeniden deneme ve reduced-motion/klavye erişimi.
7. `merchant_ok_url` / `merchant_fail_url` localhost origin’iyle ok/fail sonuç sayfalarına döner. Yalnız “önizleme yönlendirme sonucu, ödeme teyidi değildir” göster; yönlendirme veya query parametresi siparişi ödenmiş yapmaz. [PayTR 2. Adım](https://dev.paytr.com/iframe-api/iframe-api-2-adim) callback hash helper’ını fixture ile test et; bu görev üretim callback/DB yazımı kurmaz (049).
8. README’ye `cloudflared tunnel --url http://localhost:3000` notu: PayTR sunucu-sunucu bildirimi localhost’a ulaşamaz; tam test için erişilebilir HTTPS tunnel ve PayTR panelinde Bildirim URL ayarı gerekir. 049 uygulanmadan yalnız iframe/yönlendirme görülebilir; tam callback testi tamamlandı denmez. Panel/hesap değişikliği ayrı yetki gerektirir. Gerçek iframe açılması için test anahtarları ve dış ağ gerekir; otomatik testler mock ile bağımsız çalışır.
9. Kabul komutlarını çalıştır, mock kanıtını gerçek test iframe/callback kanıtından ayrı Coder Notu’na yaz. Anahtar eksikliği gerçek iframe’i engelliyorsa bunu kaydet; lint/build/mock testlerini tamamla.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/payment-preview.test.ts`: mock PayTR token isteği, zorunlu `test_mode=1`, sabit `paytr_token` ve callback hash fixture’ları, hatalı hash, timeout/sağlayıcı hatası, eksik anahtar ve production kapısı başarılı.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.
- [ ] PayTR anahtarları olmayan yerel sunucuda `npm run test:e2e -- tests/e2e/payment-preview.spec.ts` uyarıyı birebir görür; token/iframe isteği yapılmaz. Mock token ile iframe URL/yüklenme/hata ve ok/fail yönlendirme uyarısı da doğrulanır.
- [ ] `PAYMENT_PREVIEW=0 npm run start -- --port 3101` ve ayrı çalıştırmada `PAYMENT_PREVIEW=1 npm run start -- --port 3101` altında `curl -s -o /dev/null -w '%{http_code}' http://localhost:3101/odeme-onizleme` → `404` (aynı production build). Token route’una POST, ok/fail sayfalarına GET de `404`; production’da PayTR çağrısı yok. Her çalıştırmayı bitirip portu boşalt.
- [ ] README localhost/tunnel/callback sınırını açıklar; `.env.example` beş boş anahtar adı içerir, `git ls-files .env.local` boş döner; DB/auth bağımlılığı ve gerçek ödeme yok.

## Yapılmaması gerekenler
- Gerçek tahsilat, hesap/anahtar oluşturma veya üretim DB/servis değişikliği yapma.
- MLNEW, AFINA-KAYNAK veya başka repoya yazma; sırları kopyalama/commit etme.
- Önizleme sonuç yönlendirmesini doğrulanmış ödeme olarak sunma; kendi kart alanlarını çizme.

## Durum: BEKLİYOR
