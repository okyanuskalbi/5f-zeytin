# Task173 — Sepet ikonu ve Device Hub kontrolü

## İstek ve başlangıç

Kullanıcı navbar sepet ikonunu düzenlemeyi ve https://afinazeytin.com mobil
sitesini Device Hub içinde açıp kontrol etmeyi istedi. Kabul edilen Task172
scroll tasarımı ve mevcut ticari akış korunur.

Task172 yayını `.cache/task-172/final-receipt.json` üzerinden doğrulandı:
main `a6640f2d864aee6e268152514d0f0697a4cbc227`, Actions41499058867 SUCCESS,
Vercel REST `dpl_A4dNzMdgntjEwCz9TTkyNjvS7e3g` READY; afinazeytin.com alias
bağlı. O yayının canlı Chromium emülasyon kabulü 12 profil/63 kontrol ve
9 navbar viewport/4 scroll durumudur. Fiziksel iOS/Android kabulü değildir.

## Kapsam ve araçlar

- Navbar sepet düğmesi 44×44 px, ShoppingCart ikonu 22 px olur.
- Boş sepette sayı rozeti görünmez; pozitif miktar görünür, 99 üzeri `99+`
  gösterilir. Erişilebilir ad gerçek toplam miktarı bildirmeye devam eder.
- Hydration/katalog hazır olma koşulu, sepet drawer açma, Escape ile kapama,
  tetikleyiciye odak dönüşü ve mevcut hesap/menü davranışları korunur.
- Gerçek altı SKU, fiyat/stok, hesap/ödeme, teklif ve e-posta akışı değişmez.
- frontend-patterns ve tdd-workflow kullanılır. Bu mevcut ikon değişimi yeni
  21st bileşeni veya paket kurulumu gerektirmez.
- Yerel otomatik tarayıcı yalnız paketli headless Chromium, en fazla 2 worker;
  browser.close() ve başlatılan sunucu için düzgün kapanış zorunludur.
- Kullanıcının açık isteği kapsamındaki Device Hub native arayüzünü yalnız
  yürütücü kontrol eder. Gerçek hesap, sipariş, ödeme veya e-posta gönderilmez.

## Yerel doğrulama

`.cache/task-173/nav-local/report.json` mevcut ve `success:true`:

- 320–1440 px arasında 9 viewport: ikon, boş rozetin gizli olması ve 44×44 px
  düğme ölçüsü doğrulandı; sepet drawer açma, Escape ve odak dönüşü geçti.
- 4 scroll durumu, /kvkk → ana sayfa dönüşü, reduced-motion ve JavaScript
  kapalı navbar fallback kontrolü geçti.
- Kayıt `http://127.0.0.1:3021/` üzerindedir; runtime hata ve yazma isteği yok.
  Bu sonuç Task173 canlı yayınının veya iOS Safari davranışının kanıtı değildir.
- Kanıt araçları `.cache/task-173/qa-navbar.mjs`,
  `.cache/task-173/run-local-qa.mjs`; ekran görüntüleri `nav-local/` altındadır.
- Kod kapıları doğrulandı: 117 dosya/1411 unit, tam lint, typecheck ve webpack
  production build PASS. Komutlar ve exit0 sonuçları
  `.cache/task-173/local-verification.json`; ham kayıtlar aynı klasörde
  `lint.log`, `typecheck.log`, `unit.log`, `build.log`.
- `.cache/task-173/processes.json` yerel sunucunun düzgün kapandığını kaydeder;
  tarayıcı yürütücüsü browser.close() ile kapanışı bildirdi.

## Device Hub: gerçekleşen kısmi canlı kontrol

Yürütücünün native UI gözlemi: `com.apple.dt.Devices` içindeki **iPhone 17 Pro /
iOS 26.5 SIMULATOR**, Safari ile https://afinazeytin.com açıldı. Menü açıldı;
**Ürünlerimiz** bağlantısı ürün bölümüne gitti. İlk ürünün gerçek fotoğrafı,
fiyatı ve CTA yüzeyi görünür olarak doğrulandı.

Bu gözlem mevcut Task172 canlı yayınına aittir. Task173 ikonu henüz yayında
doğrulanmış değildir. Simülatör fiziksel telefon değildir; bu birkaç adım
tüm mobil akışın veya donanım performansının kabulü olarak sunulmaz.
Oturumda görülmeyen ekran/eylem için ekran görüntüsü ya da test sonucu var
varsayılmaz; ek kanıt dosyası üretildiğinde tam yolu buraya yazılır.

## Bekleyen kabul adımları

- Device Hub'da hero/tesis/sofra ileri-geri kaydırma; ilk/son ürün ve detay
  aç/kapat, B2B/finale, menü ve sepet drawer kontrolü.
- Safari adres çubuğu, portre/yatay dönüş ve form klavyesi aç/kapat sonrasında
  görünür CTA, doğal kaydırma ve odak geri dönüşü.
- Reduce Motion aç/kapat sonrası okunabilir native akış ve geri dönüş;
  değiştirilen cihaz tercihini önceki değerine döndürme. `navigator.connection`
  yoksa sistem Low Data Mode tercihi `saveData` kabulü olarak yazılmaz.
- Normal main push, exact-commit Actions doğrulaması ve yetkili doğrudan
  Vercel REST API yayını.
- Yayından sonra taze canlı sepet ikonu ve temel drawer kabulü. Son makbuz
  hedefi `.cache/task-173/final-receipt.json`; henüz mevcut kabul edilmez.

## Durum: YEREL KOD KABULÜ TAMAM / DEVICE HUB KISMİ / YAYIN SIRADA

Yerel kod kapıları, navbar tarayıcı kontrolü ve sınırlı Device Hub Safari
gözlemi kaydedildi. Kalan simülatör adımları ve Task173 yayın/canlı kabulü
tamamlanmadan bu görev TAMAMLANDI olarak işaretlenmez.
