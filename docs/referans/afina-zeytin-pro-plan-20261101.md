---
name: afina-zeytin-pro-plan
description: afinazeytin.com'un "pro" yeniden yapım planı — marka kararları, Imagen + Flow medya hattı, Motion mimarisi, 21st.dev MCP bileşen listesi, kopyala-yapıştır master build prompt
created: "2026-11-01"
---

# AFİNA ZEYTİN — Pro Yeniden Yapım Planı

> Mevcut site (afinazeytin.com) iyi bir temel: tek sayfa, güçlü başlık ("Kökü toprakta. Yeri sofrada."), fiyatları açık ürün listesi, B2B + B2C ikisi de düşünülmüş. Bu plan o temeli **üretim kalitesine** taşır: sinematik hero, scroll ile yatay ürün galerisi, spring mikro-etkileşimler.
>
> Yığın: **Imagen** (görseller) → **Flow/Veo** (hero döngüsü) → **Codex/Claude Code** (kod) → **Motion** (animasyon) → **21st.dev MCP** (bileşenler). Kendi aboneliklerinle, ajans yok.

## 01 · Önce Ne Korunur, Ne Değişir

**Korunur (zaten doğru olan):**
- Başlık dili: "Kökü toprakta. Yeri sofrada." — marka sesi bu, dokunma.
- Şeffaf fiyat politikası — B2B sitesinde nadir ve güven veren.
- Tek sayfa akışı: hero → tesis → ürünler → hikâye → B2B → FAQ.
- Şişe ürün görseli (zeytinlik + denek arka plan) — görsel dilin standardı, devam ettir.

