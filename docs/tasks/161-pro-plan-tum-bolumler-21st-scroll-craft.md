# Task 161 — Yedi bölümde pro plan, 21st ve Scroll Craft

Kullanıcının yeni pro planı ve bütün bölümlerde 21st/Scroll Craft isteği uygulanır. Yaratıcı yön için önceki “sormadan devam et” devri sürer. Ek dosyanın örnek fiyat, ürün, iletişim ve Vite komutları gerçek proje verisi veya mimari kararı değildir.

## Kaynaklar ve kapsam

- Kaynak plan: `docs/referans/afina-zeytin-pro-plan-20261101.md`; SHA-256 `71f03f1b5a01bb8ed1a648e59cd4928f3c840e90f5634116795650e3b06997d5`.
- Skill: mevcut proje yerel Scroll Craft 0.3.1; frontend-design, frontend-ui-engineering ve 21st-ui-build. Önce `builds/afina-v9/{BRIEF,PLAN,COPY}.md`, sonra runtime yazıldı.
- Renkler #84CC16/#EDE8DD/#1C1F1A/#C89B3C, erişilir koyu altın #735519; Fraunces/Inter. Özgün logo, slogan, altı SKU ve sunucu fiyat/stock otoritesi korunur.
- Yedi bölüm: doğal tam ekran film → tek lineer yatay galeri → gerçek tesis parallax → üç aşamalı bento → üç B2B segmenti → teklif hazırlığı → SSS/adres/kapanış. Galerideki gerçek ürün ve B2B seçimi aynı forma taşınır.
- Dokuz gerçek seçili 21st kaynak, iki reddedilen sonuç, bir yalnız incelenmiş referans `21ST-SOURCES.json` içinde component/demo/raw SHA ile kayıtlıdır. Tüm bölüm/nav/footer kaynakları okunup proje token/işlevlerine uyarlandı.
- Mevcut `LazyMotion` ile `m as motion` ve bütün yeni importlar `motion/react` üzerinden. İkinci scroll motoru, input/body kilidi veya video playhead scrub yok. Scroll Craft motor dosyaları byte-identical referans; QA adaptörü yalnız araç belleğinde Motion sahnelerini okur.
- Kabul edilmiş A→B Flow kaynağından ücretsiz 5 saniyelik ileri/geri kurgu; 120 kare/24 fps/1280×720/sessiz/faststart, 2.742.609 bayt. İlk/son decoded piksel eşliği ve SSIM1 ayrı kanıtla doğrulandı; build yalnız pinli kaynak/çıktı hash ve MP4 yapısını okur. Yeni üretim/kredi yok. Diğer üç aday klip public/runtime'a alınmadı.
- SMTP/WhatsApp servisi bulunmuyor. Form alan/KVKK doğrulamasından sonra gerçek e-posta taslağı hazırlar; gönderimi kullanıcı mail uygulamasında tamamlar. Resmî çatı şirketin info@afina.com.tr ve +90 328 882 77 08 bilgileri kaynak niteliğiyle sunulur; sabit hat WhatsApp diye etiketlenmez. Teslim/CRM başarısı veya gerçek gönderim iddia edilmez.

## TDD ve yerel kabul

İlk sözleşme testi eski runtime'da yedi kaynaklı bölüm ve SKU→talep aktarımı bulunmadığı için RED verdi. Ayrıca video indirmesinin belge yüklenmeden başlamaması için davranış RED→GREEN kaydı tutuldu. Eski v8 hero seçimi beklentileri yeni galeri ve aynı SKU'nun formdaki devamıyla değiştirildi; kontrast 4,5 ve poster90KB sınırları korundu.

Son kaynak: 91 dosya/1208 unit PASS; lint ve typecheck PASS; medya kapıları ve production build PASS. Chromium 320/390/768/1024/1440 px, toplam95 durum: 87 PASS, 8 yalnız kompozisyona uygun responsive skip. Testler 360×640 açılış, doğrudan x=−travel×p, son karta odak, resize/reduced geçişi, doğal rail, JS kapalı form güvenliği, gerçek SKU/segment→gönderilmemiş mailto özeti, iki doğal video döngüsü, pause/hidden/offscreen/failure, sepet/menu/üyelik/legal işlevlerini kapsar. Gerçek müşteri/e-posta/sipariş/ödeme yazımı yapılmadı.

