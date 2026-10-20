# Task 083: Scroll'a bağlı kare dizisi oynatıcısı (canvas)

## Tür
frontend

## Amaç
Bir videodan çıkarılmış WebP kare dizisini scroll pozisyonuna göre `<canvas>`'a çizen, yeniden kullanılabilir `ScrollFrameSequence` bileşeni (Apple tarzı scroll-scrub).

## Bağlam
Kullanıcı (20 Eki): "framlerine ayırıp scrolling ile gelsin", "videolama yapabilirsin, atlas gerekiyorsa". Kullanımlar: KURUMSAL marka sahnelerinde onaylı görselden üretilen 5 sn videolar (037) ve ZEYTİN hero/ürün (084). Kullanıcının kurumsal videosu KULLANILMAZ (20 Eki: "video kullanmana gerek yok metni yeter"); yalnız metni Hikâyemiz manifestosunda. Bağımlı: 025 (hero).

## Kullanılacak araçlar
- ECC skill: motion-advanced, motion-patterns, frontend-patterns, accessibility, tdd-workflow
- 21st MCP: hayır (özel canvas bileşeni)
- Skill rehberi: `~/.claude/skills/cinematic-hero-video/references/scroll-scrub.md` (canvas alternatifi)

## Dokunulacak dosyalar
- `components/media/ScrollFrameSequence.tsx`, `lib/media/frames.ts`, `scripts/extract-frames.mjs`, testler

## Adımlar
1. `scripts/extract-frames.mjs <video> <çıkış-klasörü> --fps 24 --widths 1920,960 --quality 72`: ffmpeg ile `frame-0001.webp…` + `manifest.json` ({count, fps, widths, aspect, poster}). Poster = ilk kare (ayrıca `poster.webp`).
2. Bileşen props: `src` (manifest yolu), `scrollLength` (vh, varsayılan 300), `fit` ('cover'|'contain'), `children` (üstteki metin katmanı), `blurFill` (contain modunda kenarları bulanık aynı kareyle doldur; opsiyonel).
3. Davranış: sticky 100vh sahne; Framer Motion `useScroll({target})` → `useTransform` → kare indeksi; çizim `requestAnimationFrame`; DPR'ye göre canvas boyutu; ekran genişliğine göre 960/1920 seti; önce poster + ilk ~15 kare, kalanı `IntersectionObserver` yaklaşınca kademeli ön yükleme (eşzamanlı ≤6 istek); yüklenmemiş kare için en yakın yüklü kare.
4. `prefers-reduced-motion: reduce` → yalnız poster (statik), scrub yok. Mobilde (<768px) 960 seti, `scrollLength` %70.
5. Metin katmanı scroll ilerlemesine bağlanabilsin (`progress` MotionValue children'a render-prop ile).
6. Testler: kare indeksi hesabı (birim), reduced-motion poster (e2e), yükleme sırası (birim, mock Image).

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/frame-sequence.test.ts` başarılı
- [ ] `npm run test:e2e -- tests/e2e/frame-sequence.spec.ts` başarılı (demo sayfası `/__demo/frames` yalnız dev'de; prod build'de 404)
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı
- [ ] Lighthouse/Playwright: kareler lazy, ilk yüklemede ≤ 20 kare isteği

## Yapılmaması gerekenler
- `<video currentTime>` scrub kullanma (titrer); kare dizisi + canvas.
- Kareleri repoya 50 MB üstü koyma; her dizi ≤ 12 MB (1920 set) hedefi.

## Durum: BEKLİYOR
