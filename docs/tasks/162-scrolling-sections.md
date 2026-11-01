# Task 162 — AFİNA'yı kaydırılan sahnelerle yeniden kurma

## İstek
Kullanıcı: “zeytin sitesini baştan scrolling sectionla yapalım”, ardından
“npm i framer-motion”, “uipro init --ai codex”, “bunları kullan”.

## Kapsam ve araçlar
Frontend. Scroll Craft, frontend-design, frontend-ui-engineering, 21st-ui-build,
proje yerel UI/UX Pro Max, motion-foundations/motion-patterns, accessibility ve
tdd-workflow. Kullanıcının framer-motion isteği eski import tercihinin önüne
geçer; mevcut Motion çalışma zamanı ile aynı sürüm/paylaşılan LazyMotion korunur.

Mevcut altı SKU, logo, resmî slogan, onaylı medya, ürün detayı, sepet, üyelik ve
teklif bağlamı korunur. DB/ödeme/e-posta servisi değişmez. Yeni medya üretimi yok.
v9 tasarım ve yayın belgeleri tarihçe olarak korunur; yeni kabul yerine geçmez.

## Uygulama
- Başlık ve bağımsız film/ön dal düzlemleriyle yeni açılış.
- Eski bento yerine üç gerçek aşamalı, kaydırmayla medyası değişen üretim hikâyesi.
- Üretim hikâyesi ve tesis kanıtından sonra altı SKU'lu ürün galerisi.
- Büyük, sade B2B seçim satırları; aynı gerçek teklif formuna devam.
- Teklif, SSS ve “Sofrada görüşürüz.” kapanışı.
- Desktop sticky/parallax; telefon, kısa ekran, JS kapalı ve reduced-motion
  doğal akış. Native scroll; wheel/touch ele geçirme yok.

## Kabul
RED/GREEN davranış testi; tam unit/lint/typecheck/build. Headless paketli Chromium,
en fazla iki worker; 320/390/768/1024/1440, ara kaydırma konumları, klavye,
modal/sepet, reduced-motion ve no-JS. Browser ve yerel sunucular düzgün kapatılır.
Yerel teslim, yayın ve gerçek ticari servis kabulü ayrı kaydedilir.

## Coder Notu
Başlangıç main a301542, çalışma ağacı temiz. 1208 unit/lint/typecheck PASS.
`uipro init --ai codex` kuruldu; mevcut .agents uyarlaması değiştirilmedi.

- RED: 1c3b129, eski sıralamada yeni hikâye davranışı beklenen nedenle başarısız.
- GREEN: 93 dosya / 1216 test PASS; lint/typecheck ve webpack production build PASS.
- Framer Motion14.4.0 doğrudan bağımlılık; motion14.4.0 ile tek runtime doğrulandı.
- React Bits BlurText, pinned4dc7b5b7 kaynağından B2B/kapanışa uyarlandı; lisansı
  korundu. Kaynak/uyarlama SHA ve UIPro kullanımı v10/SOURCES.json içinde.
- Üç eski bölüm sıralama beklentisi güncellendi; ürün/stock/gerçek fiyat/teklif
  ve güvenlik testleri korunur. Yeni chapter/observer/native/reduced ve metin
  hareketi testleri eklendi. Scoped21streview:0error/0warning/1info.
- Derleme için üç document CSS kuralı aynı koşullarla globals.css'ye taşındı;
  /giris varsayılan props'u Next PageProps tipine uyarlandı. İşlev değişmedi.
- E2E senaryoları hazır fakat görsel tarayıcı/yerel sunucu izni nedeniyle
  çalıştırılamadı. Piksel/axe/Lighthouse/fiziksel cihaz kabulü iddia edilmez.
- Yayın/push yapılmadı. Tam kanıt ve kalan kapı:
  ../scrollcraft/builds/afina-v10/VERIFICATION.md.

## Durum: KOD HAZIR; GÖRSEL TARAYICI KABULÜ VE YAYIN BEKLİYOR