İlk görsel kabulde kart görsellerinin taşması,320px son kart genişliği, mobil kontrolün origin kutusu altında kalması ve kontroller yokken poster selector'ının yanlış düzlemi hedeflemesi bulundu ve düzeltildi. Ayrı kaynak incelemesi kaynak/hash, medya ve servis doğruluğunu doğruladı. Son piksel taraması/yayın makbuzu eklenecek.

21st review: hata0/uyarı0; yalnız bilgilendirme önerileri. Scroll Craft masaüstü/mobil/reduced6konum taraması: çıkış0, dead-scroll0, örneklenmiş copy kontrastı≥4,5. Son kaynakta tekrarları ve gerçek yayın kabulü ayrıca kaydedilecek. Yerel varsayılan Lighthouse masaüstü99/A100; mobil81/A100, simüle LCP4,86sn. Bu mobil performans hedefini karşılamaz; gerçek productionHTTP2 ölçümü yapılmadan tamamlandı diye yazılmaz. İlk görüntü high-priority, kullanılmayan italik preload kaldırıldı ve video belge yüklemesine kadar ertelendi; ölçüm farkı açık tutulur.

Yalnız paketli headless Chromium, worker≤2; açılan browser ve Next süreçleri düzgün kapatılır. Fiziksel telefon, gerçek hesap/sipariş/ödeme, doğrudan e-posta teslimi ve WhatsApp aktivasyonu kabul edilmez.

## Durum: UYGULANIYOR

Main CI → Vercel REST API → canlı viewport/etkileşim/HTTP/hash/görsel kabulü bekleniyor. V8 sonuçları v9 kabulü yerine geçmez.

## Canlı ilk kontrol ve hız düzeltmesi

İlk kaynak `0f1e4ec2a7d1454f3dcd6d9b1f3d14f8e592142f`, CI41313687355 SUCCESS ve API `dpl_2GwDbCwKS8CsHZLXVpP7ZxQm7Kw8` READY. İlk canlı e2e85PASS/8skip/2FAIL: test henüz route hydration olmadan koyu logo kaynağını okuyordu. Bilinmeyen ilk rota için doğru açık home nav varsayımı eklendi. Tam son kaynak tekrar kabulü bekliyor.

Canlı ilk mobil Lighthouse85/A100/LCP4,31sn; hedef90/2,5sn henüz karşılanmadı. Döngünün ilk IDR paketi son kareye aynen kopyalanarak aynı piksel seam korunup video6.847.142→2.742.609bayt oldu (SSIM, önceki kodlamaya göre0,9686). Uygulanan font kimlikleri değişmeden yerel Türkçe/Latin alt kümeleri üretildi: Inter44.740B, Fraunces62.948B; glif/eksen/SHA/lisans kaydı `lib/media/pro-fonts.json`. Kullanılmayan italik preload ve kritik metin fade kaldırıldı. Mobil ek dekoratif dal yerine gerçek filmin kendi ön planını kullanır; masaüstü bağımsız katman korunur. Bu ölçülmüş performans düzeltmesidir; yeni medya üretimi/kredi yok.

Son polish yerel kabulü:1208unit/lint/typecheck/build ve87e2e PASS. Altı boyutta görsel/axe/taşma/JS/HTTP kaynağı hatası0; son Scroll Craft masaüstü40/mobil41/reduced40kare, dead-scroll0, örneklenen kontrast≥4,5. Native headless harness yalnız doğrulama adaptörüyle Motion sahnelerini okur; ikinci runtime motoru eklenmez.

Lighthouse iki yöntem ayrı tutulur: varsayılan Lantern simülasyonu mobil86/A100/LCP4,183sn (90/2,5 hedefi açık); ayrı gerçek DevTools mobil throttling (562,5ms istek gecikmesi/1474,56Kbps/4×CPU) yerelde100/A100/LCP0,868sn/TBT0. Bu sonuç Lantern başarısı veya fiziksel telefon kanıtı diye sunulmaz. Gözlenen hızlı localhost LCP ile simüle LCP karıştırılmaz. Bağımsız inceleme konfigürasyon hatası bulmadı; LCP H1, video ondan sonra isteniyor. Mobilde gizli dekoratif dal isteği lazy/low yapıldı. Canlı son kaynakta her iki yöntem ayrıca ölçülecek.
