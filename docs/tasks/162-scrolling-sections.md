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

## Durum: UYGULANIYOR
