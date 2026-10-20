# Task 084: ZEYTİN hero ve ürün sahnelerinde kare dizisi

## Tür
frontend

## Amaç
Hero (tesis/zeytinlik → şişe) ve ürün sahneleri (şişe dönüşü, yağ akışı, teneke) onaylı 5 sn videolardan kare dizisiyle scroll'da oynasın.

## Bağlam
> BLOKE: Önce tesis fotoğrafı (004/005) ve ürün görselleri (018–023) üretilip kullanıcı onayı alınır; sonra Atlas ile image→video üretilir, onaylı videolar `~/PROJELER/AFINA-KAYNAK/zeytin-videolari/onayli/` altına gelir. Bağımlı: 083, 025, 031.

## Adımlar
1. Her onaylı video → `extract-frames.mjs` 24 fps, 1920+960 → `public/frames/<ad>/`.
2. Hero: `ScrollFrameSequence` 300vh, "Kökü toprakta. Yeri sofrada." progress ile giriş. Ürün kartı sahnesi: kart başına kısa dizi (≤ 72 kare) kart görünür olunca scroll ile.
3. Onay kaydı her dizi için hash + kullanıcı kanıtı.

## Kabul kriterleri
- [ ] `public/frames/*/manifest.json` mevcut; her dizi ≤ 12 MB
- [ ] e2e scroll + reduced-motion
- [ ] lint/typecheck/build

## Durum: BEKLİYOR
