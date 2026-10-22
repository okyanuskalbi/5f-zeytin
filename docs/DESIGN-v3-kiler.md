# ZEYTİN — Tasarım v3: "Sofradan kilere" (DESIGN.md)

## Karar geçmişi (21 Eki 2026)
- v1 (etiket) ve v2 (toprak/ışık doğuşu) kullanıcı tarafından reddedildi ("berbat, hiç beğenmedim").
  - Arşiv: `DESIGN-v1-etiket.md`, `DESIGN-v2-toprak.md`.
  - v2'nin Impeccable teşhisi: ürün fotoğrafı yok, hero gri geçişi bozuk, Doğal Kırma 5 kez tekrar, 3 farklı satın alma kutusu, taslak yazıları her yerde, neon bant.
- Impeccable new-work turunda 3 yön görsel taslak olarak sunuldu: Kırma Taşı, Kışlık Kiler, Kategori standardı.
  - Kullanıcı "Kiler + Standart" karışımını istedi. İki karışımdan **B**'yi seçti.
- Onaylı taslak: `.impeccable/mocks/decision/mix-b.webp` (yerel, gitignore). **Ölçülecek sözleşmedir**, ilham panosu değildir.
- Ürün gerçekleri: `PRODUCT.md`.
  - Perakende ağırlıklı.
  - Kahraman ürün Doğal Kırma.
  - Dört fark birlikte: Afina güvencesi, Düziçi, doğal kırma, kendi tesis.

## Fikir
Ziyaretçi önce **sofrayı** görür: Düziçi'nde şafakta kahvaltı, masada AFİNA tenekesi. Sonra **kilere** iner: yeşil badanalı duvar, ceviz raflar, her ürünün sicimle bağlı kraft fiyat etiketi.

Kiler, bu ürünü teneke teneke alıp kışa stok yapan Osmaniye ailesinin gerçek ritüelidir. Rakip bir "premium zeytin" sitesi bu sahneyi doğrulukla kuramaz.

## Onaylı görseller (21 Eki, kullanıcı onayı)
Kaynak: `~/PROJELER/AFINA-KAYNAK/zeytin-v3-gorseller/`. Onay kaydı ve SHA-256 `ONAY.md` içinde.

| Dosya | Kullanım |
|---|---|
| `hero-masaustu.webp` (3840×2160) | Hero masaüstü. Sol %45 sakin alan başlık için. |
| `hero-mobil.webp` (1152×2048) | Hero telefon. Üst %45 başlık için. |
| `kiler-duvar.webp` (3840×2160) | Kiler bölümünün zemini (badana + pencere ışığı). |
| `raf-ceviz.png` (şeffaf) | Ceviz raf tahtası. Alpha > 200 ile kırp, yatay tekrar/uzat. |
| `urun-01…06-*.png` (şeffaf, 1024×1536) | Raftaki ürünler. Alpha > 40 ile kırp. |
| `kargo-kolisi.png` (şeffaf, yalnız AFİNA logolu) | Kilerin alt rafı. |
| `kraft-doku.webp` | Fiyat etiketlerinin dokusu. |

- Tesis: `docs/referans/tesis/tesis-osmaniye-plaka-bulanik.jpg`. Plaka bulanık; kullanıcı onayı var.
- Stüdyo 4:5 ve sahne 16:9 ürün görselleri (`urun-gorselleri/onayli/`) hızlı görünüm galerisinde kullanılır.

## Renk
| Rol | Değer | Kullanım |
|---|---|---|
| kiler yeşili | `#243A29` (duvar görselinden örnekle, ±) | Kiler bölümü, footer, birincil buton |
| ceviz | `#5B3A22` | Raf kenarı, ikincil metin (kraft üstünde) |
| kraft | `#C9A97A` | Fiyat etiketi zemini (doku görseli) |
| altın | `#D4B483` | YALNIZ en önemli eylem: hero "Sepete ekle", etiket "Ekle" vurgusu |
| sofra beyazı | `#FAF7F0` | Güven şeridi ve tesis bölümü zemini |
| mürekkep | `#1C2A1F` | Açık zeminde metin |

- Gradyan yok. Tek istisna: hero metni için fotoğraf üstünde okunurluk perdesi.
- Neon fabrika yeşili kaldırıldı.

## Tipografi
Kullanıcının seçimi korunur: **Fraunces** (başlık, ürün adı) + **Figtree** (arayüz, fiyat, etiket).
- Hero başlığı: `clamp(56px, 7vw, 120px)`, en fazla 2 satır.
- Bölüm başlığı: `clamp(36px, 4.5vw, 64px)`.
- Etiket ürün adı: Fraunces 20–24px. Fiyat: Figtree 600, tabular.
- Gövde metni 17–18px. 13px'in altında yazı yok.

## Sayfa akışı (taslak B'ye göre)
1. **Sofra (hero):**
   - Tam ekran hero fotoğrafı.
   - Üstte ince beyaz menü: logo · Ürünler · Tesisimiz · Toptan · hesap · sepet.
   - Solda "Düziçi'nden sofranıza." ve altında "Doğal Kırma Yeşil Zeytin, kendi tesisimizde."
   - **Altın** buton "Sepete ekle — 10 kg · {fiyat}". Gerçekten sepete ekler; sahte link değildir.
   - Beyaz çerçeveli ikincil buton "Ürünleri gör", kilere kaydırır.
   - Telefonda dikey hero görseli kullanılır; başlık üstte.
