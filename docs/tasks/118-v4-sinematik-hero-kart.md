# Task 118: v4 "Sinematik sofra" — temel, hero ve satın alma kartı

## Tür
frontend

## Amaç
v3 "kiler" reddedildi; kullanıcı Fable provası **D "Sinematik sofra"**yı onayladı ("d ok"). Bu görev v4 temelini kurar: koyu zemin tokenları, sabit nav, tam ekran hero ve hero üstündeki satın alma kartı. Sonraki görevler (119–122) bu temelin üstüne gelir.

**Sözleşme (birebir ölçülür):**
- `docs/DESIGN.md` (v4).
- Prova HTML: `~/PROJELER/AFINA-KAYNAK/araclar/log/fable/mock/d.html` (oku; CSS değerleri ve düzen referanstır).
- Prova kareleri: aynı klasörde `mock-d-masa-00..06.png`, `mock-d-tel-00..07.png`.
Prova HTML'i kopyalanmaz; React/CSS Module ile aynı ölçülere getirilir.

## Kullanılacak araçlar
- Skill: `frontend-patterns`, `tdd-workflow`, `motion-foundations`, `motion-patterns`, `impeccable` (craft-floor), `cinematic-hero-video` (yalnız "Mod A loop" scrim/poster kuralları; video yok).
- 21st MCP: "hero with product card" ara; yalnız düzen fikri, stil projenin token'larından.

## Varlıklar (hepsi onaylı, elde; yeni görsel üretme)
- Hero: `v3Image("hero-masaustu")` ve `v3Image("hero-mobil")` (manifest, AVIF/WebP srcset). Provadaki `d/hero.webp` = `hero-masaustu.webp`, `d/hero-m.webp` = `hero-mobil.webp` (md5 doğrulandı).
- Kart görseli: `v3Image("urun-01-kirma-10kg")` (şeffaf PNG/AVIF çıktıları).

