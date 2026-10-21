# ZEYTİN — Tasarım v2: "Topraktan sofraya" (DESIGN.md)

Tarih: 2026-10-20. Kullanıcı: "ZEYTİN SİTESİNİ HİÇ BEĞENMEDİM BAŞTAN YAP" → üç yön provası (A sinematik koyu, B aydınlık editoryal, C fabrika yeşili) → "21.DEV VE FRAMER MOTION UX/UI SKİLLERİ İLE EN İYİ SEÇENEKLERİ YAP" → **Claude kararı: A + B, C vurgu**. v1 (etiket nesnesi) reddedildi: `docs/DESIGN-v1-etiket.md` yalnız arşiv. Kaynaklar: `motion-framer`, `design-taste-frontend` ev kuralları ve kapısı, `profesyonel-web-sitesi`, dört kit (`~/PROJELER/AFINA-KAYNAK/kitler/ozet.md`), 21st.dev referansları (aşağıda).

## Fikir
Slogan sayfanın kendisidir: **"Kökü toprakta. Yeri sofrada."** Sayfa koyu, sinematik **toprakta** (zeytinlik, gece/şafak, A) başlar; kaydırdıkça ışık doğar ve sayfa aydınlık **sofraya** (krem zemin, net ürün fotoğrafları, satış, B) dönüşür. Duygu topraktan, satış sofradan gelir. Tesisin parlak yeşil-siyah cephesi (C) yalnız "Tesisimiz/Toptan" bölümünde vurgu.

## Korunanlar
Fraunces + Figtree (Z-A), logolar, onaylı zeytinlik görseli/videosu ve `ScrollFrameSequence`, sepet altyapısı (035–039 store/upsell), PayTR önizleme (001b), toptan form (081), yasal taslaklar (073), resmi metinler, iddia kuralı (%100/organik/sertifika yok), ≤ 6 ürün, plakası bulanık tesis fotoğrafı (yayın kullanıcı onayına bağlı).

## Renk
| Token | Değer | Kullanım |
|---|---|---|
| toprak | `#0D110D` | hero zemini, koyu bölümler |
| zeytin | `#243A29` | birincil düğme, başlık mürekkebi (açık zeminde), toptan bölümü |
| krem (sofra) | `#F6F1E6` | vitrin ve sonrası ana zemin |
| kum | `#EDE4D1` | yüzey ton adımı (kart arka planı yok; bölüm tonu) |
| altın | `#D4B483` | koyu zeminde birincil eylem, fiyat vurgusu |
| fabrika yeşili | `#6CCB3C` | YALNIZ Tesisimiz/Toptan bandı (tesis cephesi rengi) |
Gradyan yok. "Işık doğuşu" = scroll'a bağlı **düz renk** enterpolasyonu (toprak → krem), tek bir sabit geçiş bölümünde.

## Tipografi
Fraunces 500/700 (opsz, SOFT 50): display `clamp(64px, 10vw, 168px)` (hero), başlık `clamp(40px, 5vw, 76px)`, ürün adı 26–30px. Figtree 400/600/800: gövde 17–19px, fiyat 600 tabular, düğme 600. ≤ 5 boyut; başlık ≤ 2 satır; 13px altı yok.