2. **Kışlık kiler (vitrin):**
   - Yeşil duvar zemini. Ortada "Kışlık kiler" başlığı, iki yanında ince altın çizgi. Altında "Yıllık zeytin ve yağınızı tek seferde alın."
   - **Masaüstü:** 2 raf. Üst rafta 4 ürün, alt rafta kalanlar ve kargo kolisi.
   - **Telefon:** her rafta en fazla 2 ürün. Etiket ürünün altında tam genişlik ve dokunulabilir. Kraft etiket asla 44px'ten küçük dokunma hedefi içermez.
   - Ürünler HTML ile rafa oturur, raf görseli CSS ile uzar. Admin'den gelen 4–6 ürün aileye göre otomatik yerleşir.
   - **Kraft etiket = çalışan fiyat etiketi:** ad, boy seçici (varyant çipleri: 1 kg | 10 kg; 1 L | 5 L), fiyat, "Ekle".
     - Boy değişince fiyat rakam rakam döner. Sayfanın tek "canlı" etkileşimi budur.
     - Etiket sicimden hafif sallanır; reduced-motion'da sabit.
   - Ürüne ya da etikete dokununca **hızlı görünüm** açılır: masaüstünde sağ panel, telefonda alt sayfa. İçinde galeri (stüdyo + sahne), boy, adet, sepete ekle, kısa açıklama, "Toptan teklif".
   - **Ürün aileleri** (her aile tek ürün, boylar varyant):
     - Doğal Kırma Yeşil Zeytin: 1 kg kavanoz, 10 kg teneke.
     - Salamura Siyah Zeytin: 1 kg.
     - Natürel Sızma Zeytinyağı: 1 L, 5 L.
     - Salamura Yeşil Zeytin: 5 kg.
3. **Güven şeridi** (sofra beyazı): "Kargo 2–4 iş günü · PayTR ile güvenli ödeme · Kendi tesisimizde dolum"; ince zeytin yeşili çizgi ikonlarla. Kargo süresi şimdilik örnektir, açık karar.
4. **Tesis** (sofra beyazı):
   - Solda "Osmaniye'de, kendi tesisimizde." ve iki satır metin: Ellek, Düziçi · 2021'den bu yana · sofralık zeytin, salamura, zeytinyağı.
   - Sağda gerçek tesis fotoğrafı.
   - Altta "Toptan alım" satırı: teklif formuna giden buton. Form çalışmıyorsa formu gösterme; yerine "Toptan için bize yazın" ve telefon/e-posta (açık karar, şimdilik yer tutucu). "Henüz kullanıma açık değil" yazısı YOK.
5. **SSS:** Yalnız tam cümleli, teyitli cevaplar. Yarım cümle varsa o soru kaldırılır.
6. **Footer** (kiler yeşili):
   - Logo, linkler, satıcı bilgisi satırı (unvan · Düziçi VD · VKN), yasal linkler.
   - Topluluk logosu → afina.com.tr.
   - **Tek** önizleme notu: "Önizleme: fiyatlar ve görseller temsilidir." Dağınık "Örnek/Temsili" yazıları kaldırılır.

**Kaldırılanlar:**
- v2 hero ışık geçişi, HeroIntro satın alma kutusu, ScrollFrameSequence hero.
- Moments ("Topraktan sofraya" şeridi), neon tesis bandı, Osmaniye harita lekesi.
- 3'lü Doğal Kırma kartları ve öne çıkan teneke bölümü. Hero + kiler bu işi görüyor.

## Hareket (motion-framer + Emil Kowalski `animate`)
- **İmza:** Kiler girişinde raflar sırayla dolar. Ürünler rafa 12px yukarıdan "konur", spring kısa, stagger 70ms. Ardından etiketler sicimden sallanarak durur.
- **Fiyat:** Boy değişiminde rakam rakam dönüş (tabular, 180ms).
- **Sepete ekle:** bas → "Eklendi ✓" → sıfırla. Sepet rozeti zıplar. Çekmece her eklemede kendiliğinden AÇILMAZ; mini bildirim çıkar, çekmece rozetle açılır.
- **Hero:** Fotoğraf çok yavaş yakınlaşır (scale 1.00 → 1.04, scroll'a bağlı). Başlık girişte kelime kelime belirir.
- Yalnız transform ve opacity. `prefers-reduced-motion`'da hareket yok, içerik tam.

## Performans ve mobil (kabul)
- **Lighthouse mobil ≥ 85.**
- **LCP < 2.5 s:** Hero AVIF/WebP `srcset` ile verilir, masaüstü ≤ 180 KB, mobil ≤ 120 KB; `fetchpriority=high` + `preload`.
- Ürün PNG'leri AVIF/WebP'ye çevrilir (alpha korunur), en fazla 600px yükseklik. Kiler duvarı ≤ 150 KB.
- **CLS < 0.1, A11y ≥ 95.**
- **Cihazlar:** iPhone 14/SE (WebKit), Pixel 7 (Chromium), yatay mod. Dokunma hedefi ≥ 44px.
- **Kaydırma testi zorunlu:**
  - Her görevde masaüstü + iPhone + Pixel için %40 adımlı kare şeridi.
  - Boş ekran, kesik başlık ya da yarım bölüm olmamalı.
  - 120px tekerlek tıklarıyla footer'a ulaşılmalı.

## Ev kuralları
- tasteskill + Impeccable craft-floor.
- Eyebrow etiketi, 01/02 numaralandırma, hairline yığını, glassmorphism, ikon kutusu, emoji yok.
- Güven şeridindeki çizgi ikonlar istisnadır.
- En fazla 2 font.
- İddia kuralı: "%100 / organik / doğal ürün" iddiası yok.