## Adımlar
1. **Tokenlar** (`app/globals.css`): v4 rolleri ekle, krem zemini kaldır.
   - `--ink:#0E1510` (sayfa zemini), `--zeytin:#1F3324`, `--zeytin-2:#2A4532`, `--altin:#D4B483`, `--altin-2:#E6CB97`, `--sut:#F7F3EA`, `--gri:#B9C0B6`.
   - `--background: var(--ink)`, `--foreground: var(--sut)`; `--primary: var(--altin)`, `--primary-foreground: var(--ink)`. shadcn/radix token eşlemelerini (card, popover, border, ring, input) koyu zemine göre güncelle; sepet çekmecesi, dialog, iç sayfalar (`/sepet`, `/odeme`, `/hesabim`, `/kvkk` vb.) koyu zeminde **okunur** kalmalı (kontrast ≥ 4.5:1). İç sayfalar için gerekiyorsa `--surface: var(--sut)` kart yüzeyi kullan.
   - Font: Fraunces 400/500/600 (+ italik yalnız hero `em` için, `app/fonts` içinde italik yoksa `font-synthesis: none` ile düz italik **kullanma**; italik yüz yoksa `em`'i altın renk + 400 ağırlıkla ayır). Figtree 400–800.
   - 8px boşluk ölçeği; başlık clamp değerleri DESIGN.md'den.
2. **Nav** (`components/site/Navbar.tsx` + module): sabit, saydam başlar; 40px sonra `rgba(14,21,16,.72)` + blur 14px + alt çizgi `rgba(255,255,255,.08)`. Sol logo "AFİNA / ZEYTİN" (küçük altın alt satır), orta linkler (Ürünler `/#urunler`, Tesisimiz `/#tesisimiz`, Toptan `/#toptan-iletisim`, SSS `/#sik-sorulanlar`), sağ "Sepet (n)" hap düğmesi (mevcut MiniCart/CartDrawer tetikler) + Hesabım. Telefonda linkler mevcut Dialog menüde. Mevcut anchor id'leri **değişmez**.
3. **Hero** (`components/landing/SofraHero.tsx` + module yeniden yazılır; `Hero.tsx` preload mantığı korunur):
   - `100svh`, `min-height:640px`, foto `object-fit:cover`, Ken Burns 18 s `scale(1.02→1.10) translateY(0→-2%)` ease-in-out alternate; reduced-motion'da yok. Mevcut `useScroll` scale'i kaldır (tek hareket: Ken Burns).
   - Scrim: provadaki dört duraklı dikey gradyan (masaüstü ve telefon ayrı).
   - İçerik ızgarası masaüstü `1.2fr .8fr`, alta hizalı, alt boşluk 56px. Sol: kicker "ELLEK, DÜZİÇİ · OSMANİYE" (13px, .22em, altın), `h1` "Düziçi'nden / *sofranıza.*" (`clamp(52px,6.4vw,96px)`, ≤2 satır, `max-width:9ch`), açıklama 19px `#E4E0D4` ≤48ch: "Doğal kırma yeşil zeytin, salamura zeytin ve natürel sızma zeytinyağı. Kendi tesisimizde seçilir, dolum yapılır, kapınıza gelir.", iki hayalet düğme (Ürünleri gör `#urunler`, Tesisimiz `#tesisimiz`; yumuşak kaydırma, URL'de hash yazmadan `history.replaceState` kalıbı mevcut koddan).
   - Sağ: **satın alma kartı** — süt zemin `.96`, radius 20, grid `96px 1fr`, gölge `0 30px 60px rgba(0,0,0,.45)`; teneke görseli 96×118 contain + drop-shadow; `h3` 24px "Doğal Kırma Yeşil Zeytin"; boy anahtarı **1 kg | 10 kg teneke** (gerçek varyant seçimi: `sample-green-olive-1kg` / `sample-green-olive-10kg`, seçili = zeytin dolgu beyaz yazı, yan yana hap; `feedback_iki_secenek_anahtar` kuralı: açılır liste yok); fiyat 30px 800 tabular (seçili varyantın `priceKurus`); "Sepete ekle" düğmesi `btn dark` (zeytin dolgu, beyaz yazı, hap, 14×22px). Mevcut `cart.store.addItem(id,1)`, "Eklendi" geri bildirimi, stok hatası, `role=status` korunur. Stokta olmayan varyant: düğme "Ürün şu an mevcut değil" ve `disabled`; **disabled stilde opacity ≤ .4 YASAK** (iOS'ta soluk görünüyordu, 115'te düzeltildi; koru).
   - Telefon (≤900px): başlık üstte (`padding-top:100px`, `clamp(44px,13vw,64px)`), açıklama ve hayalet düğmeler gizli, kart altta `position:absolute; left/right:18px; bottom:22px`, kart grid `72px 1fr`, görsel 72×92, `h3` 19px, fiyat 24px. Kart hero'nun dışına taşmaz; başlık ile kart arasında ≥ 24px boşluk (iPhone SE 375×667'de de).
   - Alt ortada "KAYDIR" ipucu (11px .2em) + 38px ince çizgi animasyonu; telefonda gizli; reduced-motion'da hareketsiz.
   - LCP: hero `<img>` `fetchpriority=high`, mevcut `<link rel=preload imagesrcset>` korunur; masaüstü ≤ 180 KB, telefon ≤ 120 KB en büyük kaynak (manifest çıktılarıyla doğrula, gerekirse `scripts/prepare-v3-assets.mjs` kalite ayarı).
4. **Sayfa iskeleti** (`app/page.tsx`): sırayı v4'e göre kur: Hero → (119 Güven şeridi + Ürünler) → (120 Öykü + Kahraman) → (121 Toptan + SSS) → Footer. Bu görevde 119–121 bölümlerinin yerine mevcut `Pantry`, `TrustStrip`, `Facility`, `Faq` **geçici** olarak koyu zeminde okunur kalacak şekilde kalır (tokenlar değiştiği için kontrastı kontrol et; kırmızı test bırakma).
5. **Testler**: `tests/unit/sofra-hero.test.tsx` ve `tests/unit/v3-foundation.test.tsx` v4'e göre güncellenir (kart varyant anahtarı, fiyat, sepete ekle, disabled durumu, nav linkleri, token değerleri). E2E `tests/e2e/sofra-hero.spec.ts`, `hero-*.spec.ts` yeni seçicilerle güncellenir (çalıştırma; Claude çalıştırır).

## Kabul kriterleri
- [ ] `globals.css` v4 token değerleri birebir; `--background` ink (unit).
- [ ] Hero'da `h1` "Düziçi'nden sofranıza." ≤ 2 satır 390/768/1440'ta (Claude doğrulayacak).
- [ ] Kartta iki boy anahtarı, seçime göre fiyat `₺220` / `₺2.200`, "Sepete ekle" sepete gerçek varyantı ekler (unit + e2e).
- [ ] Telefonda kart alt kenarda, başlıkla çakışmaz; iPhone SE/14 ve Pixel 7 kareleri prova `mock-d-tel-00.png` ile aynı yerleşim (Claude).
- [ ] Nav 40px sonra koyu/blur; linkler mevcut anchor'lara gider (unit).
- [ ] `prefers-reduced-motion`: Ken Burns ve ipucu animasyonu yok; içerik/CTA tam (unit).
- [ ] Sepet çekmecesi ve `/sepet`, `/odeme`, `/hesabim`, `/kvkk` koyu tokenlarla okunur; metin kontrastı ≥ 4.5:1 (Claude ölçer; sen görsel kontrol et).
- [ ] `npm test`, lint, typecheck, build yeşil.

## Yapılmaması gerekenler
- Yeni görsel/video üretme; onaysız görsel kullanma.
- Krem/fildişi zemin bölüm olarak kullanma (yalnız kart ve iç sayfa yüzeyi).
- Lenis/yeni scroll kütüphanesi ekleme; yalnız `motion`.
- Fiyat/ürün gerçeği değiştirme (temsili fiyatlar `static-products.ts`'de kalır).
- Ödeme, sepet mantığı, Supabase'e dokunma.
- `docs/` değiştirme (yalnız bu dosyanın Coder Notu/Durum).

## Durum: BEKLİYOR
