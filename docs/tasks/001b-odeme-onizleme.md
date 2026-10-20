> ONAYLANDI (ödeme önizlemesi, DB yok): kullanıcı 19 Eki 2026 "LOCALDE HER İKİ SİSTEMİ GÖREYİM" + "SADECE PAYTR OLARAK DEVAM ET". Gerçek anahtar yoksa uyarılı mod; anahtar YALNIZ .env.local.

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

## Coder Notu

### Uygulama — 20 Ekim 2026

- PLAN, AGENTS, 001 ve belirtilen MLNEW kaynakları salt okunur incelendi. ECC `backend-patterns`, `api-design`, `security-review`, `tdd-workflow` ve hareket/erişilebilirlik kuralları uygulandı. ECC kurallarındaki TDD ve kod/güvenlik incelemesi için salt okunur yardımcı ajan kullanıldı; mimari/plan değiştirilmedi.
- 21st MCP arama ve kod erişimi başarılı: [astralyxdev/checkout-summary](https://21st.dev/@astralyxdev/components/checkout-summary), demo **36084**. Integer kuruş, semantik özet satırları ve ayrılmış toplam düzeni `PaymentPreview` içine uyarlandı; ZEYTİN renk, tipografi ve mevcut Button tokenları kullanıldı. Yeni shadcn bileşeni eklenmedi. Ekranda kendi kart/CVV alanı ve dekoratif hareket yok; reduced-motion ve klavye erişimi test edildi.
- Ortak server-only kapı tüm sayfalarda ve API'de production'ı koşulsuz kapatır. Yerelde varsayılan/açık bayrak desteklenir; `PAYMENT_PREVIEW=0` kapatır. Token route'u aynı-origin kontrolü, beş deneme/dakika yerel süreç sınırı, sekiz saniye timeout, `no-store` ve güvenli hata yanıtı kullanır. Tarayıcı tutar/sepet/modu dikkate alınmaz; tek sabit ürün **100 kuruş**, benzersiz alfanümerik `merchant_oid`, beş dakikalık istek ömürlü fixture ve zorunlu **`test_mode=1`** vardır.
- Token ve callback imza yardımcıları [PayTR 1. Adım](https://dev.paytr.com/iframe-api/iframe-api-1-adim) / [2. Adım](https://dev.paytr.com/iframe-api/iframe-api-2-adim) ile doğrulandı. Callback endpoint'i, ödeme durumu güncellemesi, DB/auth/e-posta veya gerçek sipariş yazımı eklenmedi. Sonuç sayfaları query parametrelerinden bağımsız olarak yalnız yönlendirme uyarısı verir.
- Zorunlu destek değişiklikleri: server-only import sınırı için resmi npm sürümü doğrulanan `server-only@0.0.1`, `package.json` ve lockfile'a eklendi. Mock durumlarını gerçek anahtar olmadan incelemek için mevcut proje yaklaşımıyla iki **yalnız test** Vite fixture dosyası eklendi (`tests/e2e/fixtures/payment-preview.html` / `.tsx`); runtime'da fixture rotası yok. Playwright yapılandırması değiştirilmedi. Yeni skill kurulmadı.
- README 3004 yerel adresini, test komutlarını, production kapısını ve localhost/tunnel/callback sınırını açıklar. Task'taki 3000 tunnel örneği ile bu projenin onaylı 3004 karşılığı birlikte verildi. PayTR'ın localhost için dış IP gereksinimi nedeniyle isteğe bağlı sunucu değişkeni `PAYTR_PREVIEW_USER_IP` belgelendi; gerçek değer yalnız `.env.local` içinde tutulur. `.env.example` istenen **beş boş adı** içerir.

### Komutla kabul kanıtı

- **RED:** `npm run test -- tests/unit/payment-preview.test.ts` → exit 1, eksik uygulama importları nedeniyle **22 başarısız test**. Checkpoint **`cf89b45`**. **GREEN:** aynı komut → exit 0, **22 başarılı**; uygulama checkpoint **`5903d44`**. Ortak sayfa/sonuç kapısı testi eklenince son koşum **23/23** başarılı.
- Ek incelemede iframe yüklenmesinin resizer zamanlayıcısını erken kapattığı hata bulundu. `PLAYWRIGHT_BASE_URL=http://localhost:3004 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/payment-preview.spec.ts --project=chromium-390 --grep 'stalled resizer'` → gerçek RED, hata/yeniden deneme görünmedi. Checkpoint **`5977371`**. Iframe ve resizer birlikte hazır olana dek timeout korundu; iframe hata dinleyicisi/temizliği eklendi. GREEN checkpoint **`2fee129`**.
- `npm run test -- tests/unit/payment-preview.test.ts --coverage --coverage.include='lib/payments/*.ts' --coverage.include='app/api/odeme-onizleme/**/*.ts'` → **exit 0, 23 test**. PayTR/preview yardımcıları ve token route'unda **statement/line/function %100, branch %98**. Python `hmac` ile bağımsız hesaplanan sabit token/callback hash fixture'ları, yanlış hash, zorunlu test modu, istemci tutarının yok sayılması, eksik anahtar, production, origin, rate limit, timeout, bozuk/başarısız sağlayıcı yanıtları ve sır sızdırmayan hata yanıtları doğrulandı.
- `npm run lint && npm run typecheck && npm run build` → **exit 0**. Build öncesi varlık kontrolü **16/16** geçti. Production build üç önizleme sayfasını kapalı 404 olarak üretti. Mevcut Next dev/typegen kaynaklı `next-env.d.ts` yol değişikliği göreve alınmadı.
- Anahtarsız mevcut ZEYTİN dev sunucusu doğrulandı: `http://localhost:3004/odeme-onizleme` → **200**, `.env.local` mevcut değil. `PLAYWRIGHT_BASE_URL=http://localhost:3004 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/payment-preview.spec.ts` → **exit 0, 84 başarılı / 0 başarısız / 0 atlanan / 0 flaky (41.9 sn)**. Chromium/Firefox/WebKit × 320/390/768/1440 = **12 proje**. JSON raporu hedefi `localhost:3004` ve bu sayıları Node assertion'larıyla doğruladı. İlk sandbox tarayıcı açılış engeli gerekli süreç izniyle giderildi.
- Gerçek dev sayfasında uyarı birebir, token/iframe/PayTR tarayıcı isteği **0** ve doğrudan token POST'u kontrollü **503**. Mock bileşeninde token bekleme, doğru PayTR iframe URL'si, resizer yüksekliği, iframe/resizer hatası ve timeout, yeniden deneme, güvenilmeyen iframe origin'inin reddi, dinleyici/script temizliği, klavye odağı, reduced-motion ve mobil yatay taşma olmaması geçti. İki gerçek sonuç sayfasında sahte `paid/status/amount` query'leri ödeme teyidi oluşturmadı.
- Aynı production build ile **ayrı süreçlerde** `PAYMENT_PREVIEW=0 npm run start -- --port 3101` ve `PAYMENT_PREVIEW=1 npm run start -- --port 3101` çalıştırıldı. Her süreçte `curl -s -o /dev/null -w '%{http_code}'` ile `/odeme-onizleme` GET, `/api/odeme-onizleme/paytr-token` POST, `/odeme-onizleme/sonuc/ok` GET, `/odeme-onizleme/sonuc/fail` GET → **dördü de 404**. Dummy fixture anahtarları mevcutken de fetch probe sayacı **0 PayTR çağrısı**; her süreç sonlandırılıp **3101 portunun boşaldığı** doğrulandı. Yerel probe/komut dosyaları ve loglar git dışındaki `.cache/payment-preview-*` altında tutulur.
- `git ls-files .env.local` → **boş**; `git check-ignore .env.local` → ignore edildi. `.env.example` beş satırın her birinin boş değer içerdiği Node assertion'ıyla doğrulandı. `git diff --check` geçti. PLAN, diğer task'lar, `_legacy/`, özgün promptlar, katalog ve diğer repolar değiştirilmedi.

### Gerçek sağlayıcı kabulü sınırı

**Gerçek PayTR test anahtarları sağlanmadığı için gerçek sağlayıcı iframe'i açılmadı.** Yukarıdaki iframe/token kanıtları mock'tur; anahtarsız ekranın kabulü gerçektir. Bu, task'ın açıkça desteklediği anahtarsız moddur ve otomatik kabulün önkoşulu değildir. Gerçek iframe için test anahtarları/dış ağ/dış IP; tam sunucu bildirimi için ayrıca HTTPS tunnel, yetkilendirilmiş PayTR panel ayarı ve **Task 049** gerekir. Gerçek tahsilat, gerçek callback veya canlı yayın kabulü yapılmadı. Görevin beş kabul kriteri komutlarla tamamlandı; uygulama engeli yok.

## Durum: TAMAMLANDI