**Değişir (pro'ya taşınacaklar):**
- Hero'daki statik ağaç fotoğrafı → **5 sn'lik Flow/Veo döngüsü** (rüzgârda dallar, parlayan zeytinler).
- Ürün galerisindeki tıklama-yatay-kaydırma → **scroll'a bağlı yatay scrub** (sitenin en "ajans işi" olacak anı).
- Kuru bölüm geçişleri → Motion giriş sekansları + `whileInView` stagger'lar.
- Kapalı teklif formu → çalışan form + WhatsApp fallback (B2B dönüşümü burada).

## 02 · Marka Kimliği Kararları (önce bunlar, sonra kod)

Slop listemde "neon lime→zümrüt degrade" yasak — **ama AFİNA'nın yeşili markanın kendisi** (tesis binası, logo). Çözüm: yeşil kullan, klisheyi değil:

| Rol | Renk | Neden |
|---|---|---|
| Ana | **AFİNA yeşili** (tesis fotoğrafından örneklenmiş canlı yeşil) | Marka gerçeği — taviz yok |
| Nötr 1 | Sıcak kireç / taş beji | Osmaniye toprağı, kırma zeytin taşı |
| Nötr 2 | Koyu antrasit / zeytin karası | Kontrast, "natürel" his |
| Vurgu | **Zeytinyağı altını** | Hasat yağı rengi; fiyat ve CTA'larda |

**Font çifti:** Başlıkta **Fraunces** (karakterli serif — rustik ama premium, zeytin hikâyesine uygun) + gövdede **Inter** (okunaklı sans). Mevcut sitedeki amblemli/logo fontu başlıklarda kullanılmaz — o sadece logoda kalır.

**8px sistemi:** 8 / 16 / 24 / 32 / 48 / 64 / 96. Kırık simetri: metin blokları sola yaslı, görseller grid'i delsin.

## 03 · Medya Hattı

### Adım A — Hero karesi (Imagen, Codex içinden)

```
An ancient olive tree with a thick, gnarled trunk standing in a sunlit
olive grove in the Düziçi plain, Osmaniye, southern Turkey. Rolling hills
and distant mountains in the hazy golden-hour background. Green olives
glow on the branches in the right foreground. Warm cinematic light,
soft lens flare, gentle morning haze. Photorealistic, shallow depth of
field, 16:9, no text, no watermark.
```

### Adım B — Hero döngüsü (Flow / Veo, image-to-video)

Kareyi Flow'a yükle:

```
Animate this scene: the olive branches sway very gently in a light
breeze, individual olives catching the sunlight with subtle glints.
The golden haze drifts slowly across the distant hills. Slow, subtle
camera push-in towards the ancient trunk. Calm, meditative motion —
no fast movement, no shake. Seamless 5-second loop with identical
start and end frames, cinematic, photorealistic 4K.
```

> Dikiş görünürse 2-3 kez üret. **Omni Chrome Use** ile bu işi oturum açık Chrome'dan otomasyona da bağlayabilirsin (kredi kendi Flow aboneliğinden düşer).

### Adım C — Ürün görselleri (Imagen)

Mevcut şişe görselinin dilinde, her ürün için tek sahnede tutarlı mockup serisi:

```
Product photography: a [500 ml glass bottle of extra virgin olive oil /
1 kg glass jar of cracked green olives / 5 kg plastic salamura bucket]
with a minimal cream and olive-green label reading "AFİNA", placed on
a weathered stone table. Blurred olive grove and Aegean coastline in
the golden-hour background, small white ceramic bowl beside it.
Consistent warm cinematic light across the series. Photorealistic,
4K, no watermark.
```

## 04 · Sayfa Mimarisi (7 bölüm, tek sayfa)

```
01 HERO        video loop + glass nav + başlık + 2 CTA (stagger giriş)
02 GALERİ      scroll'a bağlı YATAY ürün kartları (fiyatlı) ← pro anı
03 TESİS       sticky görsel + parallax: "Üretimin adresi: Ellek"
04 HİKÂYE      "Topraktan sofraya" 3 adım (bento, kırık simetri)
05 B2B         3 segment kartı: Otel & Restoran / Market & Bayi / Toplu Tüketim
06 TEKLİF      çalışan form + WhatsApp butonu (kapalı notu yerine)
07 FAQ+FOOTER  akordeon SSS + iletişim
```

## 05 · Motion Planı

| Bölüm | Animasyon | Not |
|---|---|---|
| Hero | blur+fade stagger (0.2s delayChildren, 0.08 stagger) | tek giriş sekansı |
| Hero video | scroll parallax scale 1→1.1 | `useScroll` target hero |
| Galeri | `scrollYProgress` → `x` lineer scrub | **spring YOK** — kart kayması video gibi hissetmeli |
| Tesis | görsel `y` parallax 0→120 | whileInView yok, sürekli bağlı |
| Hikâye/B2B | `whileInView once:true`, y 32→0 | tekrar tetiklenmesin |
| Kartlar | `whileHover scale 1.03` + altın kenarlık parlaması | `stiffness 400, damping 25` |
| Genel | `useReducedMotion()` → tüm hareket kapanır | zorunlu |

## 06 · 21st.dev MCP — Çekilecek Bileşenler

```
21st search: "floating glass navbar react tailwind"        → nav
21st search: "horizontal scroll product cards gallery"     → galeri iskeleti
21st search: "product card price badge react"              → ürün kartı
21st search: "bento grid features section"                 → hikâye 3 adımı
21st search: "pricing three tiers cards"                   → B2B segmentleri
21st search: "contact form with whatsapp button react"     → teklif formu
21st search: "accordion faq react tailwind"                → SSS
```

Her çekilen bileşen: AFİNA yeşili + Fraunces/Inter + 8px sistemiyle uyarlanır; animasyonlar Motion ile sen eklenir.

## 07 · MASTER BUILD PROMPT (Codex / Claude Code'e yapıştır)

```
Build the production website for AFİNA ZEYTİN (afinazeytin.com) — an
olive and olive oil producer in Ellek, Düziçi, Osmaniye, Turkey.
B2C + B2B. Single-page React + TypeScript + Vite + Tailwind CSS +
lucide-react + motion (npm i motion, import from "motion/react").

## BRAND TOKENS (CSS variables)
--brand: #84CC16;            // AFİNA canlı yeşili (tesisten örnekli)
--stone: #EDE8DD;            // sıcak kireç beji
--ink: #1C1F1A;              // zeytin karası
--gold: #C89B3C;             // zeytinyağı altını (fiyat + vurgu)
Fonts: Fraunces (headings, weights 400-600, optical sizing) + Inter
(body). 8px spacing scale: 8/16/24/32/48/64/96.

## DESIGN RULES
- NO purple/blue gradients, NO neon lime→emerald gradient. Brand green
  is used as FLAT color + olive-tone surfaces.
- NO emojis; lucide icons only, single style family.
- Broken symmetry: left-aligned text blocks, images break the grid.
- Every section has ONE message. Real Turkish copy, no lorem ipsum.
- Animations: transform+opacity only, springs (stiffness 120-300,
  damping 20-30). Single entrance sequence on load, then calm.
  whileInView with once:true. useReducedMotion() disables all motion.
- Horizontal product gallery scrubs LINEARLY with scroll (useScroll →
  x transform, NO spring).

## SECTIONS (Turkish copy)
01 HERO — full-screen background video loop (/hero-loop.mp4, autoPlay
   muted loop playsInline, bg-black fallback), subtle bottom gradient.
   Glass pill nav: AFİNA logo (leaf lucide icon) | Ürünler, Tesisimiz,
   Hikâyemiz, SSS | "Kurumsal Teklif" button (brand green). Headline:
   "Kökü toprakta. Yeri sofrada." Sub: "Osmaniye'den zeytin ve
   zeytinyağı. Sofranız ve işletmeniz için." CTAs: "Ürünleri Keşfet"
   (solid brand green) + "Kurumsal Teklif Al" (glass). Stagger blur-fade
   entrance.
02 GALERİ — sticky viewport, horizontal scrub. Product cards: image,
   name, size, price in gold, B2B hint tag. Products: 1 kg Doğal Kırma
   Yeşil Zeytin ₺220 · 5 kg Salamura Yeşil Zeytin ₺1.100 · 1 kg
   Salamura Siyah Zeytin ₺220 · 1 L Natürel Sızma Zeytinyağı ₺350 ·
   5 L Natürel Sızma Zeytinyağı ₺1.750 · 10 kg Doğal Kırma Yeşil Zeytin
   ₺2.200. Hint: "Kaydırdıkça keşfedin."
03 TESİS — split layout, parallax facility image: "Üretimin adresi:
   Ellek." + address block (Ellek / Düziçi / Osmaniye) + 3 stat
   (Ellek beldesi, aile işletmesi, hasat dönemi).
04 HİKÂYE — bento: Toprağımız / Tesisimiz / Sunumumuz.
05 B2B — 3 cards: Otel & Restoran, Market & Bayi, Toplu Tüketim +
   note: ambalaj, minimum sipariş ve teslimat teklif aşamasında.
06 TEKLİF — working form (name, business type select, product interest,
   quantity, city, phone) + prominent WhatsApp button. Success state
   with AnimatePresence.
07 FAQ + FOOTER — accordion (5 questions from current site) + footer
   with address, phone, "AFİNA Şirketler Topluluğu" marka notu.

## ASSETS
I'll add to /public: hero-loop.mp4, facility.jpg, product-1..6.jpg.
Use semantic placeholders until then (bg-stone with product initials).

## FINISH CONDITION
Show screenshots of all 7 sections + explain where each brand token,
spacing value, and Motion decision was applied. No "it's done" without
evidence.
```

## 08 · Yayın Öncesi Checklist

- [ ] Hero döngüsü: dikişsüz, <8 MB, `autoPlay muted loop playsInline`
- [ ] Galeri scrub: hızlı kaydırmada kartlar takip ediyor, atlamıyor
- [ ] Tüm görseller webp/optimize, LCP < 2.5s
- [ ] reduced-motion aktifken site tam kullanılabilir
- [ ] Mobilde yatay galeri dokunmatik kaydırmayla da çalışıyor
- [ ] Form + WhatsApp butonu gerçekten mesaj gönderiyor
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95
- [ ] SEO: title "Afina Zeytin | Düziçi'nden Zeytin ve Zeytinyağı",
      OG görseli (şişe sahnesi), FAQ schema markup

## 09 · Süre Tahmini

| Aşama | Süre |
|---|---|
| Medya (Imagen + Flow, 2-3 tur) | ~45 dk |
| Kod (master prompt + 21st bileşenleri) | ~60-90 dk |
| Ayar + mobil test | ~30 dk |
| **Toplam** | **~2.5-3 saat** |

> Bu sitenin "ajansa 19.000 $" versiyonu farkı: hero video döngüsü,
> yatay scroll galeri ve motion karakteri. Gerisi zaten sende.
