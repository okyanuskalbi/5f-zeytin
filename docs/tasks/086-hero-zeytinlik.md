# Task 086: Hero'ya onaylı zeytinlik görseli + scroll videosu

## Tür
frontend

## Amaç
Hero'daki "görsel bekleniyor" alanını kaldırıp onaylı zeytinlik görselini tam genişlik hero arka planı yap; aynı sahnenin onaylı 5 sn videosunu kare dizisiyle scroll'da oynat.

## Bağlam
> ONAYLANDI (2026-10-20): Kullanıcı Claude'un hero provasını (`/private/tmp/.../hero-prova.png`: sol fildişi geçişli okunurluk katmanı, solda metin, sağda şişe/kase) gördü ve "ZEYTİN hero'suna zeytinlik görseli konsun mu? ok" dedi. Video onayı: "videolar ok".
Kaynaklar (salt okunur): görsel `~/PROJELER/AFINA-KAYNAK/sahne-gorselleri/adaylar/zeytin-v1.png` (+ `.webp`), onay `sahne-gorselleri/ONAY.md`; video `~/PROJELER/AFINA-KAYNAK/sahne-videolari/onayli/zeytin.mp4`, onay `onayli/ONAY.md` (SHA-256 orada). Bağımlı: 083 (ScrollFrameSequence), 085 (fontlar), 025/026 (hero).

## Kullanılacak araçlar
- ECC skill: motion-advanced, frontend-patterns, accessibility, verification-loop

