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

## Durum: BEKLİYOR
