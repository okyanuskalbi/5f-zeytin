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

## Durum: BEKLİYOR