## Adımlar
1. Görseli `public/images/hero/zeytinlik-2400.webp` ve `-1200.webp` olarak al; `docs/gorsel-onay.md` kaydına SHA-256 + kullanıcı kanıtıyla işle (manifest `approved`, `runtime=true`).
2. Videodan `extract-frames.mjs` ile 24 fps, 1920+960 → `public/frames/hero-zeytin/`; onay kaydı.
3. Hero: tam genişlik `ScrollFrameSequence` (poster = görsel), soldan sağa fildişi okunurluk gradyanı (prova ile aynı: %92 → %75 @32% → 0 @58%), metin solda; mobilde görsel üstte/arka plan alt hizalı, metin altta okunur. Menü görselin üstünde okunur kalsın (gerekirse header'a hafif fildişi zemin).
4. "Görsel bekleniyor" placeholder'ı kaldır. reduced-motion: statik görsel.

## Kabul kriterleri
- [ ] e2e: hero'da canvas/poster var, placeholder metni yok; scroll ile kare indeksi değişiyor; reduced-motion statik
- [ ] `check-assets` onay kontrolü geçer; `du -sh public/frames/hero-zeytin` ≤ 12 MB
- [ ] Mobil 390px ve masaüstü 1440px ekran görüntüsü `test-results/` altında, metin kontrastı WCAG AA
- [ ] lint/typecheck/build

## Coder Notu

- Onaylı dış kaynaklar yalnız okundu. PNG SHA-256: `a5e9683e842478222e73a08631d96892cdbe0e4cc2812ce7cac1b870bec76b79`; MP4 SHA-256: `a326b19c0ee6e830d987113359992a63da4ef20e8c64bf9196d0f67ce6d981b8`. İkisi de kaynak `ONAY.md` kayıtlarıyla eşleşti. Görsel temsili sahnedir; yeni görsel/video üretilmedi.
- Sharp 0.35.5 ile 2400×1350 ve 1200×675 WebP posterler hazırlandı (quality 84). Görevin 1. adımında açıkça istenen `docs/gorsel-onay.md` kaydı güncellendi; plan, diğer task belgeleri, özgün promptlar ve `_legacy/` korunmuştur. Posterler manifestte `approved`, `runtime=true`; kare onayı `public/frames/hero-zeytin/approval.json` dosyasının hash'ine bağlıdır.
- `node scripts/extract-frames.mjs /Users/emre/PROJELER/AFINA-KAYNAK/sahne-videolari/onayli/zeytin.mp4 public/frames/hero-zeytin --fps 24 --widths 1920,960 --quality 24` → her sette 121 kare. Kaynak süre 5,041667 sn. `du -sh public/frames/hero-zeytin` → **11M**; dosya toplamı yaklaşık **10,80 MiB**, 12 MiB altında. MP4 runtime'a kopyalanmadı.
- 21st MCP araması yapıldı (Hero With Pixel Background 29786 / Hero scroll animation 2838); onaylı provayı korumak için mevcut 21st kökenli Hero/HeroMotion ve Task 083 ScrollFrameSequence uyarlandı. Yeni UI bağımlılığı veya skill kurulmadı. shadcn bileşeni eklenmedi.
- Masaüstü okunurluk gradyanı birebir `%92 → %75 @32% → %0 @58%`. Mobilde görsel üstte, metin fildişi altta. Mevcut fildişi header korundu. Poster SSR HTML'de bulunur; önceden yüklenen görselin hydration sırasında kaçan `onLoad` olayı ele alınır. Reduced-motion kare istemez; manifest hatasında poster ve CTA'lar kalır.
- TDD RED: mevcut production build üzerinde `PLAYWRIGHT_BASE_URL=http://localhost:3104 npm run test:e2e -- tests/e2e/hero-zeytinlik.spec.ts --project=chromium-390 --grep 'approved grove'` → hero'da kare dizisi bulunmadığı için beklendiği gibi başarısız. 3004 portundaki mevcut süreç korunarak bu checkout'tan ayrı production sunucusu 3104'te çalıştırıldı.
- `npm run check:assets` → **PASS, 16 görsel**; ayrıca 243 WebP kare/poster dosyası, manifest, bağımsız kullanıcı onayı, kaynak referansı, bütün hash/ölçüler ve 12 MiB sınırı doğrulanır. Değiştirilmiş/eksik/fazladan kare, değiştirilmiş onay kaydı ve onaysız responsive poster testleri eklendi.
- `npm run test` → **173/173 geçti**. `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` → **PASS**.
- `PLAYWRIGHT_BASE_URL=http://localhost:3104 npm run test:e2e -- tests/e2e/hero.spec.ts tests/e2e/hero-motion.spec.ts tests/e2e/hero-zeytinlik.spec.ts` → Chromium + WebKit, 320/390/768/1440 px: **112/112 geçti**. İlk Firefox denemesi eksik executable nedeniyle başlamadı; `PLAYWRIGHT_BROWSERS_PATH=$PWD/.cache/playwright-browsers npx playwright install firefox` ile yalnız repo içindeki geçici dizine kuruldu. Aynı üç dosya `--project=firefox-320 --project=firefox-390 --project=firefox-768 --project=firefox-1440 --output=test-results/086-firefox` ve aynı `PLAYWRIGHT_BROWSERS_PATH`/`PLAYWRIGHT_BASE_URL` ile tekrar çalıştırıldı: **56/56 geçti**. Toplam **168/168 hero testi PASS**.
- `PLAYWRIGHT_BASE_URL=http://localhost:3104 npm run test:e2e -- tests/e2e/scenes.spec.ts tests/e2e/fonts.spec.ts tests/e2e/shell.spec.ts --project=chromium-390 --project=chromium-1440 --output=test-results/086-regression` → **32/32 geçti**. Eski placeholder/parallax ve sahne genelindeki sıfır-canvas beklentileri onaylı hero sözleşmesine uyarlandı; diğer sahnelerde canvas yoktur.
- Kabul görselleri: `test-results/086/hero-390.png`, `hero-1440.png`, `hero-reduced-390.png`; açılarak incelendi. Fotoğraf/gradyan/CTA/nav arka planı gerçek ekran piksellerinden, her metin satırının kapladığı alan boyunca ölçüldü; 0/%65/%100 scroll ve reduced-motion kontrolleri **WCAG AA PASS**. Üç tarayıcı/dört genişlik için en düşük oran **6,95:1**. Ölçümler ve 168 sonuç `test-results/086/verification.json` içindedir. Test çıktıları gitignore gereği yerel kalır.
- Ek denetim: `npm run test -- --coverage` içindeki 173 test geçer; genel coverage eşiği başarısızdır (satır %38,09, statement %36, function %42,85, branch %100; eşik %80). Değişiklik öncesi `e1857b3` commit'i repo içindeki geçici dizinde aynı komutla ölçüldü: 167/167 test geçerken **aynı oranlar ve aynı eşik hatası** oluşuyor. Bu mevcut açık hukuk/sepet sayfalarının kapsamıdır; Task 086'nın kabul kriteri değildir, kapsam dışı kod/test veya eşik değiştirilmedi.

## Durum: TAMAMLANDI
