# AFİNA ZEYTİN

[afinazeytin.com](https://afinazeytin.com) için premium vitrin ve satın alma projesi.

Next.js App Router + TypeScript + Tailwind 4 uygulaması ve Vitest/Playwright test temeli kuruldu. AI Studio React/Vite kaynakları [_legacy/](_legacy/) içinde korunur.

Node.js 24 ve npm 11 ile yerel kurulum:

```sh
export npm_config_cache="$PWD/.cache/npm"
npm ci
npm run dev
```

Yerel adres: **http://localhost:3004**. `npm run start` da 3004 portunu kullanır; önce `npm run build` çalıştırılmalıdır.

Kabul komutları ve repo içinde tarayıcı kurulumu:

```sh
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
npm exec -- playwright install chromium firefox webkit
npm run lint && npm run typecheck && npm run test -- tests/unit/bootstrap.test.ts
npm run build && npm run test:e2e -- tests/e2e/bootstrap.spec.ts
```

Playwright Chromium, Firefox ve WebKit'te 320/390/768/1440 genişliklerini test eder. Yerel production sunucusunu kendisi başlatıp kapatır; 3004 portunda mevcut sunucu varsa durur. `PLAYWRIGHT_BASE_URL=https://<hedef-host> npm run test:e2e -- tests/e2e/bootstrap.spec.ts` ile açık hedef verildiğinde yerel sunucu başlatılmaz; hedef host rapora yazılır ve sayfada ZEYTİN uygulama işareti doğrulanır.

Mimari/açık kararlar: [docs/PLAN.md](docs/PLAN.md). Sıralı görevler: [docs/tasks](docs/tasks). Özgün [görsel promptları](docs/visual-prompts.md) korunur. Claude planlar ve denetler; Codex görevleri AGENTS.md kurallarına göre uygular. Görsel, DB, ödeme ve yayın onayları ilgili görevlerde ayrıca alınır.

## Yerel PayTR ödeme önizlemesi (001b)

`npm run dev` sonrasında **http://localhost:3004/odeme-onizleme** adresini açın.
DB, üyelik veya gerçek sipariş gerekmez. Sunucu tek örnek zeytin ürünü için **100 kuruş (1 TL)** ve her denemede benzersiz sipariş numarası üretir; fixture beş dakika ömürlüdür, kalıcı kayıt oluşturulmaz. Tarayıcıdan tutar/sepet/test modu alınmaz. Önizlemede `PAYTR_TEST_MODE=0` olsa bile PayTR'a **`test_mode=1`** gönderilir.

`.env.example` yalnız beş boş değişken adını içerir. Gerçek test bilgilerini yalnız git dışında kalan `.env.local` içine girin: `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`. Yerelde `PAYMENT_PREVIEW=1` açık önizleme bayrağıdır; boşken de geliştirmede açılır, `PAYMENT_PREVIEW=0` kapatır. Eksik anahtarda ekran 200 açılır ve **“Test anahtarı eksik — .env.local'e ekleyin”** gösterir; token/iframe/PayTR isteği yapılmaz. Sunucu ayarları değişince dev sunucusunu yeniden başlatın.

Gerçek test iframe'i için test anahtarları ve dış ağ gerekir. PayTR localhost üzerinde de müşterinin dış IP adresini ister; gerekiyorsa kendi dış IP'nizi ek sunucu değişkeni `PAYTR_PREVIEW_USER_IP` olarak `.env.local` içinde tanımlayın. Bu değer istemciye aktarılmaz. Token isteği aynı origin'den gelmeli; yerel süreçte toplam beş deneme/dakika sınırı ve sekiz saniye sağlayıcı zaman aşımı vardır. Kart numarası/CVV alanları yalnız PayTR iframe'indedir. iframeResizer yüklenemezse veya iframe açılmazsa yeniden deneme gösterilir.

**Production build'de** `/odeme-onizleme`, `/api/odeme-onizleme/paytr-token` ve iki sonuç sayfası **`PAYMENT_PREVIEW=1` olsa bile 404** döner; PayTR çağrısı yapılmaz. `npm run start`, production modudur; önizleme için `npm run dev` kullanın.

Otomatik kabul, anahtarsız dev sunucusuyla ve ayrı terminalde çalışır:

```sh
# Terminal 1: açık bir 3004 dev sunucusu yoksa başlatın.
PAYTR_MERCHANT_ID= PAYTR_MERCHANT_KEY= PAYTR_MERCHANT_SALT= PAYMENT_PREVIEW=1 npm run dev

# Terminal 2
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
export PLAYWRIGHT_BASE_URL=http://localhost:3004
npm run test -- tests/unit/payment-preview.test.ts
npm run test:e2e -- tests/e2e/payment-preview.spec.ts
npm run lint && npm run typecheck && npm run build
```

E2E gerçek dev rotalarında eksik anahtar/sonuç uyarılarını kontrol eder; test bileşeni fixture'ında token, iframe ve resizer ağını mock'lar. Fixture runtime'a eklenmez. Bu testler gerçek PayTR iframe'i, tahsilat veya callback kabulü sayılmaz.

PayTR sunucu-sunucu bildirimi localhost'a ulaşamaz. Tam test için erişilebilir HTTPS tunnel ve PayTR panelinde **Bildirim URL** ayarı gerekir. Örnek komut `cloudflared tunnel --url http://localhost:3000`; bu repoda port **3004** olduğundan karşılığı:

```sh
cloudflared tunnel --url http://localhost:3004
```

Panel/hesap değişikliği ayrıca yetkilendirilir. **Task 049 uygulanmadan yalnız iframe/yönlendirme görülebilir; tam callback testi tamamlanmış sayılmaz.** `merchant_ok_url` / `merchant_fail_url` isteğin origin'ine (yerelde localhost) döner; query parametresi veya bu dönüş siparişi ödenmiş yapmaz. Sonuç sayfaları yalnız **“Önizleme yönlendirme sonucu, ödeme teyidi değildir.”** uyarısını gösterir. Callback hash helper'ı fixture ile test edilir; callback endpoint'i, DB veya e-posta yazımı bu görevde kurulmaz. Sözleşme: [PayTR 1. Adım](https://dev.paytr.com/iframe-api/iframe-api-1-adim), [PayTR 2. Adım](https://dev.paytr.com/iframe-api/iframe-api-2-adim).
