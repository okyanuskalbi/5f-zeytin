# Task 132: Sepette ödeme logoları görünmüyor (beyaz üstüne beyaz)

## Tür
frontend

## Amaç
Claude 131'i canlıda test etti (`~/PROJELER/AFINA-KAYNAK/araclar/log/z-131/d-sepet.png`, `m-sepet.png`, `ozet.jpg`): sepet çekmecesindeki (ve muhtemelen `/sepet` özet kartındaki) "Güvenli Ödeme" satırında logolar açık/süt renkli bir plaka üzerinde. `paytr.svg`, `visa.svg`, `troy.svg` tamamen `fill="white"` olduğu için görünmüyor; yalnız Mastercard görünüyor. Footer'daki aynı hata 123'te düzeltilmişti.

## Kullanılacak araçlar
- `ui-ux-pro-max`, `frontend-design` fiilen yüklenir; Coder Notu'na kısa "Skill / nerede kullanıldı" tablosu.
- `tdd-workflow`.

## İstenen
- Sepet çekmecesi, `/sepet` özet kartı, ürün detay penceresi (130) ve ödeme önizleme sayfasındaki tüm ödeme logo satırlarını tara. Beyaz SVG'nin arkasında açık renk zemin olan her yerde zemini kaldır (koyu yüzey) ya da koyu yüzey yoksa logoların **koyu renkli sürümünü** kullan: `public/images/payment/` altına `paytr-dark.svg`, `visa-dark.svg`, `troy-dark.svg` (aynı çizim, dolgu `#0E1510` ya da markanın resmi rengi: Visa `#1A1F71`). `SOURCES.md` güncellenir.
- Ortak bir `PaymentLogos` bileşeni (`tone="light" | "dark"`) ile tek yerden yönet; footer (123) davranışı değişmez.

## Kabul kriterleri
- [ ] Unit: `PaymentLogos` her kullanımda zemin/ton uyumlu (açık zeminde dark sürüm, koyu zeminde beyaz sürüm).
- [ ] Unit: sepet çekmecesi ve `/sepet`'te dört logo `alt` metinli.
- [ ] `npm test`, lint, typecheck, build yeşil; 123 ve 131 testleri korunur.

## Yapılmaması gerekenler
- Yeni ödeme yöntemi logosu ekleme; logo çizimini değiştirme (yalnız dolgu rengi).
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Coder Notu

| Skill | Nerede kullanıldı |
|---|---|
| `ui-ux-pro-max` | Fiilen yüklendi; `logo contrast light surface --domain ux` aramasıyla açık zeminde koyu görsel/kontrast ilkesi uygulandı. |
| `frontend-design` | Fiilen yüklendi; mevcut marka yüzeyleri, logo ölçülerini belirleyen CSS ve footer düzeni korundu. |
| `tdd-workflow` | Fiilen yüklendi; önce hata üreten unit testler çalıştırıldı, sonra düzeltme ve regresyon doğrulaması yapıldı. |

- `PaymentLogos` tüm ödeme logo çizimlerini tek yerden seçer: `tone="dark"` açık yüzeyde koyu çizim, `tone="light"` koyu yüzeyde özgün beyaz çizim demektir. Mastercard her iki yüzeyde özgün renklerini korur; tüm logolarda alt metni vardır.
- Tarama: çekmece ve `/sepet` ortak `CartTrust` içindeki süt renkli plakada koyu sürümleri kullanır. Ürün detay penceresi (130) ve footer koyu yüzeyde beyaz sürümleri kullanır. Ödeme önizlemesinde bağımsız bir logo satırı yoktur; ortak footer aynı bileşeni kullanır. Yeni logo/yöntem veya önizleme satırı eklenmedi.
- `paytr-dark.svg`, `visa-dark.svg`, `troy-dark.svg` eklendi; yalnız beyaz dolgu sırasıyla `#0E1510`, `#1A1F71`, `#0E1510` yapıldı. Kaynaklar `public/images/payment/SOURCES.md` içinde kayıtlıdır. Unit testler özgün dosyalarla tam metin karşılaştırması yaparak çizim, viewBox ve ölçülerin değişmediğini doğrular.
- 21st MCP aramalarından kullanılabilir yeni bileşen alınmadı; mevcut Checkout Summary (36084) ve footer (21474) uyarlamaları ortak logo bileşeniyle korundu. Ek skill veya bağımlılık kurulmadı.

Doğrulama:

- RED: `npm test -- tests/unit/payment-logos-132.test.tsx --maxWorkers=2` → 6 testten 5'i beklendiği gibi başarısız: iki sepet yüzeyinde yanlış SVG, üç koyu dosya eksik. RED/GREEN checkpointleri yalnız yerelde tutuldu; push öncesi tek görev commitinde birleştirildi.
- GREEN: `npm test -- tests/unit/payment-logos-132.test.tsx tests/unit/cart-131.test.tsx tests/unit/footer-refresh.test.tsx tests/unit/footer-127.test.tsx tests/unit/product-detail-130.test.tsx --maxWorkers=2` → 53/53 geçti; 123 ve 131 regresyonları korunuyor.
- `npm test -- --maxWorkers=2 --coverage --coverage.include=components/site/PaymentLogos.tsx --coverage.reporter=text` → 40 dosya, 450/450 test geçti. Yalnız yeni `PaymentLogos.tsx` için satır/ifade/fonksiyon/dal kapsamı %100; global coverage ölçümü değildir.
- `npm run lint`, `npm run typecheck`, `npm run build` → geçti. Build öncesi varlık kontrolü: 18 görsel ve 112 v3 çıktı geçti. `git diff --check` → geçti.
- Tarayıcı testleri çalıştırılmadı; Claude doğrulayacak. `tests/e2e/payment-logos-132.spec.ts` 1440/390/320 px için çekmece, `/sepet`, ürün detayı ve footer'da dosya/alt metni/yükleme/zemin uyumunu doğrulamak üzere yazıldı.

## Durum: TAMAMLANDI
