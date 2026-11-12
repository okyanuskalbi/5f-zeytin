# Task 207: Tasarım dili v3 — tüm cihaz QA + yayın

> Yöntem ve rapor biçimi: `docs/tasks/202-kimi-tum-cihaz-qa.md` + `output/task202/RAPOR.md`. Sözleşme: `docs/DESIGN.md` (v3), `docs/MASTER-PROMPT.md` (v2.0) §13, §14.1.

## Tür
QA (yalnız analiz) + yayın (Claude, kullanıcı onayıyla)

## Bağımlılık
206 TAMAMLANDI.

## QA (yazan ajandan **farklı** ajan yapar; Kimi kotası varsa Kimi, yoksa diğeri)
- 38 rota × §13'teki 15 cihaz × Chromium + WebKit; akışlar (202 listesi); her ekran görüntüsü gözle incelenir.
- v3'e özel ölçümler: bütün `[data-pill]` (hap, ≥ 44 px, tek satır), font aileleri ve Türkçe glifler, köşe tablosu dışı yarıçap 0, mühür yalnız Hasat + Hakkımızda, koyu bant sayısı, fotoğraf üstü yazı karşıtlığı.
- Bilinen test tuzağı: `DeferredPhoneField` alanı görünür alana girince yüklenir; test önce kaydırır/odaklar.
- Yalnız `output/task207/` ve `AFINA-KAYNAK/araclar/207/` altına yazılır; repo dosyası değişmez, kayıt yok, canlıya istek yok.
- Teslim: `output/task207/RAPOR.md` + `rapor.json` (özet, sorun tablosu, sorunsuzlar, ölçülemeyenler, §14.1 sayfa bazında). Son satır: `207 QA BİTTİ`.

## Düzeltme döngüsü
Claude bulguları `## Düzeltme 207-x` olarak yazar → yazan ajan uygular → yalnız ilgili sayfa × cihaz yeniden ölçülür. Kritik/Yüksek 0 olunca K6.

## Yayın (Claude; **K6: kullanıcı "yayına al" der**)
Önizleme PDF/video hazırlanmaz (kullanıcı kararı, 12 Kas). push → CI `vercel-yayin.yml` yeşil → yeni `.cache/task-204-207-yayin/deploy.py` (`prepare / preflight / upload / create <ciRunId> / status`) → canlı kontrol (sayfalar 200, 404 doğru, `/admin` + `/api/account` 401, videolar 206) → geri dönüş notu: önceki canlı `dpl_7BNv49JbjcWeYyAU3S8qUPkNLyp8` (`0dd0222`).

## Durum: BEKLİYOR (206 sonrası)

> **Not (12 Kas):** 207, `docs/tasks/208-tek-sayfa-landing.md` bittikten sonra çalışır; QA kapsamı tek sayfa yapısına, yönlendirmelere ve mobil kabule göre güncellenir.