## Sayfa akışı (bölümler = iddialar)
1. **Toprak (hero, koyu, sticky ~180vh):** zeytinlik kare dizisi tam boy (koyulaştırılmış), "Kökü toprakta." dev Fraunces sol alt; kaydırdıkça ikinci satır "Yeri sofrada." gelir ve **ışık doğar**: zemin toprak → krem, görüntü aydınlanır (brightness 0.55 → 1), metin krem → zeytin. Sağ altta altın "Ürünleri keşfet". Üst çubuk: logo, Ürünler · Tesisimiz · Toptan, sepet (adet rozeti) — renk zemine göre değişir.
2. **Sofra / Vitrin (krem):** başlık "Sofranıza" + bir cümle (resmi ürün kapsamı). ≤ 6 ürün **3×2 ızgara** (mobil tek kolon büyük kart; tablet 2 kolon): stüdyo görseli 4:5 (Atlas, onaylı), hover'da sahne görseline çapraz geçiş, ad, gramaj, fiyat, **hızlı ekle** (21st Add to Cart Button deseni: bas → yükleniyor → "Eklendi ✓" → sıfırla) + adet. Karta tıklayınca **hızlı görünüm** (sağ panel/mobilde alt sayfa): galeri, varyant/boy seçici, adet, sepete ekle, kısa açıklama, toptan linki. Kart çerçevesi/gölgesi yok; ayrım boşluk ve kum ton adımıyla.
3. **Öne çıkan: Doğal Kırma Yeşil Zeytin 10 kg (split stage):** sol yapışkan büyük teneke görseli, sağda kaydırılan metin: ürün hikâyesi (resmi metinden), kullanım, gramaj/boy seçimi, sepete ekle, "Toptan alım için teklif isteyin".
4. **Topraktan sofraya (süreç):** Hasat → Seçim → Kırma → Salamura → Dolum → Sofrada; yatay sürüklenen şerit (Framer Motion drag + ilerleme çubuğu). Süreç metinleri teyitsiz → yalnız adım adları + resmi tek cümle; görseller onaylı üretim gelince (aynı görsel iki kez YOK).
5. **Tesisimiz + Toptan (fabrika yeşili bandı, C):** tam genişlik yeşil bant, solda dev siyah "Osmaniye'de, kendi tesisimizde." ve bilgiler (Ellek/Düziçi/Osmaniye · sofralık, salamura, zeytinyağı · perakende + toptan · 2021'den bu yana), sağda tesis fotoğrafı (kullanıcı onayı gelince; yoksa Osmaniye silüeti); altında toptan formu (081) zeytin zemin üstünde.
6. **SSS (krem):** yalnız teyitli cevaplar (087), iki kolon okuma metni.
7. **Footer (toprak):** logo, kısa slogan, linkler, satıcı bilgisi satırı (unvan · Düziçi VD · VKN), yasal linkler, küçük Topluluk logosu → afina.com.tr.

**Sepet deneyimi:** sağdan açılan çekmece (mobilde alttan sayfa, sürükle-kapat), satır ekleme/silme `layout` + `AnimatePresence`, upsell (039) çekmecede, toplam ve "Ödemeye geç". İlk eklemeden sonra mobilde altta **mini sepet çubuğu** (adet · toplam · Sepet), güvenli alan içinde.

## Hareket (motion-framer)
- İmza hareket: **ışığın doğuşu** (hero sonu, `useScroll` + `useTransform` → zemin rengi, görüntü parlaklığı, metin rengi; düz renk).
- Bölüm girişleri: `whileInView`, `once`, başlık → metin → görsel, stagger 0.06–0.08, y 24px.
- Vitrin kartları: kademeli giriş; hover görsel çapraz geçiş; hızlı ekle durum makinesi (spring, `visualDuration 0.35, bounce 0.2`).
- Sepet: `AnimatePresence` + `layout`; rozet sayısı değişince küçük zıplama.
- `useReducedMotion`: ışık geçişi anlık, kare dizisi poster, giriş animasyonu yok.
- Yalnız transform/opacity/filter/renk; LCP öğesi animasyonsuz görünür.

## 21st.dev referansları (ilham; tokenlara uyarla, varsayılan bırakma)
Add to Cart Button `34564` (bidyut10) · Product Card `5650` (beratberkayg, Framer Motion) · Drawer `23558` (ddoemonn, yan panel + odak tuzağı) · Drawer `31360` (wensity, mobil alt sayfa + snap) · Thumbnail image viewer `37501` (ibrandify, hızlı görünüm galerisi). Kod: `mcp__21st__get_component` (günlük kota).

## Ev kuralları
tasteskill ev kuralları geçerli (eyebrow, 01/02, hairline, gradyan, durağan gölge, glass, ikonlu kart, emoji yok; ≤ 2 font). İç sayfa istisnası (`--allow few-pictures,focal-point,still-page`) yalnız iç sayfalarda.

## Performans ve mobil (zorunlu kabul)
Lighthouse mobil ≥ 85, LCP < 2.5 s (hero posteri ≤ 60 KB AVIF, fetchpriority=high; kare dizisi etkileşim/boşta), CLS < 0.1, A11y ≥ 95. iPhone 14/SE (WebKit), Pixel 7/Galaxy S20 (Chromium), yatay mod; dokunma ≥ 44px; mini sepet güvenli alan.

## Kapı
Her görev: `lint.mjs app components` 0 FAIL + production `inspect.mjs` bölüm FAIL 0 + 1440/768/390 + iPhone 14 ekran görüntüleri. AGENTS.md 'Yeniden kurgu ara görevleri' kuralı geçerli (global kapı 107).
