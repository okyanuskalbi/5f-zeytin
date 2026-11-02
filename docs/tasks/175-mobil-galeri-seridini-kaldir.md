# Task175 — Mobil galeri kontrol şeridini kaldır

Kullanıcı mobil galeri üstündeki açıklama, sayaç ve okları kaldırmayı istedi.
1023px ve altında data-rail-controls CSS ile tamamen gizlenir; SSR/noJS dahil.
Ürün sırası/iç numara, görseller, fiyat, CTA, scroll/swipe/keyboard ve desktop
kontrolleri değişmez. Yeni bileşen/dependency/provider gerekmez.

Araçlar: mevcut frontend-patterns ve tdd-workflow bağlamı, Next CSS Modules
belgesi. Düşük etkili görsel kaldırma için yeni uygulama-ayna testi eklenmez;
mevcut galeri/rail testleri ve gerçek tarayıcı geometry+gesture kontrolü kullanılır.
Doğrulama: ilgili unit, lint/typecheck, Vercel ile aynı Turbopack build;
320/390/844/768/1440 responsive, reduced/noJS, mobil ileri/geri scroll ve
masaüstü ok/klavye. Paketli headless Chromium≤2, tüm owned süreçler kapanır.
Yayın: main push → exact-commit doğrulama CI → Vercel REST API → canlı QA.

## Durum: YEREL DOĞRULAMA PASS / API YAYINI SIRADA

Kanıtlar .cache/task-175/; son durum final-receipt.json içinde kaydedilir.

37 ilgili unit, lint, typecheck ve Turbopack production build PASS.
7 tarayıcı profili PASS: mobil/tabl. şerit display:none ve0yükseklik, desktop
kontrolleri görünür; ilk/son ürün klavye erişimi, dokunarak scroll, reduced/noJS.
Yerel makbuz `.cache/task-175/local-verification.json`.
