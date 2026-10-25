> ONAY VERİLDİ (kullanıcı, 25 Eki 2026): "ok" + "Kart yerinde kalsın".

# Task 139: Hero ürün katmanı ince ayar (boyut, renk, kart boşluğu)

## Tür
frontend (yalnız CSS/token, yerel)

## Amaç
Task 138 ekran testinde masaüstünde iki sorun görüldü: teneke ve kavanoz sahneye göre büyük ve stüdyo ışıklı duruyor, "yapıştırılmış" hissi var. Kart yerinde kalacak; yalnız ürünler küçülüp sıcaklaşacak, kart biraz aşağı inecek.

## Kullanılacak araçlar
- `scroll-craft` (`references/hero-depth.md`), `frontend-design`. Coder Notu'na kısa skill tablosu.

## İstenen (yalnız `components/landing/SofraHero.module.css` ve gerekiyorsa `lib/ui-motion.ts`)
1. Masaüstü `.products`: `height: 44svh; width: 40svh` → `height: 38svh; width: 35svh`. Teneke/kavanoz oranı ve ortak taban aynı kalsın. `--table-contact` değişmez.
2. Renk: `.tin, .jar` filtresi `saturate(.94) brightness(.96) sepia(.06)` → `saturate(.86) brightness(.9) contrast(.96) sepia(.14)`. Etiket okunur kalmalı; beyaz alanlar parlamamalı.
3. Temas gölgesi biraz koyulaşsın: `.contactShadow` ilk durak `rgba(43,24,9,.48)` → `.58`, yüksekliği `8%` → `10%`.
4. Masaüstü kart: `.layout` alt boşluğu `56px` → `32px` (kart aşağı iner, ürünlerin daha çoğu görünür). Mobil (≤ 900 px) kurallarına dokunma.
5. Mobilde yalnız madde 2 ve 3'teki renk/gölge değişikliği geçerli olsun (aynı seçiciler zaten ortak).

## Kabul kriterleri
- [ ] Yalnız yukarıdaki değerler değişti; mobil yerleşim, hareket, yükleme ve reduced-motion davranışı aynı.
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.
- Tarayıcı ekran testi Claude'da.

## Yapılmaması gerekenler
- Görsel dosyalarına, kart içeriğine, metne, hareket değerlerine dokunma.
- `docs/tasks` içinde yalnız Coder Notu/Durum.

## Coder Notu
