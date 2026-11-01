# Task163 doğrulama — 1 Kasım 2026

## Yerel kanıt

- TDD: önce eksik seek modülüyle4test RED; sonra GREEN. AEO discovery iki
  route eksikken RED, uygulama sonrası GREEN. İlk hata çıktıları oturumda.
- Son tam koşu:96dosya / **1230unit PASS**, en fazla2worker. Log:
  .cache/task-163/unit-accepted.log. Lint ve typecheck PASS.
- `ASSET_SKIP_REENCODE=1 npm run build -- --webpack` production build PASS.
  Son log .cache/task-163/build-accepted.log. Webpack bu ortamda çalışan
  derleyici; proje varsayılan build motoru değiştirilmedi.
- Tüm mevcut görsel/hash/onay/alpha/boyut kapıları ve yeni scroll film kapısı
  PASS. Kaynak A→B aynı, yeni üretim0.4.042.962bayt/190kare/24fps/7,916667sn,
  GOP8, H264/yuv420p/sessiz/fast-start. FFprobe frame probe yerel cache'te;
  exact artifact SHA ve türetim lib/media/cinematic-scrub.json içindedir.
- Yeni testler: son hedefi tutan seek kuyruğu/ters scroll/same-time kilidi/
  hata reset/bounded dt yaklaşım; src-less poster SSR; touch/phone/short/
  reduced/saveData/weak-device kapıları; Blob preload ve frame readiness;
  offscreen/hidden durma, iki yönlü tercih, hata temizliği ve geç indirme.
- AEO: aynı5FAQ, doğru satın alma/talep anchor'ları, paylaşılmış gerçek
  e-posta taslağı açıklaması; tek gerçek güncelleme içeren Atom feed.
- Derlenmiş HTML incelemesi:7doğru bölüm,23görsel yolunun tamamı mevcut,
  bozuk section anchor0, tek resmîH1,6ürün,2ReactBits başlığı; canonical,
  Atom alternate ve theme-color doğru. Şema Organization/Place/WebPage/
  WebSite/FAQPage; Product/Offer/Review/Person uydurulmadı. Bu kontrol gerçek
  browser render veya canlıHTTP testi değildir. Kanıt static-render-check.json.
- Kontrast hesabı: ink/paper13.617, muted/paper6.678, gold/stone5.796,
  paper/olive11.165, ink/leaf8.066. Dekoratif çizgi tonu giriş alanında yetersiz
  bulundu; yalnız input için #717C69 güçlü sınır token'ı eklendi (≥3:1).
  .82opaklık zeytin perdesinin beyaz piksel üstü kuramsal alt sınırı7.644:1.
  Gerçek kare/geometri/fade durumu kontrast kabulü değildir.
- 21st4dosya scoped review:0error/0warning/3info; üçü sabit marka rengiyle
  film üzerindeki yerel perde/gölge RGBA'sıdır. Tasarım sistemi önerisi olarak
  kaydedildi, hata sayılmadı. Log .cache/task-163/21st-review.log.
- Bağımsız final kod incelemesi4somut sorun buldu ve düzeltildi: Blob sonrası
  auto preload, native hero sıfır travel başlangıcı, sahneden ayrılmış ziyaretçi
  için gecikmiş pin, homepage canonical'ın feed alternatifi ezmesi. Son
  incelemede bu düzeltmeler ve compiled feed doğrulandı. Piksel incelemesi yok.
- Geliştirilen dosyalarda diff whitespace kontrolü geçti. ÖncekiTask162 UIPro
  upstream CSV'leri CRLF, LICENSE sonu boş satır taşıyor; eski commit'in tam
  standart whitespace kontrolü bunları bildirir. Kaynakları sessizce normalize
  etmedik. Bu fark runtime veya son test başarısı değildir.

## Açık kabul

Görsel tarayıcı kabulü ortam izinleriyle bloke; paketli headless Chromium,
bağlantılı browser execution ve localhost denenmiş, çalışır render alınmamış.

Yeni163sinema e2e ve uyarlanmış162/161 senaryoları hazırlanmıştır fakat
ÇALIŞTIRILMADI. Gerçek scroll aşağı/yukarı ara kareleri,120/240/360px flick,
375×667/375×812/1280×800/1440×900 ve320–1024 responsive render, worst-frame
metin kontrastı, axe, klavye/nativegaleri/ürün/sepet/form ve Lighthouse
kabulü bekliyor. Fiziksel telefon ve gerçek işlem/teslimat ayrı kapıdır.
Eski v9 test/screenshot/Lighthouse sonuçları bu sürüme ait değildir.

`.cache/task-163/AFINA-v11-onizleme.html` derlenenHTML'den oluşturulmuş
statik inceleme dosyasıdır; scriptler kaldırılmış, CSS/varlıklar yerele
bağlanmış ve statik olduğuna dair görünür bant eklenmiştir. Film/işlemler
uygulamada çalışır; bu dosya interaktif site veya piksel kabul kanıtı değildir.

Push/deploy yapılmadı. V9 canlı sürümü değişmedi. Yeni medya/kredi harcaması0.
Task163 KOD HAZIR / GÖRSEL VE YAYIN KABULÜ BEKLİYOR; TAMAMLANDI değildir.

## Sonraki somut kabul

Yalnız paketli headless Chromium ve ≤2worker:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/cinematic-scrub-163.spec.ts tests/e2e/scrolling-sections-162.spec.ts tests/e2e/pro-plan-161.spec.ts --project=chromium-390 --project=chromium-1440 --workers=2
```

Ardından belirtilen boyutlarda görsel/axe ve gerçek flick kabulü yapılır.
Kullanıcının Chrome'u açılmaz; browser.close() / sunucuSIGTERM korunur.
Kabul kanıtı ve somut görsel inceleme sonrası mevcut yayın akışı izlenir.
